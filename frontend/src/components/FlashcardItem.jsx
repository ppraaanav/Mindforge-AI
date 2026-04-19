import { useState } from "react";

const FlashcardItem = ({ card, index }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((prev) => !prev)}
      className="group relative h-56 w-full [perspective:1200px]"
    >
      <div
        className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <div className="absolute inset-0 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 text-left shadow-sm [backface-visibility:hidden]">
          <p className="text-xs uppercase tracking-wide text-brand-700">Card {index + 1}</p>
          <p className="mt-4 text-lg font-semibold text-ink-900">{card.question}</p>
          <p className="mt-6 text-xs text-ink-500">Tap to reveal answer</p>
        </div>

        <div className="absolute inset-0 rounded-2xl border border-ink-100 bg-white p-5 text-left shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-xs uppercase tracking-wide text-ink-500">Answer</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-700">{card.answer}</p>
          <p className="mt-6 text-xs text-brand-600">Tap to flip back</p>
        </div>
      </div>
    </button>
  );
};

export default FlashcardItem;
