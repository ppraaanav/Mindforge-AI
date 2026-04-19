const splitSentences = (text) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

const generateFallbackFlashcards = (text, count = 8) => {
  const sentences = splitSentences(text).slice(0, count * 2);

  return sentences.slice(0, count).map((sentence, index) => ({
    question: `Key idea ${index + 1}: What is an important point from this section?`,
    answer: sentence
  }));
};

const generateFallbackQuiz = (text, count = 6) => {
  const sentences = splitSentences(text).slice(0, Math.max(count, 6));

  return sentences.slice(0, count).map((sentence, index) => {
    if (index % 2 === 0) {
      return {
        type: "mcq",
        question: `Which option best matches this statement from the document?`,
        options: [sentence, "Not mentioned", "Contradicted", "Irrelevant"],
        correctAnswer: sentence,
        explanation: "This sentence appears directly in the source document."
      };
    }

    return {
      type: "short",
      question: "Write one concise insight from the document.",
      options: [],
      correctAnswer: sentence,
      explanation: "Any close paraphrase of the source idea is accepted."
    };
  });
};

module.exports = {
  generateFallbackFlashcards,
  generateFallbackQuiz
};
