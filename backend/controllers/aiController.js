const Chat = require("../models/Chat");
const Document = require("../models/Document");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const asyncHandler = require("../utils/asyncHandler");
const { chunkText } = require("../utils/chunkText");
const { retrieveRelevantChunks } = require("../utils/retrieveRelevantChunks");
const { generateFromGemini } = require("../utils/geminiService");
const { parseJsonFromModel } = require("../utils/jsonParser");
const {
  generateFallbackFlashcards,
  generateFallbackQuiz
} = require("../utils/generateFallbackContent");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getDocumentForUser = async (documentId, userId) => {
  const document = await Document.findOne({ _id: documentId, user: userId });
  if (!document) {
    const error = new Error("Document not found");
    error.statusCode = 404;
    throw error;
  }
  return document;
};

const getOrCreateChat = async (documentId, userId) => {
  const existing = await Chat.findOne({ document: documentId, user: userId });
  if (existing) {
    return existing;
  }
  return Chat.create({
    user: userId,
    document: documentId,
    messages: []
  });
};

const isShortAnswerCorrect = (userAnswer, correctAnswer) => {
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  if (!normalizedUser) {
    return false;
  }

  if (normalizedCorrect === normalizedUser) {
    return true;
  }

  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    return true;
  }

  const userTokens = new Set(normalizedUser.split(" ").filter(Boolean));
  const correctTokens = new Set(normalizedCorrect.split(" ").filter(Boolean));
  if (!userTokens.size || !correctTokens.size) {
    return false;
  }

  let overlap = 0;
  for (const token of userTokens) {
    if (correctTokens.has(token)) {
      overlap += 1;
    }
  }

  const ratio = overlap / correctTokens.size;
  return ratio >= 0.55;
};

const normalizeFlashcards = (candidate) => {
  if (!Array.isArray(candidate)) {
    return [];
  }

  return candidate
    .map((item) => ({
      question: typeof item.question === "string" ? item.question.trim() : "",
      answer: typeof item.answer === "string" ? item.answer.trim() : ""
    }))
    .filter((item) => item.question && item.answer);
};

const normalizeQuizQuestions = (candidate, desiredCount) => {
  const source = Array.isArray(candidate) ? candidate : [];

  const normalized = source
    .map((item) => {
      const type = item.type === "short" ? "short" : "mcq";
      const question = typeof item.question === "string" ? item.question.trim() : "";
      const explanation = typeof item.explanation === "string" ? item.explanation.trim() : "";

      if (type === "mcq") {
        const options = Array.isArray(item.options)
          ? item.options.map((option) => String(option || "").trim()).filter(Boolean)
          : [];
        const correctAnswer = String(item.correctAnswer || item.answer || "").trim();

        if (!question || !correctAnswer || options.length < 2) {
          return null;
        }

        const hasAnswer = options.some(
          (option) => normalizeText(option) === normalizeText(correctAnswer)
        );

        const finalOptions = hasAnswer ? options : [correctAnswer, ...options].slice(0, 4);

        return {
          type,
          question,
          options: finalOptions,
          correctAnswer,
          explanation
        };
      }

      const correctAnswer = String(item.correctAnswer || item.answer || "").trim();
      if (!question || !correctAnswer) {
        return null;
      }

      return {
        type,
        question,
        options: [],
        correctAnswer,
        explanation
      };
    })
    .filter(Boolean);

  return normalized.slice(0, desiredCount);
};

const chatWithDocument = asyncHandler(async (req, res) => {
  const { documentId, message } = req.body;
  const cleanedMessage = String(message || "").trim();

  if (!documentId || !cleanedMessage) {
    res.status(400);
    throw new Error("documentId and message are required");
  }

  const document = await getDocumentForUser(documentId, req.user._id);
  const chat = await getOrCreateChat(document._id, req.user._id);

  const chunks = chunkText(document.text, 1300, 200);
  const relevantChunks = retrieveRelevantChunks(chunks, cleanedMessage, 5);
  const conversationPreview = chat.messages.slice(-8);

  const prompt = `You are MindForge AI, a document-grounded tutor.
Only answer with information present in the provided context.
If the answer is not in context, clearly say: "I could not find that in your uploaded document." 

Conversation so far:
${conversationPreview.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n") || "No prior conversation"}

User question:
${cleanedMessage}

Document context:
${relevantChunks.join("\n\n---\n\n")}

Return a direct, student-friendly answer in 2-6 sentences.`;

  const answer = await generateFromGemini(prompt);

  chat.messages.push({ role: "user", content: cleanedMessage, timestamp: new Date() });
  chat.messages.push({ role: "assistant", content: answer, timestamp: new Date() });
  await chat.save();

  res.status(200).json({
    answer,
    messageCount: chat.messages.length
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const documentId = req.params.id;
  await getDocumentForUser(documentId, req.user._id);

  const chat = await Chat.findOne({
    user: req.user._id,
    document: documentId
  }).select("messages updatedAt");

  res.status(200).json({
    messages: chat ? chat.messages : []
  });
});

const generateSummary = asyncHandler(async (req, res) => {
  const { documentId, sectionPrompt = "" } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error("documentId is required");
  }

  const document = await getDocumentForUser(documentId, req.user._id);

  const chunks = chunkText(document.text, 1400, 200);
  const selectedChunks = sectionPrompt
    ? retrieveRelevantChunks(chunks, sectionPrompt, 6)
    : chunks.slice(0, 8);

  const prompt = `You are a learning assistant.
Create a concise summary from the provided document content.

${sectionPrompt ? `Focus area requested by user: ${sectionPrompt}` : "Summarize the most important ideas from the whole document."}

Context:
${selectedChunks.join("\n\n---\n\n")}

Output format:
1) One short paragraph summary.
2) 4-6 bullet points with key insights.`;

  const summary = await generateFromGemini(prompt);

  document.summaryPreview = summary.slice(0, 220);
  await document.save();

  res.status(200).json({ summary });
});

const generateFlashcards = asyncHandler(async (req, res) => {
  const { documentId, count = 8 } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error("documentId is required");
  }

  const desiredCount = clamp(Number(count) || 8, 3, 20);
  const document = await getDocumentForUser(documentId, req.user._id);

  const chunks = chunkText(document.text, 1400, 160);
  const sourceContext = chunks.slice(0, 8).join("\n\n---\n\n");

  let flashcards = [];

  try {
    const prompt = `Create exactly ${desiredCount} study flashcards based only on the context.
Return strict JSON as an array of objects with keys: question, answer.
No markdown, no extra text.

Context:
${sourceContext}`;

    const raw = await generateFromGemini(prompt);
    const parsed = parseJsonFromModel(raw);
    flashcards = normalizeFlashcards(parsed).slice(0, desiredCount);
  } catch (error) {
    flashcards = [];
  }

  if (!flashcards.length) {
    flashcards = generateFallbackFlashcards(document.text, desiredCount);
  }

  res.status(200).json({ flashcards });
});

const generateQuiz = asyncHandler(async (req, res) => {
  const { documentId, count = 8 } = req.body;

  if (!documentId) {
    res.status(400);
    throw new Error("documentId is required for quiz generation");
  }

  const desiredCount = clamp(Number(count) || 8, 4, 15);
  const document = await getDocumentForUser(documentId, req.user._id);
  const chunks = chunkText(document.text, 1400, 180);

  let questions = [];

  try {
    const prompt = `Generate ${desiredCount} quiz questions from the context below.
Constraints:
- Mix MCQ and short-answer questions.
- Return strict JSON with shape:
{
  "questions": [
    {
      "type": "mcq" | "short",
      "question": "...",
      "options": ["..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}
- For short questions, options must be an empty array.
- No markdown or extra text.

Context:
${chunks.slice(0, 10).join("\n\n---\n\n")}`;

    const raw = await generateFromGemini(prompt);
    const parsed = parseJsonFromModel(raw);
    const parsedQuestions = Array.isArray(parsed) ? parsed : parsed.questions;
    questions = normalizeQuizQuestions(parsedQuestions, desiredCount);
  } catch (error) {
    questions = [];
  }

  if (!questions.length) {
    questions = generateFallbackQuiz(document.text, desiredCount);
  }

  const quiz = await Quiz.create({
    user: req.user._id,
    document: document._id,
    questions
  });

  const sanitizedQuestions = quiz.questions.map((question) => ({
    id: question._id,
    type: question.type,
    question: question.question,
    options: question.options
  }));

  res.status(200).json({
    quizId: quiz._id,
    questions: sanitizedQuestions
  });
});

const evaluateQuiz = asyncHandler(async (req, res) => {
  const { quizId, responses = [] } = req.body;

  if (!quizId || !Array.isArray(responses)) {
    res.status(400);
    throw new Error("quizId and responses[] are required for evaluation");
  }

  const quiz = await Quiz.findOne({ _id: quizId, user: req.user._id });
  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  const responseMap = new Map(
    responses.map((item) => [String(item.questionId), String(item.answer || "").trim()])
  );

  let score = 0;
  const evaluatedAnswers = quiz.questions.map((question) => {
    const userAnswer = responseMap.get(String(question._id)) || "";

    let isCorrect = false;
    if (question.type === "mcq") {
      isCorrect = normalizeText(userAnswer) === normalizeText(question.correctAnswer);
    } else {
      isCorrect = isShortAnswerCorrect(userAnswer, question.correctAnswer);
    }

    if (isCorrect) {
      score += 1;
    }

    return {
      questionId: question._id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
      feedback: isCorrect
        ? "Correct. Nice work!"
        : `Review this concept: ${question.explanation || "Compare your answer with the document details."}`
    };
  });

  await QuizAttempt.create({
    user: req.user._id,
    document: quiz.document,
    quiz: quiz._id,
    score,
    totalQuestions: quiz.questions.length,
    answers: evaluatedAnswers
  });

  res.status(200).json({
    score,
    totalQuestions: quiz.questions.length,
    percentage: quiz.questions.length ? Math.round((score / quiz.questions.length) * 100) : 0,
    feedback: evaluatedAnswers
  });
});

const quizHandler = asyncHandler(async (req, res, next) => {
  const action = req.body.action || "generate";

  if (action === "evaluate") {
    return evaluateQuiz(req, res, next);
  }

  return generateQuiz(req, res, next);
});

module.exports = {
  chatWithDocument,
  getChatHistory,
  generateSummary,
  generateFlashcards,
  quizHandler
};
