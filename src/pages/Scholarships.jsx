import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search, ChevronRight } from "lucide-react";

const categories = [
  { id: "all", label: "All" },
  { id: "pre-matric", label: "Pre-Matric" },
  { id: "post-matric", label: "Post-Matric" },
  { id: "fellowship", label: "Fellowship" },
  { id: "top-class", label: "Top Class" },
  { id: "state", label: "State" },
];

export default function Scholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    base44.entities.Scholarship.list()
      .then(setScholarships)
      .finally(() => setLoading(false));
  }, []);

  const filtered = scholarships.filter((s) => {
    const matchCat = category === "all" || s.category === category;
    const matchQuery = !query || s.name?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Government Schemes</h1>
      <p className="text-stone-500 text-sm mb-5">Scholarships for ST / Tribal students</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search scholarships…"
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-emerald-600"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 mb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              category === c.id
                ? "bg-emerald-700 text-white"
                : "bg-white text-stone-600 border border-stone-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-stone-400 text-sm py-10 text-center">Loading scholarships…</div>
      ) : filtered.length === 0 ? (
        <div className="text-stone-400 text-sm py-10 text-center">No scholarships found.</div>
      ) : (
        <div className="space-y-3 mt-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={`/scholarships/${s.id}`}
              className="block bg-white rounded-2xl p-4 border border-stone-100 shadow-sm active:scale-[0.98] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    {s.category?.replace("-", " ")}
                  </span>
                  <p className="font-semibold text-stone-800 mt-0.5 leading-snug">{s.name}</p>
                  <p className="text-stone-500 text-xs mt-1.5 line-clamp-2">{s.description}</p>
                  {s.scholarship_amount && (
                    <p className="text-emerald-700 font-semibold text-sm mt-2">{s.scholarship_amount}</p>
                  )}
                </div>
                <ChevronRight size={18} className="text-stone-300 mt-1 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}