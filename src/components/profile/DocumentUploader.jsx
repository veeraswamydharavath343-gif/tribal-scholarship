import { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Upload, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import DocumentList from "@/components/profile/DocumentList";

const ACCEPT = ["zip", "pdf", "jpg", "jpeg", "png", "doc", "docx"];
const MAX_BYTES = 25 * 1024 * 1024;

const CHIP = {
  zip: "bg-amber-200 text-stone-800",
  pdf: "bg-rose-200 text-stone-800",
  jpg: "bg-sky-200 text-stone-800",
  png: "bg-emerald-200 text-stone-800",
  doc: "bg-violet-200 text-stone-800",
  docx: "bg-violet-200 text-stone-800",
};

const extOf = (name) => (name.split(".").pop() || "").toLowerCase();
const fmtSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)}MB`
    : `${Math.max(1, Math.round(bytes / 1024))}KB`;

export default function DocumentUploader({ files = [], onChange }) {
  const inputRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pending = queue.filter((q) => !q.done);

  const addFiles = (fileList) => {
    setError("");
    const accepted = [];
    Array.from(fileList).forEach((file) => {
      const ext = extOf(file.name);
      if (!ACCEPT.includes(ext)) {
        setError(`${file.name} — only ZIP, PDF, JPG, PNG and Word files are allowed.`);
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name} — ${fmtSize(file.size)} is over the 25MB limit.`);
        return;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        name: file.name,
        size: file.size,
        type: ext === "jpeg" ? "jpg" : ext,
        progress: 0,
        done: false,
      });
    });
    if (accepted.length) setQueue((q) => [...q, ...accepted]);
  };

  const uploadAll = async () => {
    if (!pending.length) return;
    setUploading(true);
    setError("");
    const uploaded = [];
    try {
      for (const item of pending) {
        setQueue((q) => q.map((x) => (x.id === item.id ? { ...x, progress: 55 } : x)));
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file: item.file });
        uploaded.push({ name: item.name, file_uri, size: fmtSize(item.size) });
        setQueue((q) =>
          q.map((x) => (x.id === item.id ? { ...x, progress: 100, done: true } : x))
        );
      }
      onChange([...files, ...uploaded]);
      setQueue((q) => q.filter((x) => !x.done));
    } catch {
      setError("Upload failed. Please check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  const dropzone = (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer?.files) addFiles(e.dataTransfer.files);
      }}
      className={`group flex flex-col items-center justify-center text-center gap-2.5 px-4 py-7 rounded-2xl border-2 border-dashed cursor-pointer transition ${
        drag ? "border-emerald-600 bg-emerald-50" : "border-stone-300 bg-stone-50"
      }`}
    >
      <div className="relative w-20 h-14" aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 -ml-[20px] -mt-[26px] w-10 h-[52px] rounded-md border-2 border-stone-700 bg-sky-200 -rotate-[8deg] -translate-x-2 transition-transform duration-300 group-hover:-rotate-[20deg] group-hover:-translate-x-6" />
        <span className="absolute left-1/2 top-1/2 -ml-[20px] -mt-[26px] w-10 h-[52px] rounded-md border-2 border-stone-700 bg-emerald-200 rotate-[2deg] transition-transform duration-300 group-hover:-translate-y-1.5" />
        <span className="absolute left-1/2 top-1/2 -ml-[20px] -mt-[26px] w-10 h-[52px] rounded-md border-2 border-stone-700 bg-amber-200 rotate-[9deg] translate-x-2 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:translate-x-6" />
      </div>
      <p className="text-sm font-semibold text-stone-800 leading-snug">
        Drag and drop or{" "}
        <span className="italic font-medium text-emerald-700 underline underline-offset-2">
          choose files
        </span>{" "}
        to upload
      </p>
      <p className="text-xs text-stone-500">
        ZIP of all folders, or PDF, JPG, PNG, Word · up to 25MB each
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".zip,.pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );

  return (
    <div className="space-y-3">
      {dropzone}

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <p className="text-xs text-rose-700 leading-snug">{error}</p>
        </div>
      )}

      {queue.length > 0 && (
        <ul className="space-y-2">
          {queue.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-stone-200"
            >
              <div
                className={`w-9 h-11 rounded-md border-2 border-stone-700 flex items-center justify-center shrink-0 text-[9px] font-bold uppercase ${
                  CHIP[item.type] || "bg-stone-200 text-stone-800"
                }`}
              >
                {item.type}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium text-stone-800 truncate">{item.name}</p>
                  <span className="text-[11px] text-stone-400 shrink-0">
                    {fmtSize(item.size)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-2 bg-stone-100 border border-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-stone-500 shrink-0 w-10 text-right">
                    {item.done ? "Done" : item.progress > 0 ? `${item.progress}%` : "Ready"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setQueue((q) => q.filter((x) => x.id !== item.id))}
                className="p-1.5 text-stone-400 hover:text-rose-600 transition shrink-0"
                aria-label={`Remove ${item.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-1">
        <p className="text-stone-500 text-xs font-medium mb-2">Uploaded files</p>
        <DocumentList
          files={files}
          onRemove={(file) => onChange(files.filter((f) => f.file_uri !== file.file_uri))}
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHelp((s) => !s)}
            aria-label="Help"
            aria-expanded={showHelp}
            className="w-8 h-8 rounded-full bg-white border-2 border-stone-300 text-stone-600 grid place-items-center hover:border-emerald-600 hover:text-emerald-700 transition"
          >
            <HelpCircle size={15} />
          </button>
          {showHelp && (
            <div className="absolute bottom-full left-0 mb-2 w-60 p-3 bg-white border border-stone-200 rounded-xl shadow-lg text-xs text-stone-600 leading-relaxed z-20">
              Put all your certificates in one folder and zip it, or pick files one by one. Files you
              upload are stored privately.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setQueue([])}
            disabled={!queue.length || uploading}
            className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-700 text-sm font-semibold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={uploadAll}
            disabled={!pending.length || uploading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 text-white text-sm font-semibold disabled:opacity-40"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {pending.length === 1 ? "Upload file" : "Upload all"}
          </button>
        </div>
      </div>
    </div>
  );
}