import { useEffect, useId, useRef } from 'react';
import { projectInfo, siteContent } from '../content';
import { formatVisibleProjectAuthor } from '../lib/sceneMachine';

interface AboutDialogProps {
  isOpen: boolean;
  openerElement: HTMLButtonElement | null;
  onClose: () => void;
}

export function AboutDialog({ isOpen, openerElement, onClose }: AboutDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  const visibleAuthor = formatVisibleProjectAuthor(projectInfo);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      // Đưa focus vào nút Đóng ngay khi mở hộp thoại
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      openerElement?.focus();
    }
  }, [isOpen, openerElement]);

  // Bẫy focus bằng phím Tab và Shift+Tab bên trong hộp thoại
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const container = dialogRef.current;
      if (!container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !container.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const { sections } = siteContent.aboutDialog;

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="about-dialog-header">
          <h2 id={titleId} className="about-dialog-title">
            {siteContent.aboutDialog.title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="about-dialog-close"
            aria-label={siteContent.aboutDialog.closeAriaLabel}
            onClick={onClose}
          >
            {siteContent.aboutDialog.closeLabel}
          </button>
        </div>

        <div className="about-dialog-body">
          <section className="about-section">
            <h3 className="about-section-heading">{sections.about}</h3>
            <p className="about-section-text">{projectInfo.name}</p>
            <p className="about-section-subtext">{projectInfo.purpose}</p>
          </section>

          <section className="about-section">
            <h3 className="about-section-heading">{sections.author}</h3>
            <p className="about-section-text">{visibleAuthor.authorLine}</p>
            {visibleAuthor.metaLine && (
              <p className="about-section-subtext">{visibleAuthor.metaLine}</p>
            )}
            {visibleAuthor.optionalLines.map((line) => (
              <p key={line} className="about-section-subtext">
                {line}
              </p>
            ))}
          </section>

          <section className="about-section">
            <h3 className="about-section-heading">{sections.media}</h3>
            <p className="about-section-text">{projectInfo.mediaCredit}</p>
          </section>

          <section className="about-section">
            <h3 className="about-section-heading">{sections.font}</h3>
            <p className="about-section-text">{projectInfo.fontCredit}</p>
          </section>

          <section className="about-section">
            <h3 className="about-section-heading">{sections.techAndTools}</h3>
            <p className="about-section-text">{projectInfo.techCredit}</p>
            <p className="about-section-subtext">{projectInfo.toolsCredit}</p>
          </section>

          {visibleAuthor.hasReferences && (
            <section className="about-section">
              <h3 className="about-section-heading">{sections.references}</h3>
              <ul className="about-references-list">
                {projectInfo.references
                  .filter((refItem) => refItem.trim().length > 0)
                  .map((refItem) => (
                    <li key={refItem}>{refItem}</li>
                  ))}
              </ul>
            </section>
          )}

          <section className="about-section">
            <h3 className="about-section-heading">{sections.disclaimer}</h3>
            <p className="about-section-text">{projectInfo.disclaimer}</p>
          </section>

          <section className="about-section">
            <h3 className="about-section-heading">{sections.copyright}</h3>
            <p className="about-section-text">{projectInfo.copyrightNote}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
