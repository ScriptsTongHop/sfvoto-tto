import { useState } from 'react';
import { detailScreens } from '../content';
import type { DetailId } from '../lib/sceneMachine';
import { EnergyFlow } from './EnergyFlow';
import { QuickQuiz } from './QuickQuiz';

interface DetailViewProps {
  detailId: DetailId;
  expandedPartId: string | null;
  onTogglePart: (partId: string) => void;
}

export function DetailView({
  detailId,
  expandedPartId,
  onTogglePart,
}: DetailViewProps) {
  const screen = detailScreens[detailId];
  const [selectedNotice] = useState(
    'Nhấp vào điểm đánh dấu trên hình hoặc chọn một bộ phận bên dưới để bật phần giải thích.'
  );

  return (
    <div className="detail-content page-container" data-detail-view={detailId}>
      <div className="detail-grid">
        <section className="detail-panel" aria-label="Danh sách các bộ phận chính">
          <p className="detail-section-label">{selectedNotice}</p>

          <div className="part-list">
            {screen.parts.map((part) => {
              const isOpen = expandedPartId === part.id;
              return (
                <div
                  key={part.id}
                  className={`part-row${isOpen ? ' is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="part-row-trigger"
                    aria-expanded={isOpen}
                    onClick={() => onTogglePart(part.id)}
                  >
                    <span className="part-row-title-wrap">
                      <span className="part-row-num" aria-hidden="true">
                        {part.numberLabel}
                      </span>
                      <span>{part.name}</span>
                    </span>
                    <span className="part-row-toggle-text">
                      {isOpen ? 'Thu gọn' : 'Xem giải thích'}
                    </span>
                  </button>

                  {isOpen && <p className="part-row-body">{part.summary}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <div className="detail-side-stack">
          <section className="detail-panel" aria-label={screen.didYouKnowTitle}>
            <h2 className="did-you-know-title">{screen.didYouKnowTitle}</h2>
            <p className="did-you-know-text">{screen.didYouKnowText}</p>
          </section>

          <QuickQuiz
            key={detailId}
            openLabel={screen.quiz.openLabel}
            closeLabel={screen.quiz.closeLabel}
            question={screen.quiz.question}
            answer={screen.quiz.answer}
          />
        </div>
      </div>

      <EnergyFlow activeDetail={detailId} />

      {screen.auxiliarySection && (
        <section className="detail-panel" aria-label={screen.auxiliarySection.title}>
          <p className="detail-section-label">{screen.auxiliarySection.title}</p>
          <div className="auxiliary-cards-grid">
            {screen.auxiliarySection.cards.map((card) => (
              <article key={card.id} className="auxiliary-card">
                <h3 className="auxiliary-card-title">{card.title}</h3>
                <p className="auxiliary-card-desc">{card.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
