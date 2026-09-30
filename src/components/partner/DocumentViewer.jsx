import { useEffect, useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import api from "../../services/api";

/** Read-only in-page preview of one of the influencer's own documents. */
export default function DocumentViewer({ doc, title, onClose, onDownload }) {
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    api.get(`/partner/documents/${doc._id}/download`, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        // Force the right type so the browser renders it instead of downloading.
        const blob = new Blob([res.data], { type: doc.file.mimeType || res.data.type || "application/pdf" });
        objectUrl = window.URL.createObjectURL(blob);
        setFileUrl(objectUrl);
      })
      .catch(() => { if (!cancelled) setError("Couldn't load a preview of this file. Try downloading it instead."); });

    return () => {
      cancelled = true;
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [doc._id, doc.file.mimeType]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isImage = doc.file.mimeType?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400 truncate">{doc.file.originalName}</p>
          </div>
          <div className="flex items-center gap-1">
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Open in new tab" title="Open in new tab">
                <ExternalLink size={18} />
              </a>
            )}
            <button type="button" onClick={onDownload} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Download" title="Download">
              <Download size={18} />
            </button>
            <button type="button" onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 overflow-auto">
          {error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : !fileUrl ? (
            <p className="p-6 text-sm text-slate-400">Loading preview...</p>
          ) : isImage ? (
            <img src={fileUrl} alt={title} className="max-w-full mx-auto p-4" />
          ) : (
            <iframe src={fileUrl} title={title} className="w-full h-full border-0 bg-white" />
          )}
        </div>
      </div>
    </div>
  );
}
