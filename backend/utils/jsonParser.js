const extractJsonText = (raw) => {
  const trimmed = raw.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch && objectMatch[0]) {
    return objectMatch[0].trim();
  }

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch && arrayMatch[0]) {
    return arrayMatch[0].trim();
  }

  return trimmed;
};

const parseJsonFromModel = (raw) => {
  const jsonText = extractJsonText(raw);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("AI response was not valid JSON");
  }
};

module.exports = {
  parseJsonFromModel
};
