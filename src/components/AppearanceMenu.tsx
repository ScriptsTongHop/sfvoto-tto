import { appearanceMenus, type AppearanceOption } from '../content';
import type { AppearanceCategory } from '../lib/sceneMachine';

interface AppearanceMenuProps {
  category: AppearanceCategory | null;
  selectedOptionId: string;
  isClosing: boolean;
  isLoadingOption: boolean;
  onSelectOption: (option: AppearanceOption) => void;
  onClose: () => void;
  onPointerEnterMenu: () => void;
  onPointerLeaveMenu: () => void;
  onFocusMenu: () => void;
  onBlurMenu: (relatedTarget: EventTarget | null) => void;
}

export function AppearanceMenu({
  category,
  selectedOptionId,
  isClosing,
  isLoadingOption,
  onSelectOption,
  onClose,
  onPointerEnterMenu,
  onPointerLeaveMenu,
  onFocusMenu,
  onBlurMenu,
}: AppearanceMenuProps) {
  if (!category) return null;

  const config = appearanceMenus[category];

  return (
    <section
      className={`appearance-dock page-container${isClosing ? ' is-closing' : ''}`}
      aria-label={config.title}
      data-appearance-dock="true"
      onMouseEnter={onPointerEnterMenu}
      onMouseLeave={onPointerLeaveMenu}
      onFocus={onFocusMenu}
      onBlur={(e) => onBlurMenu(e.relatedTarget)}
    >
      <div className="appearance-dock-header">
        <div>
          <h2 className="appearance-dock-title">{config.title}</h2>
          <p className="appearance-dock-hint">
            {isLoadingOption ? 'Đang chuẩn bị hình ảnh ngoại thất...' : config.hint}
          </p>
        </div>
        <button
          type="button"
          className="appearance-close-btn"
          aria-label={config.closeLabel}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>

      <div className="appearance-options-row" role="group" aria-label={config.title}>
        {config.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              className={`appearance-option-btn${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelectOption(option)}
            >
              {option.swatchColor && (
                <span
                  className="appearance-swatch"
                  style={{ backgroundColor: option.swatchColor }}
                  aria-hidden="true"
                />
              )}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
