import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function EligibilityChecker() {
  const [education, setEducation] = useState("");
  const [income, setIncome] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState(null);

  const check = () => {
    const inc = parseInt(income) || 999999;
    const eligible = [];
    if (education === "pre-matric") eligible.push("Pre-Matric Scholarship for ST Students");
    if (education === "post-matric" || education === "graduate" || education === "post-graduate")
      eligible.push("Post-Matric Scholarship for ST Students");
    if ((education === "post-graduate" || education === "research") && inc <= 800000)
      eligible.push("National Fellowship for ST Students");
    if ((education === "graduate" || education === "post-graduate") && inc <= 600000)
      eligible.push("Top Class Education Scheme for ST Students");
    if (category === "state") eligible.push("State Government ST Scholarships");

    setResult({ eligible, income: inc });
  };

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Eligibility Checker</h1>
      <p className="text-stone-500 text-sm mb-5">Find scholarships you qualify for</p>

      <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm space-y-4">
        <div>
          <label className="text-stone-500 text-xs font-medium block mb-1.5">Current Education Level</label>
          <select
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="">Select level</option>
            <option value="pre-matric">Pre-Matric (Class I–X)</option>
            <option value="post-matric">Post-Matric (Class XI–XII)</option>
            <option value="graduate">Graduate</option>
            <option value="post-graduate">Post-Graduate</option>
            <option value="research">Research / PhD</option>
          </select>
        </div>

        <div>
          <label className="text-stone-500 text-xs font-medium block mb-1.5">Annual Family Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 250000"
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="text-stone-500 text-xs font-medium block mb-1.5">Scholarship Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="">Select category</option>
            <option value="central">Central Government</option>
            <option value="state">State Government</option>
            <option value="both">Both</option>
          </select>
        </div>

        <button
          onClick={check}
          disabled={!education || !income}
          className="w-full bg-emerald-700 text-white py-3 rounded-2xl font-semibold disabled:opacity-50 active:scale-95 transition"
        >
          Check Eligibility
        </button>
      </div>

      {result && (
        <div className="mt-5">
          {result.eligible.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <p className="font-semibold text-stone-800">You may be eligible for:</p>
              </div>
              <div className="space-y-2.5">
                {result.eligible.map((s, i) => (
                  <Link
                    key={i}
                    to="/scholarships"
                    className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-4 active:scale-[0.98] transition"
                  >
                    <span className="text-stone-800 text-sm font-medium flex-1 pr-2">{s}</span>
                    <ArrowRight size={16} className="text-emerald-700 shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-2">
              <XCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-rose-700 text-sm">
                No scholarships match your current criteria. Try adjusting your education level or income.
              </p>
            </div>
          )}
          <p className="text-stone-400 text-xs mt-4 text-center">
            Results are indicative. Verify against official sources before applying.
          </p>
        </div>
      )}
    </div>
  );
}