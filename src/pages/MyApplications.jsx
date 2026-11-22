import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { FileText, Calendar, Wallet, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const filters = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "under_verification", label: "Verifying" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.Application.list("-submitted_date")
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  const filtered = applications.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">My Applications</h1>
      <p className="text-stone-500 text-sm mb-5">Track status & payments</p>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-3">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === f.id ? "bg-emerald-700 text-white" : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm py-10 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center mt-4">
          <FileText size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No applications in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-stone-100 shadow-sm active:scale-[0.98] transition"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-stone-800 text-sm flex-1 pr-2">{app.scholarship_name}</p>
                <StatusBadge status={app.status} />
              </div>
              <p className="text-stone-400 text-xs flex items-center gap-1">
                <Calendar size={11} /> Submitted {app.submitted_date}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Detail sheet */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setSelected(null)}>
          <div
            className="bg-white w-full max-w-md mx-auto rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-stone-800 text-lg flex-1 pr-3">{selected.scholarship_name}</h2>
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-3">
              <DetailRow icon={<Calendar size={16} />} label="Submitted Date" value={selected.submitted_date} />
              <DetailRow
                icon={<FileText size={16} />}
                label="Documents"
                value={(selected.documents || []).join(", ") || "—"}
              />
              <DetailRow
                icon={<Wallet size={16} />}
                label="Payment Status"
                value={paymentLabel(selected.payment_status)}
                highlight={selected.payment_status === "disbursed" ? "emerald" : null}
              />
              <DetailRow icon={<RefreshCw size={16} />} label="Renewal Status" value={renewalLabel(selected.renewal_status)} />
              {selected.status === "rejected" && selected.rejection_reason && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-rose-700 text-sm">{selected.rejection_reason}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full mt-5 bg-stone-100 text-stone-700 py-3 rounded-2xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100">
      <div className="flex items-center gap-2 text-stone-500 text-sm">
        {icon} {label}
      </div>
      <span className={`text-sm font-medium ${highlight === "emerald" ? "text-emerald-700" : "text-stone-800"}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { cls: "bg-amber-100 text-amber-700", icon: Clock },
    under_verification: { cls: "bg-sky-100 text-sky-700", icon: Clock },
    approved: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    rejected: { cls: "bg-rose-100 text-rose-700", icon: AlertCircle },
  };
  const label = status === "under_verification" ? "Verifying" : status.charAt(0).toUpperCase() + status.slice(1);
  const { cls } = map[status] || {};
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
}

function paymentLabel(s) {
  return { not_started: "Not Started", processing: "Processing", disbursed: "Disbursed" }[s] || s;
}
function renewalLabel(s) {
  return { not_applicable: "N/A", eligible: "Eligible", renewed: "Renewed" }[s] || s;
}