import { siteContent } from '../content';

interface CreditsProps {
  onOpenAbout: (triggerEl: HTMLButtonElement) => void;
}

export function Credits({ onOpenAbout }: CreditsProps) {
  return (
    <div className="site-credits page-container">
      <p className="credits-text">{siteContent.credits.text}</p>
      <button
        type="button"
        className="text-link-button"
        aria-label={siteContent.header.aboutAriaLabel}
        onClick={(e) => onOpenAbout(e.currentTarget)}
      >
        {siteContent.credits.buttonLabel}
      </button>
    </div>
  );
}
