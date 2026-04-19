import { useEffect, useRef, useState } from "react";
import { Bot, SendHorizontal, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import ChatBubble from "../components/ChatBubble";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchDocumentById } from "../services/documentService";
import { fetchChatHistory, generateSummary, sendChatMessage } from "../services/aiService";

const DocumentChatPage = () => {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const feedRef = useRef(null);

  const loadPage = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [docRes, historyRes] = await Promise.all([
        fetchDocumentById(documentId),
        fetchChatHistory(documentId)
      ]);
      setDocument(docRes.document);
      setMessages(historyRes.messages || []);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Could not load document chat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [documentId]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const onSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || isSending) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSending(true);

    try {
      const data = await sendChatMessage({
        documentId,
        message: userMessage.content
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (apiError) {
      setMessages((prev) => prev.slice(0, -1));
      setError(apiError?.response?.data?.message || "Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const onGenerateSummary = async () => {
    setError("");
    setIsSummaryLoading(true);

    try {
      const data = await generateSummary({
        documentId,
        sectionPrompt: summaryPrompt.trim()
      });
      setSummary(data.summary);
    } catch (apiError) {
      setSummary(apiError?.response?.data?.message || "Summary request failed.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="glass-panel p-6">
        <LoadingSpinner label="Loading chat workspace..." />
      </div>
    );
  }

  if (error && !document) {
    return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
      <section className="glass-panel flex h-[72vh] flex-col overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <h3 className="text-lg font-semibold text-ink-900">{document?.title}</h3>
          <p className="text-sm text-ink-500">Ask questions grounded in this document only.</p>
        </div>

        <div ref={feedRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/70 px-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-white p-4 text-sm text-ink-500">
              Start by asking a question about this document.
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatBubble
                key={`${message.timestamp}-${index}`}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))
          )}
        </div>

        <form onSubmit={onSend} className="border-t border-ink-100 bg-white p-4">
          <div className="flex items-end gap-3">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about concepts, definitions, or examples..."
              className="input-field min-h-[52px] resize-none"
            />
            <button type="submit" disabled={isSending} className="btn-primary h-[46px] gap-2 px-4">
              <SendHorizontal className="h-4 w-4" />
              {isSending ? "Sending" : "Send"}
            </button>
          </div>
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </form>
      </section>

      <section className="glass-panel h-fit space-y-4 p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">AI Summary Studio</h3>
            <p className="text-xs text-ink-500">Summarize full document or specific section.</p>
          </div>
        </div>

        <textarea
          rows={3}
          className="input-field"
          placeholder="Optional focus, e.g. summarize chapters on neural networks"
          value={summaryPrompt}
          onChange={(event) => setSummaryPrompt(event.target.value)}
        />

        <button type="button" onClick={onGenerateSummary} disabled={isSummaryLoading} className="btn-primary w-full">
          {isSummaryLoading ? "Generating summary..." : "Generate Summary"}
        </button>

        <div className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-sm text-ink-700">
          {summary || (
            <div className="flex items-center gap-2 text-ink-500">
              <Bot className="h-4 w-4" />
              Summary output appears here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentChatPage;
