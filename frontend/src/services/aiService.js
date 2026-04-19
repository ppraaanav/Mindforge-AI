import api from "./api";

export const fetchChatHistory = async (documentId) => {
  const { data } = await api.get(`/ai/chat-history/${documentId}`);
  return data;
};

export const sendChatMessage = async (payload) => {
  const { data } = await api.post("/ai/chat", payload);
  return data;
};

export const generateSummary = async (payload) => {
  const { data } = await api.post("/ai/summary", payload);
  return data;
};

export const generateFlashcards = async (payload) => {
  const { data } = await api.post("/ai/flashcards", payload);
  return data;
};

export const generateQuiz = async (payload) => {
  const { data } = await api.post("/ai/quiz", { ...payload, action: "generate" });
  return data;
};

export const evaluateQuiz = async (payload) => {
  const { data } = await api.post("/ai/quiz", { ...payload, action: "evaluate" });
  return data;
};
