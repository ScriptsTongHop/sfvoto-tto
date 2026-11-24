import { siteContent } from '../content';
import type { DetailId } from '../lib/sceneMachine';

interface FooterProps {
  activeScene: 'overview' | DetailId;
  hiddenForAppearance: boolean;
}

export function Footer({ activeScene, hiddenForAppearance }: FooterProps) {
  if (hiddenForAppearance) {
    return null;
  }

  return (
    <footer className="site-footer page-container">
      <div className="footer-grid">
        {siteContent.footer.items.map((item) => (
          <div key={item.id}>
            <h2 className="footer-item-title">{item.title}</h2>
            <p className="footer-item-summary">{item.summary}</p>
          </div>
        ))}
      </div>

      <div className="footer-thin-bar">
        <span className="footer-bar-brand">{siteContent.footer.barBrand}</span>
        <span>{siteContent.footer.sceneNotes[activeScene]}</span>
      </div>
    </footer>
  );
}
