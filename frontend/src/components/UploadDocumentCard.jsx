import { useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const UploadDocumentCard = ({ onUpload }) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const fileName = useMemo(() => file?.name || "No file selected", [file]);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF or text file.");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      await onUpload({ title, file });
      setTitle("");
      setFile(null);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="glass-panel animate-rise space-y-4 p-5" onSubmit={onSubmit}>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-2 text-brand-700">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ink-900">Upload Learning Document</h3>
          <p className="text-sm text-ink-500">PDF or text only, up to 10MB</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="doc-title" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
            Title (optional)
          </label>
          <input
            id="doc-title"
            className="input-field"
            placeholder="My Biology Notes"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="doc-file" className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
            File
          </label>
          <input
            id="doc-file"
            type="file"
            accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            className="input-field cursor-pointer file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700"
          />
          <p className="mt-1 text-xs text-ink-500">{fileName}</p>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button type="submit" disabled={isUploading} className="btn-primary w-full gap-2">
        {isUploading ? <LoadingSpinner label="Processing file..." size="sm" /> : "Upload & Index"}
      </button>
    </form>
  );
};

export default UploadDocumentCard;
