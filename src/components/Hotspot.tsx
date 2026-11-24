import type { HotspotConfig } from '../content';

interface HotspotProps {
  hotspot: HotspotConfig;
  disabled: boolean;
  isActive: boolean;
  onSelect: (hotspot: HotspotConfig, buttonEl: HTMLButtonElement) => void;
  onHoverChange: (hotspot: HotspotConfig, entering: boolean) => void;
  onFocusChange: (hotspot: HotspotConfig, focused: boolean) => void;
}

export function Hotspot({
  hotspot,
  disabled,
  isActive,
  onSelect,
  onHoverChange,
  onFocusChange,
}: HotspotProps) {
  return (
    <div
      className="hotspot-item"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <button
        type="button"
        className={`hotspot-button${isActive ? ' is-active' : ''}`}
        aria-label={hotspot.ariaLabel}
        aria-expanded={hotspot.kind === 'appearance' ? isActive : undefined}
        disabled={disabled}
        data-hotspot-id={hotspot.id}
        onMouseEnter={() => onHoverChange(hotspot, true)}
        onMouseLeave={() => onHoverChange(hotspot, false)}
        onFocus={() => onFocusChange(hotspot, true)}
        onBlur={() => onFocusChange(hotspot, false)}
        onClick={(e) => onSelect(hotspot, e.currentTarget)}
      >
        <span className="hotspot-disc" aria-hidden="true">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 1.5V10.5M1.5 6H10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="hotspot-tooltip">{hotspot.label}</span>
      </button>
    </div>
  );
}
