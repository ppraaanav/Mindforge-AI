const Chat = require("../models/Chat");
const Document = require("../models/Document");
const QuizAttempt = require("../models/QuizAttempt");
const asyncHandler = require("../utils/asyncHandler");

const toDateKey = (date) => new Date(date).toISOString().split("T")[0];

const buildLastNDates = (days) => {
  const dates = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() - i);
    dates.push(date);
  }

  return dates;
};

const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const weekAgo = new Date();
  weekAgo.setHours(0, 0, 0, 0);
  weekAgo.setDate(weekAgo.getDate() - 6);

  const [documentsCount, quizAttemptsCount, recentQuizAttempts, weeklyQuizAttempts, chats, documents] = await Promise.all([
    Document.countDocuments({ user: userId }),
    QuizAttempt.countDocuments({ user: userId }),
    QuizAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(20),
    QuizAttempt.find({ user: userId, createdAt: { $gte: weekAgo } }).select("createdAt"),
    Chat.find({ user: userId }).select("messages"),
    Document.find({ user: userId }).select("createdAt")
  ]);

  const avgQuizScore = recentQuizAttempts.length
    ? Math.round(
        recentQuizAttempts.reduce((sum, item) => {
          const percentage = item.totalQuestions ? (item.score / item.totalQuestions) * 100 : 0;
          return sum + percentage;
        }, 0) / recentQuizAttempts.length
      )
    : 0;

  const chatMessagesCount = chats.reduce((sum, chat) => sum + chat.messages.length, 0);

  const quizPerformance = recentQuizAttempts
    .slice()
    .reverse()
    .map((attempt) => ({
      date: attempt.createdAt,
      score: attempt.totalQuestions ? Math.round((attempt.score / attempt.totalQuestions) * 100) : 0
    }));

  const recentDates = buildLastNDates(7);
  const activityMap = new Map(
    recentDates.map((date) => [toDateKey(date), { date: toDateKey(date), documents: 0, chats: 0, quizzes: 0 }])
  );

  for (const doc of documents) {
    const key = toDateKey(doc.createdAt);
    if (activityMap.has(key)) {
      activityMap.get(key).documents += 1;
    }
  }

  for (const attempt of weeklyQuizAttempts) {
    const key = toDateKey(attempt.createdAt);
    if (activityMap.has(key)) {
      activityMap.get(key).quizzes += 1;
    }
  }

  for (const chat of chats) {
    for (const message of chat.messages) {
      const key = toDateKey(message.timestamp || new Date());
      if (activityMap.has(key) && message.role === "user") {
        activityMap.get(key).chats += 1;
      }
    }
  }

  res.status(200).json({
    metrics: {
      documentsCount,
      quizAttemptsCount,
      avgQuizScore,
      chatMessagesCount
    },
    quizPerformance,
    learningActivity: Array.from(activityMap.values())
  });
});

module.exports = {
  getAnalyticsOverview
};
