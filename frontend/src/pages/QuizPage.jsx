import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import QuizQuestionCard from "../components/QuizQuestionCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchDocumentById } from "../services/documentService";
import { evaluateQuiz, generateQuiz } from "../services/aiService";

const QuizPage = () => {
  const { documentId } = useParams();

  const [document, setDocument] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [responses, setResponses] = useState({});
  const [count, setCount] = useState(8);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState("");

  const loadDocument = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchDocumentById(documentId);
      setDocument(data.document);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load document");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const answeredCount = useMemo(
    () => Object.values(responses).filter((value) => String(value || "").trim()).length,
    [responses]
  );

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setError("");
    setResult(null);

    try {
      const data = await generateQuiz({ documentId, count });
      setQuizId(data.quizId);
      setQuestions(data.questions || []);
      setResponses({});
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Quiz generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmitQuiz = async () => {
    if (!quizId || questions.length === 0) {
      setError("Generate a quiz first.");
      return;
    }

    setIsEvaluating(true);
    setError("");

    try {
      const payload = {
        quizId,
        responses: questions.map((question) => ({
          questionId: question.id,
          answer: responses[question.id] || ""
        }))
      };

      const data = await evaluateQuiz(payload);
      setResult(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Quiz evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6">
        <LoadingSpinner label="Loading quiz workspace..." />
      </div>
    );
  }

  if (!document) {
    return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-5">
      <section className="glass-panel flex flex-wrap items-end justify-between gap-4 p-5">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">{document.title}</h2>
          <p className="text-sm text-ink-500">Generate AI quizzes with instant grading feedback.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="count" className="text-xs uppercase tracking-wide text-ink-500">
            Questions
          </label>
          <input
            id="count"
            type="number"
            min={4}
            max={15}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="input-field w-20"
          />
          <button type="button" onClick={handleGenerateQuiz} disabled={isGenerating} className="btn-primary gap-2">
            {isGenerating ? <LoadingSpinner size="sm" label="Generating" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "" : "Generate Quiz"}
          </button>
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {questions.length > 0 ? (
        <section className="space-y-4">
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm text-ink-600">
              <ClipboardCheck className="h-4 w-4 text-brand-600" />
              Answered {answeredCount} / {questions.length}
            </div>
            <button
              type="button"
              onClick={onSubmitQuiz}
              disabled={isEvaluating}
              className="btn-primary gap-2"
            >
              {isEvaluating ? <LoadingSpinner size="sm" label="Evaluating" /> : <CheckCircle2 className="h-4 w-4" />}
              {isEvaluating ? "" : "Submit Quiz"}
            </button>
          </div>

          {questions.map((question, index) => (
            <QuizQuestionCard
              key={question.id}
              index={index}
              question={question}
              value={responses[question.id] || ""}
              onChange={(value) =>
                setResponses((prev) => ({
                  ...prev,
                  [question.id]: value
                }))
              }
            />
          ))}
        </section>
      ) : null}

      {result ? (
        <section className="glass-panel space-y-4 p-5">
          <div className="rounded-xl bg-brand-50 p-4">
            <h3 className="text-lg font-semibold text-brand-800">Score: {result.score} / {result.totalQuestions}</h3>
            <p className="text-sm text-brand-700">Percentage: {result.percentage}%</p>
          </div>

          <div className="space-y-3">
            {result.feedback.map((item) => (
              <article
                key={item.questionId}
                className={`rounded-xl border p-3 ${item.isCorrect ? "border-brand-100 bg-brand-50/60" : "border-amber-200 bg-amber-50/70"}`}
              >
                <p className="text-sm font-semibold text-ink-900">{item.question}</p>
                <p className="mt-1 text-xs text-ink-600">Your answer: {item.userAnswer || "(blank)"}</p>
                {!item.isCorrect ? (
                  <p className="mt-1 text-xs text-ink-600">Correct answer: {item.correctAnswer}</p>
                ) : null}
                <p className="mt-2 text-xs text-ink-700">{item.feedback}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default QuizPage;
