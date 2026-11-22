import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, CheckCircle2, FileText, Calendar, IndianRupee, ExternalLink, Upload, Loader2 } from "lucide-react";

export default function ScholarshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    base44.entities.Scholarship.get(id)
      .then(setScholarship)
      .finally(() => setLoading(false));
  }, [id]);

  const apply = async () => {
    setApplying(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.Application.create({
        scholarship_name: scholarship.name,
        scholarship_id: scholarship.id,
        applicant_name: me?.full_name || "Student",
        status: "pending",
        submitted_date: new Date().toISOString().slice(0, 10),
        documents: scholarship.required_documents || [],
        payment_status: "not_started",
        renewal_status: "not_applicable",
      });
      setApplied(true);
      setTimeout(() => navigate("/applications"), 1200);
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="px-5 pt-20 text-center text-stone-400">Loading…</div>;
  if (!scholarship) return <div className="px-5 pt-20 text-center text-stone-400">Scholarship not found.</div>;

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 px-5 pt-12 pb-6 text-white rounded-b-3xl">
        <Link to="/scholarships" className="inline-flex items-center gap-1 text-emerald-100 text-sm mb-4">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-200">
          {scholarship.category?.replace("-", " ")}
        </span>
        <h1 className="text-xl font-bold leading-snug mt-1">{scholarship.name}</h1>
        {scholarship.scholarship_amount && (
          <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full mt-3">
            <IndianRupee size={14} />
            <span className="text-sm font-semibold">{scholarship.scholarship_amount}</span>
          </div>
        )}
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* Description */}
        <Section title="Overview">
          <p className="text-stone-600 text-sm leading-relaxed">{scholarship.description}</p>
        </Section>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <Calendar size={16} className="text-emerald-600 mb-1.5" />
            <p className="text-stone-400 text-xs">Start Date</p>
            <p className="font-semibold text-stone-800 text-sm">{scholarship.application_start_date || "—"}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <Calendar size={16} className="text-rose-500 mb-1.5" />
            <p className="text-stone-400 text-xs">Closing Date</p>
            <p className="font-semibold text-stone-800 text-sm">{scholarship.application_closing_date || "—"}</p>
          </div>
        </div>

        {/* Eligibility */}
        <Section title="Eligibility Criteria" icon={<CheckCircle2 size={16} className="text-emerald-600" />}>
          <p className="text-stone-600 text-sm leading-relaxed">{scholarship.eligibility_criteria}</p>
        </Section>

        <Section title="Income Criteria">
          <p className="text-stone-600 text-sm leading-relaxed">{scholarship.income_criteria}</p>
        </Section>

        <Section title="Educational Qualification">
          <p className="text-stone-600 text-sm leading-relaxed">{scholarship.educational_qualification}</p>
        </Section>

        {/* Documents */}
        <Section title="Required Documents" icon={<FileText size={16} className="text-amber-600" />}>
          <ul className="space-y-2">
            {(scholarship.required_documents || []).map((doc, i) => (
              <li key={i} className="flex items-start gap-2 text-stone-600 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
        </Section>

        {/* Official link */}
        {scholarship.official_link && (
          <a
            href={scholarship.official_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between bg-white rounded-2xl p-4 border border-stone-100 shadow-sm"
          >
            <span className="text-stone-700 text-sm font-medium">Official Application Portal</span>
            <ExternalLink size={16} className="text-emerald-700" />
          </a>
        )}
      </div>

      {/* Apply button */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-5">
        {applied ? (
          <div className="bg-emerald-600 text-white py-3.5 rounded-2xl font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Application Submitted!
          </div>
        ) : (
          <button
            onClick={apply}
            disabled={applying}
            className="w-full bg-emerald-700 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition"
          >
            {applying ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {applying ? "Submitting…" : "Apply Now"}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="font-semibold text-stone-800 text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}