import { energyFlowConfig } from '../content';
import type { DetailId } from '../lib/sceneMachine';

interface EnergyFlowProps {
  activeDetail: DetailId;
}

export function EnergyFlow({ activeDetail }: EnergyFlowProps) {
  const nodes = energyFlowConfig.nodes;

  return (
    <section
      className="energy-flow-panel"
      aria-label={energyFlowConfig.ariaDescriptions[activeDetail]}
    >
      <p className="detail-section-label">{energyFlowConfig.title}</p>

      <div className="energy-flow-chain">
        {nodes.map((node, index) => {
          const isHighlighted = node.highlightIn.includes(activeDetail);
          const nextNode = nodes[index + 1];
          const isArrowHighlighted =
            nextNode !== undefined &&
            isHighlighted &&
            nextNode.highlightIn.includes(activeDetail);

          return (
            <div
              key={node.id}
              style={{ display: 'contents' }}
            >
              <div
                className={`energy-node${isHighlighted ? ' is-highlighted' : ''}`}
              >
                {node.label}
              </div>

              {index < nodes.length - 1 && (
                <span
                  className={`energy-arrow${isArrowHighlighted ? ' is-highlighted' : ''}`}
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 7H11.5M8.5 3.5L12 7L8.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mũi tên nét đứt ngược từ Bánh xe về Pin cao áp cho phanh tái sinh */}
      <div className="energy-regen-row" aria-hidden="true">
        <div className="energy-regen-span">
          <svg
            className="energy-regen-svg"
            viewBox="0 0 500 22"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M486 4V14H14V4"
              stroke="#edff39"
              strokeWidth="1.5"
              strokeDasharray="6 5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 8L14 3.5L9 8"
              stroke="#edff39"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="energy-regen-label">
            <span className="energy-regen-desktop-text">{energyFlowConfig.regenLabel}</span>
            <span className="energy-regen-mobile-text">
              {energyFlowConfig.regenLabel}: Bánh xe → Pin cao áp
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
