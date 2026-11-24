// Máy trạng thái thuần cho điều hướng cảnh, phát video hover, ngoại thất và hộp thoại

export type DetailId = 'drive' | 'battery';
export type ScenePhase = 'overview' | 'entering' | 'detail' | 'returning';
export type HoverSystem = 'drive' | 'battery';
export type PoseState = 'neutral' | HoverSystem;
export type VideoPhase = 'idle' | 'playing-forward' | 'holding' | 'playing-reverse' | 'frozen';
export type AppearanceCategory = 'paint' | 'wheels';

export interface TimingConfig {
  enterDetailMs: number;
  returnOverviewMs: number;
  appearanceLeaveMs: number;
  appearanceCloseMs: number;
  videoWatchdogMs: number;
}

// Hằng số thời gian đặt tập trung tại một chỗ
export const TIMING: TimingConfig = {
  enterDetailMs: 700,
  returnOverviewMs: 600,
  appearanceLeaveMs: 360,
  appearanceCloseMs: 220,
  videoWatchdogMs: 6500,
};

export interface InteractionLockInput {
  scenePhase: ScenePhase;
  isAboutOpen: boolean;
  isAppearanceOpen: boolean;
  isAppearanceClosing: boolean;
  isMediaLoading: boolean;
}

export function isOverviewInteractive(input: InteractionLockInput): boolean {
  return (
    input.scenePhase === 'overview' &&
    !input.isAboutOpen &&
    !input.isAppearanceOpen &&
    !input.isAppearanceClosing &&
    !input.isMediaLoading
  );
}

export function canEnterDetail(input: InteractionLockInput): boolean {
  return isOverviewInteractive(input);
}

export function canExitDetail(scenePhase: ScenePhase, isAboutOpen: boolean): boolean {
  return scenePhase === 'detail' && !isAboutOpen;
}

export function canRequestHoverPose(input: {
  scenePhase: ScenePhase;
  isAboutOpen: boolean;
  isAppearanceOpen: boolean;
  isAppearanceClosing: boolean;
  reducedMotion: boolean;
}): boolean {
  return (
    input.scenePhase === 'overview' &&
    !input.isAboutOpen &&
    !input.isAppearanceOpen &&
    !input.isAppearanceClosing &&
    !input.reducedMotion
  );
}

export type EscapeAction = 'close-about' | 'close-appearance' | 'exit-detail' | 'none';

// Thứ tự ưu tiên phím Escape: đóng hộp thoại giới thiệu trước, sau đó tới menu ngoại thất hoặc chi tiết
export function resolveEscapeAction(state: {
  isAboutOpen: boolean;
  isAppearanceOpen: boolean;
  scenePhase: ScenePhase;
}): EscapeAction {
  if (state.isAboutOpen) return 'close-about';
  if (state.isAppearanceOpen) return 'close-appearance';
  if (state.scenePhase === 'detail') return 'exit-detail';
  return 'none';
}

export interface HoverVideoMachineState {
  settledPose: PoseState;
  phase: VideoPhase;
  activeSystem: HoverSystem | null;
  desiredTarget: PoseState;
}

export type VideoCommand =
  | { type: 'noop' }
  | { type: 'play-forward'; system: HoverSystem }
  | { type: 'play-reverse'; system: HoverSystem }
  | { type: 'settle-neutral' }
  | { type: 'hold-pose'; system: HoverSystem };

// Quyết định bước kế tiếp của máy trạng thái video hover: không bao giờ cắt ngang clip đang chạy
export function getNextHoverCommand(state: HoverVideoMachineState): VideoCommand {
  if (state.phase === 'frozen') {
    return { type: 'noop' };
  }

  // Khi đang chạy clip tiến hoặc lùi, đợi clip chạy xong
  if (state.phase === 'playing-forward' || state.phase === 'playing-reverse') {
    return { type: 'noop' };
  }

  // Đang ở trạng thái giữ khung hình mở (capô mở hoặc cụm pin hiện)
  if (state.phase === 'holding' && state.activeSystem !== null) {
    if (state.desiredTarget !== state.activeSystem) {
      return { type: 'play-reverse', system: state.activeSystem };
    }
    return { type: 'noop' };
  }

  // Đang ở trạng thái nghỉ trung tính
  if (state.phase === 'idle' && state.settledPose === 'neutral') {
    if (state.desiredTarget === 'drive' || state.desiredTarget === 'battery') {
      return { type: 'play-forward', system: state.desiredTarget };
    }
  }

  return { type: 'noop' };
}

export function onForwardClipEnded(
  state: HoverVideoMachineState,
  system: HoverSystem
): { nextState: HoverVideoMachineState; command: VideoCommand } {
  if (state.phase === 'frozen') {
    return { nextState: state, command: { type: 'noop' } };
  }

  // Nếu đích mong muốn đã đổi trong lúc phát clip tiến, phát clip lùi ngay sau khi clip tiến kết thúc
  if (state.desiredTarget !== system) {
    return {
      nextState: {
        ...state,
        settledPose: system,
        phase: 'playing-reverse',
        activeSystem: system,
      },
      command: { type: 'play-reverse', system },
    };
  }

  return {
    nextState: {
      ...state,
      settledPose: system,
      phase: 'holding',
      activeSystem: system,
    },
    command: { type: 'hold-pose', system },
  };
}

export function onReverseClipEnded(
  state: HoverVideoMachineState
): { nextState: HoverVideoMachineState; command: VideoCommand } {
  if (state.phase === 'frozen') {
    return { nextState: state, command: { type: 'noop' } };
  }

  // Sau khi lùi về trung tính, nếu đích mong muốn là hệ thống khác thì bắt đầu phát clip tiến cho hệ thống mới
  if (state.desiredTarget === 'drive' || state.desiredTarget === 'battery') {
    const nextSystem = state.desiredTarget;
    return {
      nextState: {
        ...state,
        settledPose: 'neutral',
        phase: 'playing-forward',
        activeSystem: nextSystem,
      },
      command: { type: 'play-forward', system: nextSystem },
    };
  }

  return {
    nextState: {
      ...state,
      settledPose: 'neutral',
      phase: 'idle',
      activeSystem: null,
    },
    command: { type: 'settle-neutral' },
  };
}

// Kiểm tra xe đã ở trạng thái trung tính hoàn toàn để hiển thị render màu sơn hoặc mâm xe
export function isVehicleNeutralForAppearance(state: HoverVideoMachineState): boolean {
  return state.settledPose === 'neutral' && state.phase === 'idle' && state.activeSystem === null;
}

export interface ProjectInfoShape {
  name: string;
  author: string;
  authorRole: string;
  school: string;
  className: string;
  teacher: string;
  year: string;
  version: string;
  purpose: string;
  mediaCredit: string;
  fontCredit: string;
  techCredit: string;
  toolsCredit: string;
  references: readonly string[];
  disclaimer: string;
  copyrightNote: string;
}

export interface VisibleAuthorDetails {
  authorLine: string;
  metaLine: string;
  optionalLines: string[];
  hasReferences: boolean;
}

// Lọc bỏ các trường chuỗi rỗng và mảng rỗng khỏi hiển thị hộp thoại giới thiệu
export function formatVisibleProjectAuthor(info: ProjectInfoShape): VisibleAuthorDetails {
  const optionalLines: string[] = [];
  if (info.school.trim()) optionalLines.push(`Trường: ${info.school.trim()}`);
  if (info.className.trim()) optionalLines.push(`Lớp: ${info.className.trim()}`);
  if (info.teacher.trim()) optionalLines.push(`Giáo viên hướng dẫn: ${info.teacher.trim()}`);

  const metaParts: string[] = [];
  if (info.year.trim()) metaParts.push(`Năm ${info.year.trim()}`);
  if (info.version.trim()) metaParts.push(`Phiên bản ${info.version.trim()}`);

  return {
    authorLine: `${info.author} — ${info.authorRole}`,
    metaLine: metaParts.join(' · '),
    optionalLines,
    hasReferences: info.references.some((item) => item.trim().length > 0),
  };
}
