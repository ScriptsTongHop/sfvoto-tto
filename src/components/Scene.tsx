import { useCallback, useEffect, useRef, useState } from 'react';
import {
  appearanceMenus,
  detailScreens,
  hotspotsConfig,
  siteContent,
  type AppearanceOption,
  type HotspotConfig,
} from '../content';
import { loadAndDecodeImage, MEDIA_URLS } from '../lib/assets';
import {
  canEnterDetail,
  canExitDetail,
  canRequestHoverPose,
  isOverviewInteractive,
  resolveEscapeAction,
  TIMING,
  type AppearanceCategory,
  type DetailId,
  type PoseState,
  type ScenePhase,
} from '../lib/sceneMachine';
import { AppearanceMenu } from './AppearanceMenu';
import { DetailView } from './DetailView';
import { Hotspot } from './Hotspot';
import { HoverVideo } from './HoverVideo';

interface SceneProps {
  isAboutOpen: boolean;
  onActiveSceneChange: (scene: 'overview' | DetailId) => void;
  onAppearanceVisibilityChange: (visible: boolean) => void;
  onRequestCloseAbout: () => void;
}

export function Scene({
  isAboutOpen,
  onActiveSceneChange,
  onAppearanceVisibilityChange,
  onRequestCloseAbout,
}: SceneProps) {
  const [scenePhase, setScenePhase] = useState<ScenePhase>('overview');
  const [activeDetail, setActiveDetail] = useState<DetailId | null>(null);
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null);

  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [focusedHotspotId, setFocusedHotspotId] = useState<string | null>(null);

  // Trạng thái hình ảnh và lỗi tải tài nguyên
  const [exteriorStatus, setExteriorStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [detailLoadError, setDetailLoadError] = useState(false);
  const [isPreparingDetail, setIsPreparingDetail] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>(siteContent.stage.ariaLiveOverview);

  // Trạng thái tùy chọn ngoại thất (màu sơn hoặc mâm xe)
  const [appearanceCategory, setAppearanceCategory] = useState<AppearanceCategory | null>(null);
  const [isAppearancePinned, setIsAppearancePinned] = useState(false);
  const [isAppearanceClosing, setIsAppearanceClosing] = useState(false);
  const [selectedPaintId, setSelectedPaintId] = useState<string>('studio-silver');
  const [selectedWheelsId, setSelectedWheelsId] = useState<string>('multi-spoke');
  const [decodedAppearanceUrl, setDecodedAppearanceUrl] = useState<string | null>(null);
  const [isLoadingAppearance, setIsLoadingAppearance] = useState(false);
  const [isVehicleNeutral, setIsVehicleNeutral] = useState(true);

  const [hoverResetSignal, setHoverResetSignal] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const stageAreaRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const detailOpenerRef = useRef<HTMLButtonElement | null>(null);
  const appearanceOpenerRef = useRef<HTMLButtonElement | null>(null);

  const transitionTimerRef = useRef<number | null>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isPointerInCorridorRef = useRef(false);
  const isFocusInAppearanceRef = useRef(false);

  // Theo dõi prefers-reduced-motion
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Tải và giải mã ảnh ngoại thất gốc + tải trước ảnh chi tiết ở nền
  const loadInitialMedia = useCallback(() => {
    setExteriorStatus('loading');
    setDetailLoadError(false);
    loadAndDecodeImage(MEDIA_URLS.exterior)
      .then(() => {
        setExteriorStatus('ready');
        // Tải trước nhẹ nhàng hai ảnh chi tiết
        void loadAndDecodeImage(MEDIA_URLS.driveDetail).catch(() => undefined);
        void loadAndDecodeImage(MEDIA_URLS.batteryDetail).catch(() => undefined);
      })
      .catch((err) => {
        console.warn('Không tải được ảnh ngoại thất chính:', err);
        setExteriorStatus('error');
      });
  }, []);

  useEffect(() => {
    loadInitialMedia();
    return () => {
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
      if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, [loadInitialMedia]);

  // Thông báo trạng thái ẩn/hiện footer cho App
  useEffect(() => {
    onAppearanceVisibilityChange(appearanceCategory !== null);
  }, [appearanceCategory, onAppearanceVisibilityChange]);

  useEffect(() => {
    onActiveSceneChange(scenePhase === 'detail' || scenePhase === 'entering' ? (activeDetail ?? 'overview') : 'overview');
  }, [scenePhase, activeDetail, onActiveSceneChange]);

  const clearAppearanceTimers = () => {
    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Đóng menu ngoại thất và khôi phục xe gốc
  const closeAppearanceMenu = useCallback((restoreFocusToTrigger = false) => {
    if (!appearanceCategory || isAppearanceClosing) return;
    clearAppearanceTimers();
    setIsAppearanceClosing(true);
    setIsAppearancePinned(false);
    setDecodedAppearanceUrl(null);
    setSelectedPaintId('studio-silver');
    setSelectedWheelsId('multi-spoke');

    closeTimerRef.current = window.setTimeout(() => {
      setAppearanceCategory(null);
      setIsAppearanceClosing(false);
      setStatusMessage(siteContent.stage.ariaLiveAppearanceClosed);
      if (restoreFocusToTrigger) {
        appearanceOpenerRef.current?.focus();
      }
    }, TIMING.appearanceCloseMs);
  }, [appearanceCategory, isAppearanceClosing]);

  const scheduleAppearanceLeaveClose = useCallback(() => {
    if (isAppearancePinned || !appearanceCategory || isAppearanceClosing) return;
    if (isPointerInCorridorRef.current || isFocusInAppearanceRef.current) return;

    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = window.setTimeout(() => {
      if (!isPointerInCorridorRef.current && !isFocusInAppearanceRef.current && !isAppearancePinned) {
        closeAppearanceMenu(false);
      }
    }, TIMING.appearanceLeaveMs);
  }, [appearanceCategory, isAppearanceClosing, isAppearancePinned, closeAppearanceMenu]);

  // Thoát màn hình chi tiết về tổng quan
  const exitDetailView = useCallback(() => {
    if (!canExitDetail(scenePhase, isAboutOpen)) return;
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);

    setScenePhase('returning');
    setExpandedPartId(null);
    setStatusMessage(siteContent.stage.ariaLiveReturning);

    transitionTimerRef.current = window.setTimeout(() => {
      setScenePhase('overview');
      setActiveDetail(null);
      setStatusMessage(siteContent.stage.ariaLiveOverview);
      requestAnimationFrame(() => {
        detailOpenerRef.current?.focus();
      });
    }, reducedMotion ? 80 : TIMING.returnOverviewMs);
  }, [scenePhase, isAboutOpen, reducedMotion]);

  // Xử lý phím Escape toàn cục theo thứ tự ưu tiên
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const action = resolveEscapeAction({
        isAboutOpen,
        isAppearanceOpen: appearanceCategory !== null,
        scenePhase,
      });

      if (action === 'close-about') {
        event.preventDefault();
        onRequestCloseAbout();
      } else if (action === 'close-appearance') {
        event.preventDefault();
        closeAppearanceMenu(true);
      } else if (action === 'exit-detail') {
        event.preventDefault();
        exitDetailView();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAboutOpen, appearanceCategory, scenePhase, onRequestCloseAbout, closeAppearanceMenu, exitDetailView]);

  // Vào màn hình chi tiết
  const enterDetailView = async (detailId: DetailId, triggerButton: HTMLButtonElement) => {
    const allowed = canEnterDetail({
      scenePhase,
      isAboutOpen,
      isAppearanceOpen: appearanceCategory !== null,
      isAppearanceClosing,
      isMediaLoading: isPreparingDetail || exteriorStatus !== 'ready',
    });
    if (!allowed) return;

    detailOpenerRef.current = triggerButton;
    setIsPreparingDetail(true);
    setDetailLoadError(false);

    try {
      await loadAndDecodeImage(detailScreens[detailId].imageUrl);
      setIsPreparingDetail(false);
      setActiveDetail(detailId);
      setExpandedPartId(null);
      setScenePhase('entering');
      setStatusMessage(
        detailId === 'drive'
          ? siteContent.stage.ariaLiveEnteringDrive
          : siteContent.stage.ariaLiveEnteringBattery
      );

      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => {
        setScenePhase('detail');
        // Chỉ reset canvas video hover sau khi lớp chi tiết đục đã phủ kín
        setHoverResetSignal((n) => n + 1);
        setStatusMessage(
          detailId === 'drive'
            ? siteContent.stage.ariaLiveDetailDrive
            : siteContent.stage.ariaLiveDetailBattery
        );
        requestAnimationFrame(() => {
          backButtonRef.current?.focus();
        });
      }, reducedMotion ? 80 : TIMING.enterDetailMs);
    } catch (err) {
      console.warn(`Không tải được ảnh chi tiết (${detailId}):`, err);
      setIsPreparingDetail(false);
      setDetailLoadError(true);
    }
  };

  // Mở chế độ ngoại thất (chỉ một chế độ mỗi lần)
  const openAppearanceMode = (
    category: AppearanceCategory,
    pinned: boolean,
    triggerButton?: HTMLButtonElement
  ) => {
    if (scenePhase !== 'overview' || isAboutOpen || exteriorStatus !== 'ready' || isPreparingDetail) {
      return;
    }
    if (appearanceCategory && appearanceCategory !== category) {
      return; // Không cho mở chế độ khác khi một bảng đang mở
    }
    clearAppearanceTimers();
    if (triggerButton) {
      appearanceOpenerRef.current = triggerButton;
    }
    setIsAppearanceClosing(false);
    setAppearanceCategory(category);
    if (pinned) {
      setIsAppearancePinned(true);
    }
    setStatusMessage(
      category === 'paint'
        ? siteContent.stage.ariaLivePaintOpened
        : siteContent.stage.ariaLiveWheelsOpened
    );
  };

  const handleSelectAppearanceOption = async (option: AppearanceOption) => {
    if (!appearanceCategory || isAppearanceClosing) return;
    setIsAppearancePinned(true);

    if (appearanceCategory === 'paint') {
      setSelectedPaintId(option.id);
    } else {
      setSelectedWheelsId(option.id);
    }

    if (option.url === MEDIA_URLS.exterior) {
      setDecodedAppearanceUrl(null);
      return;
    }

    setIsLoadingAppearance(true);
    try {
      await loadAndDecodeImage(option.url);
      setDecodedAppearanceUrl(option.url);
    } catch (err) {
      console.warn(`Không tải được ảnh ngoại thất (${option.label}):`, err);
      setDetailLoadError(true);
    } finally {
      setIsLoadingAppearance(false);
    }
  };

  const handleHotspotHover = (hotspot: HotspotConfig, entering: boolean) => {
    if (entering) {
      setHoveredHotspotId(hotspot.id);
      if (hotspot.kind === 'appearance' && hotspot.appearanceCategory) {
        if (!appearanceCategory && isOverviewInteractive({
          scenePhase,
          isAboutOpen,
          isAppearanceOpen: false,
          isAppearanceClosing,
          isMediaLoading: isPreparingDetail || exteriorStatus !== 'ready',
        })) {
          openAppearanceMode(hotspot.appearanceCategory, false);
        }
        if (appearanceCategory === hotspot.appearanceCategory) {
          isPointerInCorridorRef.current = true;
          clearAppearanceTimers();
        }
      }
    } else {
      setHoveredHotspotId((curr) => (curr === hotspot.id ? null : curr));
      if (hotspot.kind === 'appearance' && appearanceCategory === hotspot.appearanceCategory) {
        isPointerInCorridorRef.current = false;
        scheduleAppearanceLeaveClose();
      }
    }
  };

  const handleHotspotFocus = (hotspot: HotspotConfig, focused: boolean) => {
    if (focused) {
      setFocusedHotspotId(hotspot.id);
    } else {
      setFocusedHotspotId((curr) => (curr === hotspot.id ? null : curr));
    }
  };

  const handleHotspotSelect = (hotspot: HotspotConfig, buttonEl: HTMLButtonElement) => {
    if (hotspot.kind === 'detail' && hotspot.detailId) {
      void enterDetailView(hotspot.detailId, buttonEl);
    } else if (hotspot.kind === 'appearance' && hotspot.appearanceCategory) {
      if (appearanceCategory === hotspot.appearanceCategory && isAppearancePinned) {
        closeAppearanceMenu(true);
      } else {
        openAppearanceMode(hotspot.appearanceCategory, true, buttonEl);
      }
    }
  };

  // Xác định đích mong muốn cho HoverVideo
  const activeHoverCandidate = hoveredHotspotId ?? focusedHotspotId;
  const allowHoverPose = canRequestHoverPose({
    scenePhase,
    isAboutOpen,
    isAppearanceOpen: appearanceCategory !== null,
    isAppearanceClosing,
    reducedMotion,
  });

  let desiredPose: PoseState = 'neutral';
  if (allowHoverPose) {
    if (activeHoverCandidate === 'drive') desiredPose = 'drive';
    else if (activeHoverCandidate === 'battery') desiredPose = 'battery';
  }

  // Chỉ hiện ảnh ngoại thất đã chọn khi xe đang trung tính và ảnh đã giải mã
  const showAppearanceRender =
    scenePhase === 'overview' &&
    appearanceCategory !== null &&
    !isAppearanceClosing &&
    isVehicleNeutral &&
    decodedAppearanceUrl !== null;

  const isDetailActive = scenePhase === 'detail' && activeDetail !== null;
  const isDetailVisualOpen = scenePhase === 'entering' || scenePhase === 'detail';
  const currentDetailConfig = activeDetail ? detailScreens[activeDetail] : null;

  return (
    <main>
      {/* Thông báo trạng thái cho trình đọc màn hình */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </div>

      {/* Hàng tiêu đề phía trên khung media */}
      {isDetailVisualOpen && currentDetailConfig ? (
        <div className="detail-top-row page-container">
          <div className="detail-heading-group">
            <h1 className="detail-title">{currentDetailConfig.title}</h1>
            <p className="detail-description">{currentDetailConfig.description}</p>
          </div>
          <button
            ref={backButtonRef}
            type="button"
            className="back-button"
            disabled={scenePhase !== 'detail' || isAboutOpen}
            onClick={exitDetailView}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.5 3.5L6 8L10.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{currentDetailConfig.backLabel}</span>
          </button>
        </div>
      ) : (
        <div className="hero-row page-container">
          <h1 className="hero-title">{siteContent.hero.title}</h1>
          <div className="hero-subtitles">
            <p className="hero-subtitle">{siteContent.hero.subtitlePrimary}</p>
            <p className="hero-subtitle-hint">{siteContent.hero.subtitleSecondary}</p>
          </div>
        </div>
      )}

      {/* Khu vực khung ảnh và hành lang con trỏ tới menu ngoại thất */}
      <div
        ref={stageAreaRef}
        className="appearance-corridor-wrapper page-container"
        onMouseMove={(e) => {
          if (!appearanceCategory || isAppearancePinned || isAppearanceClosing) return;
          const wrapper = stageAreaRef.current;
          if (!wrapper) return;
          const rect = wrapper.getBoundingClientRect();
          // Hành lang con trỏ từ phần dưới khung ảnh tới dock ngoại thất
          const inCorridor =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top + rect.height * 0.42 &&
            e.clientY <= rect.bottom;
          isPointerInCorridorRef.current = inCorridor;
          if (inCorridor) {
            clearAppearanceTimers();
          } else {
            scheduleAppearanceLeaveClose();
          }
        }}
        onMouseLeave={() => {
          isPointerInCorridorRef.current = false;
          scheduleAppearanceLeaveClose();
        }}
      >
        <div className="stage-frame" data-scene-phase={scenePhase}>
          <div className="stage-plane">
            {/* Lớp tổng quan: ảnh gốc + lớp ngoại thất (khi trung tính) + canvas video hover + 4 hotspot */}
            <div
              className={`stage-overview-layer${scenePhase === 'entering' ? ' is-entering' : ''}`}
            >
              {exteriorStatus === 'ready' && (
                <img
                  src={MEDIA_URLS.exterior}
                  alt={siteContent.stage.overviewImageAlt}
                  className="stage-image"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              )}

              {showAppearanceRender && decodedAppearanceUrl && (
                <img
                  src={decodedAppearanceUrl}
                  alt={siteContent.stage.overviewImageAlt}
                  className="stage-image stage-appearance-layer is-active"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
              )}

              <HoverVideo
                desiredTarget={desiredPose}
                freezeForDetail={scenePhase === 'entering'}
                resetSignal={hoverResetSignal}
                reducedMotion={reducedMotion}
                onNeutralStateChange={setIsVehicleNeutral}
              />

              {/* Bốn hotspot tương tác trên mặt phẳng 1672:941 */}
              {exteriorStatus === 'ready' && scenePhase === 'overview' && (
                <div className="hotspot-layer">
                  {hotspotsConfig.map((hotspot) => {
                    const isActiveAppearance =
                      hotspot.kind === 'appearance' &&
                      appearanceCategory === hotspot.appearanceCategory;

                    const isDisabled =
                      isAboutOpen ||
                      isPreparingDetail ||
                      isAppearanceClosing ||
                      (appearanceCategory !== null && !isActiveAppearance);

                    return (
                      <Hotspot
                        key={hotspot.id}
                        hotspot={hotspot}
                        disabled={isDisabled}
                        isActive={isActiveAppearance}
                        onSelect={handleHotspotSelect}
                        onHoverChange={handleHotspotHover}
                        onFocusChange={handleHotspotFocus}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lớp chi tiết: crossfade + zoom CSS sang drive-blue.png / battery-blue.png */}
            {currentDetailConfig && (
              <div
                className={`stage-detail-layer${
                  scenePhase === 'entering' || scenePhase === 'detail' ? ' is-visible' : ''
                }${scenePhase === 'returning' ? ' is-returning' : ''}`}
                aria-hidden={!isDetailVisualOpen}
              >
                <img
                  src={currentDetailConfig.imageUrl}
                  alt={currentDetailConfig.imageAlt}
                  className="stage-image"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />

                {scenePhase === 'detail' && (
                  <div className="detail-pin-layer">
                    {currentDetailConfig.parts.map((part) => {
                      const isSelected = expandedPartId === part.id;
                      return (
                        <div
                          key={part.id}
                          className="detail-pin-item"
                          style={{ left: `${part.x}%`, top: `${part.y}%` }}
                        >
                          <button
                            type="button"
                            className={`detail-pin-button${isSelected ? ' is-selected' : ''}`}
                            aria-label={`${part.numberLabel}. ${part.name}`}
                            aria-expanded={isSelected}
                            disabled={isAboutOpen}
                            onClick={() =>
                              setExpandedPartId((curr) => (curr === part.id ? null : part.id))
                            }
                          >
                            <span className="detail-pin-badge">{part.numberLabel}</span>
                            <span className="detail-pin-label">{part.name}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Trạng thái tải hoặc lỗi tài nguyên trung tính */}
            {exteriorStatus === 'loading' && (
              <div className="stage-status-overlay" role="status">
                <p className="stage-status-text">{siteContent.stage.loadingText}</p>
              </div>
            )}

            {(exteriorStatus === 'error' || detailLoadError) && (
              <div className="stage-status-overlay" role="alert">
                <p className="stage-status-text">{siteContent.stage.mediaError}</p>
                <button
                  type="button"
                  className="stage-retry-button"
                  onClick={loadInitialMedia}
                >
                  {siteContent.stage.retryButton}
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="stage-caption">{siteContent.hero.caption}</p>

        {/* Bảng ngoại thất nằm bên dưới khung ảnh, thay thế hiển thị footer khi đang mở */}
        {scenePhase === 'overview' && appearanceCategory && (
          <AppearanceMenu
            category={appearanceCategory}
            selectedOptionId={
              appearanceCategory === 'paint' ? selectedPaintId : selectedWheelsId
            }
            isClosing={isAppearanceClosing}
            isLoadingOption={isLoadingAppearance}
            onSelectOption={(opt) => void handleSelectAppearanceOption(opt)}
            onClose={() => closeAppearanceMenu(true)}
            onPointerEnterMenu={() => {
              isPointerInCorridorRef.current = true;
              clearAppearanceTimers();
            }}
            onPointerLeaveMenu={() => {
              isPointerInCorridorRef.current = false;
              scheduleAppearanceLeaveClose();
            }}
            onFocusMenu={() => {
              isFocusInAppearanceRef.current = true;
              clearAppearanceTimers();
            }}
            onBlurMenu={(relatedTarget) => {
              const dockEl = document.querySelector('[data-appearance-dock="true"]');
              const stayedInside =
                relatedTarget instanceof Node && dockEl?.contains(relatedTarget);
              if (!stayedInside) {
                isFocusInAppearanceRef.current = false;
                scheduleAppearanceLeaveClose();
              }
            }}
          />
        )}
      </div>

      {/* Nội dung kỹ thuật màn hình chi tiết */}
      {isDetailActive && activeDetail && (
        <DetailView
          detailId={activeDetail}
          expandedPartId={expandedPartId}
          onTogglePart={(partId) =>
            setExpandedPartId((curr) => (curr === partId ? null : partId))
          }
        />
      )}
    </main>
  );
}
