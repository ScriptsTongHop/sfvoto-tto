import { useId, useState } from 'react';

interface QuickQuizProps {
  openLabel: string;
  closeLabel: string;
  question: string;
  answer: string;
}

export function QuickQuiz({
  openLabel,
  closeLabel,
  question,
  answer,
}: QuickQuizProps) {
  const [isOpen, setIsOpen] = useState(false);
  const answerId = useId();

  return (
    <section className="detail-panel" aria-label={openLabel}>
      <p className="quiz-question">{question}</p>
      <button
        type="button"
        className="quiz-toggle-btn"
        aria-expanded={isOpen}
        aria-controls={answerId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? closeLabel : openLabel}
      </button>

      {isOpen && (
        <p id={answerId} className="quiz-answer">
          {answer}
        </p>
      )}
    </section>
  );
}
