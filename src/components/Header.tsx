import { siteContent } from '../content';

interface HeaderProps {
  onOpenAbout: (triggerEl: HTMLButtonElement) => void;
}

export function Header({ onOpenAbout }: HeaderProps) {
  return (
    <header className="site-header page-container">
      <div className="header-left">
        <span className="wordmark">{siteContent.header.wordmark}</span>
        <span className="header-tag">{siteContent.header.projectTag}</span>
      </div>

      <div className="header-right">
        <span className="header-study-label">{siteContent.header.studyLabel}</span>
        <button
          type="button"
          className="text-link-button header-about-desktop"
          aria-label={siteContent.header.aboutAriaLabel}
          onClick={(e) => onOpenAbout(e.currentTarget)}
        >
          {siteContent.header.aboutButton}
        </button>
      </div>
    </header>
  );
}
