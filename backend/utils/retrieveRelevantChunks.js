const STOP_WORDS = new Set([
  "the",
  "is",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
  "on",
  "at",
  "by",
  "with",
  "what",
  "why",
  "how",
  "when",
  "where"
]);

const tokenize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));

const retrieveRelevantChunks = (chunks, query, topK = 4) => {
  if (!chunks.length) {
    return [];
  }

  const queryTokens = tokenize(query);

  if (!queryTokens.length) {
    return chunks.slice(0, topK);
  }

  const scored = chunks.map((chunk, idx) => {
    const tokens = tokenize(chunk);
    const tokenSet = new Set(tokens);

    let score = 0;
    for (const queryToken of queryTokens) {
      if (tokenSet.has(queryToken)) {
        score += 1;
      }
    }

    return {
      idx,
      chunk,
      score
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item) => item.chunk);
};

module.exports = {
  retrieveRelevantChunks
};
