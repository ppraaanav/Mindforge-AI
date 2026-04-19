const chunkText = (text, chunkSize = 1200, overlap = 180) => {
  if (!text) {
    return [];
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();
  if (!normalizedText) {
    return [];
  }

  const chunks = [];
  let start = 0;

  while (start < normalizedText.length) {
    const end = Math.min(start + chunkSize, normalizedText.length);
    chunks.push(normalizedText.slice(start, end));

    if (end === normalizedText.length) {
      break;
    }

    start = Math.max(end - overlap, 0);
  }

  return chunks;
};

module.exports = {
  chunkText
};
