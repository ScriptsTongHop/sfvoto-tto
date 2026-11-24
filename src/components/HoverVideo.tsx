import { useEffect, useRef, useState } from 'react';
import { MEDIA_URLS, STAGE_ASPECT_HEIGHT, STAGE_ASPECT_WIDTH } from '../lib/assets';
import {
  getNextHoverCommand,
  onForwardClipEnded,
  onReverseClipEnded,
  TIMING,
  type HoverSystem,
  type HoverVideoMachineState,
  type PoseState,
} from '../lib/sceneMachine';

interface HoverVideoProps {
  desiredTarget: PoseState;
  freezeForDetail: boolean;
  resetSignal: number;
  reducedMotion: boolean;
  onNeutralStateChange: (isNeutral: boolean) => void;
}

type ClipKey = 'drive-forward' | 'drive-reverse' | 'battery-forward' | 'battery-reverse';

export function HoverVideo({
  desiredTarget,
  freezeForDetail,
  resetSignal,
  reducedMotion,
  onNeutralStateChange,
}: HoverVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videosRef = useRef<Record<ClipKey, HTMLVideoElement> | null>(null);
  const machineRef = useRef<HoverVideoMachineState>({
    settledPose: 'neutral',
    phase: 'idle',
    activeSystem: null,
    desiredTarget: 'neutral',
  });
  const currentVideoRef = useRef<HTMLVideoElement | null>(null);
  const frameHandleRef = useRef<{ type: 'rvfc' | 'raf'; id: number } | null>(null);
  const watchdogTimerRef = useRef<number | null>(null);
  const onNeutralRef = useRef(onNeutralStateChange);
  onNeutralRef.current = onNeutralStateChange;

  const [hasVisibleFrame, setHasVisibleFrame] = useState(false);

  const clearFrameLoop = () => {
    const handle = frameHandleRef.current;
    if (!handle) return;
    if (handle.type === 'rvfc' && currentVideoRef.current?.cancelVideoFrameCallback) {
      currentVideoRef.current.cancelVideoFrameCallback(handle.id);
    } else if (handle.type === 'raf') {
      cancelAnimationFrame(handle.id);
    }
    frameHandleRef.current = null;
  };

  const clearWatchdog = () => {
    if (watchdogTimerRef.current !== null) {
      window.clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  };

  const drawFrameToCanvas = (video: HTMLVideoElement): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return false;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setHasVisibleFrame(true);
      return true;
    } catch (error) {
      console.warn('Không thể vẽ khung hình video lên canvas:', error);
      return false;
    }
  };

  const resetCanvasToNeutral = () => {
    clearFrameLoop();
    clearWatchdog();
    if (currentVideoRef.current) {
      currentVideoRef.current.pause();
      currentVideoRef.current = null;
    }
    machineRef.current = {
      settledPose: 'neutral',
      phase: 'idle',
      activeSystem: null,
      desiredTarget: 'neutral',
    };
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasVisibleFrame(false);
    onNeutralRef.current(true);
  };

  const startClip = (system: HoverSystem, direction: 'forward' | 'reverse') => {
    const videos = videosRef.current;
    if (!videos) return;

    const key: ClipKey = `${system}-${direction}`;
    const video = videos[key];
    if (!video) return;

    clearFrameLoop();
    clearWatchdog();

    if (currentVideoRef.current && currentVideoRef.current !== video) {
      currentVideoRef.current.pause();
    }

    currentVideoRef.current = video;
    machineRef.current = {
      ...machineRef.current,
      phase: direction === 'forward' ? 'playing-forward' : 'playing-reverse',
      activeSystem: system,
    };
    onNeutralRef.current(false);

    // Đặt watchdog đề phòng video bị treo khi tải mạng
    watchdogTimerRef.current = window.setTimeout(() => {
      console.warn(`Video hover (${key}) phản hồi quá lâu, khôi phục về trạng thái trung tính.`);
      resetCanvasToNeutral();
    }, TIMING.videoWatchdogMs);

    const scheduleNextFrame = () => {
      if (machineRef.current.phase === 'frozen') return;
      if (currentVideoRef.current !== video) return;

      if (typeof video.requestVideoFrameCallback === 'function') {
        const id = video.requestVideoFrameCallback(() => {
          drawFrameToCanvas(video);
          if (!video.paused && !video.ended && machineRef.current.phase !== 'frozen') {
            scheduleNextFrame();
          }
        });
        frameHandleRef.current = { type: 'rvfc', id };
      } else {
        const id = requestAnimationFrame(() => {
          drawFrameToCanvas(video);
          if (!video.paused && !video.ended && machineRef.current.phase !== 'frozen') {
            scheduleNextFrame();
          }
        });
        frameHandleRef.current = { type: 'raf', id };
      }
    };

    try {
      video.currentTime = 0;
    } catch {
      // Bỏ qua nếu video chưa sẵn sàng đặt lại thời điểm
    }

    scheduleNextFrame();

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => {
        console.warn(`Không phát được video hover (${key}):`, err);
        resetCanvasToNeutral();
      });
    }
  };

  const executeCommand = () => {
    if (reducedMotion || machineRef.current.phase === 'frozen') return;
    const cmd = getNextHoverCommand(machineRef.current);
    if (cmd.type === 'play-forward') {
      startClip(cmd.system, 'forward');
    } else if (cmd.type === 'play-reverse') {
      startClip(cmd.system, 'reverse');
    } else if (cmd.type === 'settle-neutral') {
      resetCanvasToNeutral();
    }
  };

  // Khởi tạo bốn phần tử <video> ngoài DOM một lần và dọn dẹp khi unmount
  useEffect(() => {
    const createOffDomVideo = (src: string, key: ClipKey): HTMLVideoElement => {
      const video = document.createElement('video') as HTMLVideoElement;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.src = src;

      const handleEnded = () => {
        if (currentVideoRef.current !== video) return;
        clearWatchdog();
        clearFrameLoop();
        // Giữ nguyên khung hình cuối trên canvas ở mọi lần chuyển giao
        drawFrameToCanvas(video);

        if (key === 'drive-forward' || key === 'battery-forward') {
          const system: HoverSystem = key === 'drive-forward' ? 'drive' : 'battery';
          const result = onForwardClipEnded(machineRef.current, system);
          machineRef.current = result.nextState;
          if (result.command.type === 'play-reverse') {
            startClip(result.command.system, 'reverse');
          } else if (result.command.type === 'hold-pose') {
            onNeutralRef.current(false);
          }
        } else {
          const result = onReverseClipEnded(machineRef.current);
          machineRef.current = result.nextState;
          if (result.command.type === 'play-forward') {
            startClip(result.command.system, 'forward');
          } else if (result.command.type === 'settle-neutral') {
            resetCanvasToNeutral();
          }
        }
      };

      const handleError = () => {
        console.warn(`Lỗi tải video hover (${key}): ${src}`);
        if (currentVideoRef.current === video) {
          resetCanvasToNeutral();
        }
      };

      video.addEventListener('ended', handleEnded);
      video.addEventListener('error', handleError);
      (video as HTMLVideoElement & { _cleanup?: () => void })._cleanup = () => {
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('error', handleError);
        video.pause();
        video.removeAttribute('src');
        video.load();
      };

      return video;
    };

    const created: Record<ClipKey, HTMLVideoElement> = {
      'drive-forward': createOffDomVideo(MEDIA_URLS.hoodForward, 'drive-forward'),
      'drive-reverse': createOffDomVideo(MEDIA_URLS.hoodReverse, 'drive-reverse'),
      'battery-forward': createOffDomVideo(MEDIA_URLS.batteryForward, 'battery-forward'),
      'battery-reverse': createOffDomVideo(MEDIA_URLS.batteryReverse, 'battery-reverse'),
    };
    videosRef.current = created;

    return () => {
      clearFrameLoop();
      clearWatchdog();
      Object.values(created).forEach((video) => {
        const cleanable = video as HTMLVideoElement & { _cleanup?: () => void };
        cleanable._cleanup?.();
      });
      videosRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cập nhật đích mong muốn khi người dùng rê chuột/focus nhanh mà không cắt ngang clip đang chạy
  useEffect(() => {
    if (reducedMotion) {
      if (machineRef.current.phase !== 'idle' || machineRef.current.settledPose !== 'neutral') {
        resetCanvasToNeutral();
      }
      return;
    }

    if (freezeForDetail) return;

    machineRef.current = {
      ...machineRef.current,
      desiredTarget,
    };

    executeCommand();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desiredTarget, reducedMotion, freezeForDetail]);

  // Đóng băng khung hình hover đang thấy khi bắt đầu chuyển vào màn hình chi tiết
  useEffect(() => {
    if (!freezeForDetail) return;
    clearFrameLoop();
    clearWatchdog();
    if (currentVideoRef.current) {
      drawFrameToCanvas(currentVideoRef.current);
      currentVideoRef.current.pause();
    }
    machineRef.current = {
      ...machineRef.current,
      phase: 'frozen',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freezeForDetail]);

  // Chỉ reset canvas sau khi lớp chi tiết đục đã phủ kín hoặc khi quay về tổng quan
  useEffect(() => {
    if (resetSignal === 0) return;
    resetCanvasToNeutral();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  return (
    <canvas
      ref={canvasRef}
      width={STAGE_ASPECT_WIDTH}
      height={STAGE_ASPECT_HEIGHT}
      className={`hover-video-canvas${hasVisibleFrame ? ' is-visible' : ''}`}
      data-testid="hover-video-canvas"
      aria-hidden="true"
    />
  );
}
