const QuizQuestionCard = ({ index, question, value, onChange }) => {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs uppercase tracking-wide text-ink-500">
        Question {index + 1} - {question.type === "mcq" ? "Multiple Choice" : "Short Answer"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">{question.question}</h3>

      {question.type === "mcq" ? (
        <div className="mt-4 space-y-2">
          {question.options.map((option) => {
            const checked = value === option;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                  checked
                    ? "border-brand-300 bg-brand-50 text-brand-800"
                    : "border-ink-100 bg-white text-ink-700 hover:border-brand-200"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={checked}
                  onChange={(event) => onChange(event.target.value)}
                  className="h-4 w-4 accent-brand-600"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <textarea
          rows={4}
          className="input-field mt-4"
          placeholder="Type your answer"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
};

export default QuizQuestionCard;
