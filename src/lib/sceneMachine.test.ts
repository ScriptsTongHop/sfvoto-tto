import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canEnterDetail,
  canExitDetail,
  canRequestHoverPose,
  formatVisibleProjectAuthor,
  getNextHoverCommand,
  isVehicleNeutralForAppearance,
  onForwardClipEnded,
  onReverseClipEnded,
  resolveEscapeAction,
  type HoverVideoMachineState,
} from './sceneMachine';

test('trạng thái tương tác tổng quan bị khóa khi mở hộp thoại, ngoại thất hoặc đang chuyển cảnh', () => {
  assert.equal(
    canEnterDetail({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: false,
      isAppearanceClosing: false,
      isMediaLoading: false,
    }),
    true
  );

  assert.equal(
    canEnterDetail({
      scenePhase: 'entering',
      isAboutOpen: false,
      isAppearanceOpen: false,
      isAppearanceClosing: false,
      isMediaLoading: false,
    }),
    false
  );

  assert.equal(
    canEnterDetail({
      scenePhase: 'overview',
      isAboutOpen: true,
      isAppearanceOpen: false,
      isAppearanceClosing: false,
      isMediaLoading: false,
    }),
    false
  );

  assert.equal(
    canEnterDetail({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: true,
      isAppearanceClosing: false,
      isMediaLoading: false,
    }),
    false
  );

  assert.equal(
    canEnterDetail({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: false,
      isAppearanceClosing: true,
      isMediaLoading: false,
    }),
    false
  );
});

test('ưu tiên phím Escape đóng hộp thoại giới thiệu trước rồi mới tới ngoại thất hoặc chi tiết', () => {
  assert.equal(
    resolveEscapeAction({
      isAboutOpen: true,
      isAppearanceOpen: true,
      scenePhase: 'detail',
    }),
    'close-about'
  );
  assert.equal(
    resolveEscapeAction({
      isAboutOpen: false,
      isAppearanceOpen: true,
      scenePhase: 'overview',
    }),
    'close-appearance'
  );
  assert.equal(
    resolveEscapeAction({
      isAboutOpen: false,
      isAppearanceOpen: false,
      scenePhase: 'detail',
    }),
    'exit-detail'
  );
  assert.equal(
    resolveEscapeAction({
      isAboutOpen: false,
      isAppearanceOpen: false,
      scenePhase: 'returning',
    }),
    'none'
  );
});

test('thoát chi tiết chỉ hợp lệ khi đang ở detail và không mở hộp thoại giới thiệu', () => {
  assert.equal(canExitDetail('detail', false), true);
  assert.equal(canExitDetail('detail', true), false);
  assert.equal(canExitDetail('entering', false), false);
});

test('video hover phát hết clip tiến rồi mới lùi và phát hết clip lùi rồi mới chuyển hệ thống khác', () => {
  const initial: HoverVideoMachineState = {
    settledPose: 'neutral',
    phase: 'idle',
    activeSystem: null,
    desiredTarget: 'drive',
  };

  const cmd1 = getNextHoverCommand(initial);
  assert.deepEqual(cmd1, { type: 'play-forward', system: 'drive' });

  // Trong khi đang phát drive tiến, người dùng rê nhanh sang battery
  const duringForward: HoverVideoMachineState = {
    settledPose: 'neutral',
    phase: 'playing-forward',
    activeSystem: 'drive',
    desiredTarget: 'battery',
  };
  assert.deepEqual(getNextHoverCommand(duringForward), { type: 'noop' });

  // Clip tiến kết thúc -> phải lùi drive trước
  const afterForward = onForwardClipEnded(duringForward, 'drive');
  assert.deepEqual(afterForward.command, { type: 'play-reverse', system: 'drive' });
  assert.equal(afterForward.nextState.phase, 'playing-reverse');
  assert.equal(isVehicleNeutralForAppearance(afterForward.nextState), false);

  // Clip lùi drive kết thúc -> chuyển sang chạy tiến battery
  const afterReverse = onReverseClipEnded(afterForward.nextState);
  assert.deepEqual(afterReverse.command, { type: 'play-forward', system: 'battery' });
  assert.equal(afterReverse.nextState.phase, 'playing-forward');
  assert.equal(afterReverse.nextState.activeSystem, 'battery');

  // Nếu desiredTarget quay lại neutral trước khi lùi kết thúc -> dừng ở neutral
  const backToNeutral = onReverseClipEnded({
    settledPose: 'battery',
    phase: 'playing-reverse',
    activeSystem: 'battery',
    desiredTarget: 'neutral',
  });
  assert.deepEqual(backToNeutral.command, { type: 'settle-neutral' });
  assert.equal(isVehicleNeutralForAppearance(backToNeutral.nextState), true);
});

test('tôn trọng prefers-reduced-motion và khóa ngoại thất khi yêu cầu hover video', () => {
  assert.equal(
    canRequestHoverPose({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: false,
      isAppearanceClosing: false,
      reducedMotion: true,
    }),
    false
  );
  assert.equal(
    canRequestHoverPose({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: true,
      isAppearanceClosing: false,
      reducedMotion: false,
    }),
    false
  );
  assert.equal(
    canRequestHoverPose({
      scenePhase: 'overview',
      isAboutOpen: false,
      isAppearanceOpen: false,
      isAppearanceClosing: false,
      reducedMotion: false,
    }),
    true
  );
});

test('ẩn các trường rỗng trong thông tin dự án', () => {
  const hidden = formatVisibleProjectAuthor({
    name: 'Cấu tạo ô tô điện',
    author: 'Chí Hiếu',
    authorRole: 'Tác giả, thiết kế và thực hiện dự án',
    school: '',
    className: '   ',
    teacher: '',
    year: '2026',
    version: '1.0',
    purpose: 'Mục đích',
    mediaCredit: 'Media',
    fontCredit: 'Font',
    techCredit: 'Tech',
    toolsCredit: 'Tools',
    references: [],
    disclaimer: 'Lưu ý',
    copyrightNote: 'Bản quyền',
  });

  assert.equal(hidden.authorLine, 'Chí Hiếu — Tác giả, thiết kế và thực hiện dự án');
  assert.equal(hidden.metaLine, 'Năm 2026 · Phiên bản 1.0');
  assert.deepEqual(hidden.optionalLines, []);
  assert.equal(hidden.hasReferences, false);

  const populated = formatVisibleProjectAuthor({
    name: 'Cấu tạo ô tô điện',
    author: 'Chí Hiếu',
    authorRole: 'Tác giả, thiết kế và thực hiện dự án',
    school: 'THPT Nguyễn Du',
    className: '11A1',
    teacher: 'Cô Lan',
    year: '2026',
    version: '1.0',
    purpose: 'Mục đích',
    mediaCredit: 'Media',
    fontCredit: 'Font',
    techCredit: 'Tech',
    toolsCredit: 'Tools',
    references: ['Tài liệu Vật lý'],
    disclaimer: 'Lưu ý',
    copyrightNote: 'Bản quyền',
  });

  assert.deepEqual(populated.optionalLines, [
    'Trường: THCS VP2',
    'Lớp: 11A1',
    'Giáo viên hướng dẫn: Cô Lan',
  ]);
  assert.equal(populated.hasReferences, true);
});
