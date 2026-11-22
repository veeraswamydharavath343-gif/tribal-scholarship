import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Download, X, Loader2 } from "lucide-react";

export default function DocumentList({ files = [], onRemove }) {
  const [opening, setOpening] = useState(null);

  const open = async (file) => {
    setOpening(file.file_uri);
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri });
      window.open(signed_url, "_blank");
    } finally {
      setOpening(null);
    }
  };

  if (!files.length) {
    return <p className="text-stone-400 text-sm text-center py-3">No documents uploaded yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {files.map((file, i) => (
        <li
          key={`${file.file_uri}-${i}`}
          className="flex items-center gap-3 bg-stone-50 rounded-xl p-2.5 border border-stone-100"
        >
          <div className="w-9 h-9 rounded-lg bg-white border border-stone-200 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-800 truncate">{file.name}</p>
            {file.size && <p className="text-[11px] text-stone-400">{file.size}</p>}
          </div>
          <button
            onClick={() => open(file)}
            className="p-1.5 text-stone-500 hover:text-emerald-700 transition"
            aria-label={`Open ${file.name}`}
          >
            {opening === file.file_uri ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} />
            )}
          </button>
          {onRemove && (
            <button
              onClick={() => onRemove(file)}
              className="p-1.5 text-stone-400 hover:text-rose-600 transition"
              aria-label={`Remove ${file.name}`}
            >
              <X size={15} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}