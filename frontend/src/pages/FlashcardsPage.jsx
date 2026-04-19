import { useEffect, useState } from "react";
import { Layers3, RotateCw } from "lucide-react";
import { useParams } from "react-router-dom";
import FlashcardItem from "../components/FlashcardItem";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchDocumentById } from "../services/documentService";
import { generateFlashcards } from "../services/aiService";

const FlashcardsPage = () => {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [count, setCount] = useState(8);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const onGenerate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const data = await generateFlashcards({ documentId, count });
      setFlashcards(data.flashcards || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6">
        <LoadingSpinner label="Loading flashcards workspace..." />
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
          <p className="text-sm text-ink-500">Generate AI flashcards and flip through answers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-wide text-ink-500" htmlFor="count">
            Card Count
          </label>
          <input
            id="count"
            type="number"
            min={3}
            max={20}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className="input-field w-20"
          />
          <button type="button" onClick={onGenerate} disabled={isGenerating} className="btn-primary gap-2">
            {isGenerating ? <LoadingSpinner size="sm" label="Generating" /> : <RotateCw className="h-4 w-4" />}
            {isGenerating ? "" : "Generate"}
          </button>
        </div>
      </section>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      {!isGenerating && flashcards.length === 0 ? (
        <div className="glass-panel p-10 text-center">
          <Layers3 className="mx-auto h-10 w-10 text-brand-600" />
          <h3 className="mt-3 text-lg font-semibold text-ink-900">No flashcards yet</h3>
          <p className="mt-1 text-sm text-ink-500">Click Generate to create revision cards from your document.</p>
        </div>
      ) : null}

      {isGenerating ? (
        <div className="glass-panel p-8">
          <LoadingSpinner label="Generating personalized flashcards..." />
        </div>
      ) : null}

      {!isGenerating && flashcards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flashcards.map((card, index) => (
            <FlashcardItem key={`${card.question}-${index}`} card={card} index={index} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default FlashcardsPage;
