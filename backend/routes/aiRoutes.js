const express = require("express");
const router = express.Router();

const {
  chatWithDocument,
  getChatHistory,
  generateSummary,
  generateFlashcards,
  quizHandler
} = require("../controllers/aiController");

const { protect } = require("../middleware/authMiddleware");

router.post("/chat", protect, chatWithDocument);
router.get("/chat-history/:id", protect, getChatHistory);
router.post("/summary", protect, generateSummary); // ✅ ONLY ONE
router.post("/flashcards", protect, generateFlashcards);
router.post("/quiz", protect, quizHandler);

module.exports = router;