import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenCheck, FileText, MessageSquare, Sparkles, TimerReset } from "lucide-react";
import UploadDocumentCard from "../components/UploadDocumentCard";
import SkeletonCard from "../components/SkeletonCard";
import { fetchDocuments, uploadDocument } from "../services/documentService";
import { generateSummary } from "../services/aiService";

const prettyBytes = (bytes = 0) => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unitIndex).toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryMap, setSummaryMap] = useState({});
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});

  const loadDocuments = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchDocuments();
      setDocuments(data.documents || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async ({ title, file }) => {
    await uploadDocument({ title, file });
    await loadDocuments();
  };

  const handleGenerateSummary = async (documentId) => {
    setSummaryLoadingMap((prev) => ({ ...prev, [documentId]: true }));

    try {
      const data = await generateSummary({ documentId });
      setSummaryMap((prev) => ({ ...prev, [documentId]: data.summary }));
    } catch (apiError) {
      setSummaryMap((prev) => ({
        ...prev,
        [documentId]: apiError?.response?.data?.message || "Summary generation failed"
      }));
    } finally {
      setSummaryLoadingMap((prev) => ({ ...prev, [documentId]: false }));
    }
  };

  const quickStats = useMemo(
    () => [
      {
        label: "Documents",
        value: documents.length,
        icon: FileText
      },
      {
        label: "Chat Sessions",
        value: documents.length,
        icon: MessageSquare
      },
      {
        label: "Revision Packs",
        value: documents.length * 2,
        icon: BookOpenCheck
      }
    ],
    [documents]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        {quickStats.map((item) => (
          <div key={item.label} className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">{item.label}</p>
              <item.icon className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-ink-900">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_1.95fr]">
        <UploadDocumentCard onUpload={handleUpload} />

        <div className="glass-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">Your Documents</h3>
              <p className="text-sm text-ink-500">Launch chat, flashcards, quiz, and summaries.</p>
            </div>
            <button type="button" onClick={loadDocuments} className="btn-secondary gap-2 py-2 text-xs">
              <TimerReset className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <SkeletonCard className="h-24" />
              <SkeletonCard className="h-24" />
            </div>
          ) : null}

          {!isLoading && error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          {!isLoading && !error && documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-ink-50/70 p-8 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-brand-600" />
              <p className="mt-3 text-sm text-ink-600">
                Upload your first document to unlock AI chat, flashcards, quizzes, and summaries.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((document) => (
                <article key={document._id} className="rounded-2xl border border-ink-100 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="text-base font-semibold text-ink-900">{document.title}</h4>
                      <p className="text-xs text-ink-500">
                        {document.fileType.toUpperCase()} - {prettyBytes(document.fileSize)} - Uploaded {formatDate(document.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/chat/${document._id}`} className="btn-secondary py-2 text-xs">
                        Chat
                      </Link>
                      <Link to={`/flashcards/${document._id}`} className="btn-secondary py-2 text-xs">
                        Flashcards
                      </Link>
                      <Link to={`/quiz/${document._id}`} className="btn-secondary py-2 text-xs">
                        Quiz
                      </Link>
                    </div>
                  </div>

                  <p className="mt-3 rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
                    {summaryMap[document._id] || document.summaryPreview || "No summary yet."}
                  </p>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleGenerateSummary(document._id)}
                      disabled={summaryLoadingMap[document._id]}
                      className="btn-primary py-2 text-xs"
                    >
                      {summaryLoadingMap[document._id] ? "Generating summary..." : "Refresh Summary"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
