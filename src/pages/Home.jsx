import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { GraduationCap, FileText, Bell, ChevronRight, CheckCircle2, Wallet, Calendar } from "lucide-react";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profiles, apps, notifs] = await Promise.all([
          base44.entities.StudentProfile.list().catch(() => []),
          base44.entities.Application.list().catch(() => []),
          base44.entities.Notification.list().catch(() => []),
        ]);
        setProfile(profiles[0] || null);
        setApplications(apps);
        setNotifications(notifs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const pending = applications.filter((a) => a.status === "pending" || a.status === "under_verification").length;

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-stone-500 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-stone-800">
            {profile?.full_name || "Student"}
          </h1>
        </div>
        <Link to="/notifications" className="relative">
          <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-stone-100">
            <Bell size={20} className="text-stone-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-5 text-white shadow-lg mb-6">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={18} />
          <span className="text-emerald-100 text-sm font-medium">Tribal Scholarship Portal</span>
        </div>
        <p className="text-lg font-semibold leading-snug mb-4">
          Discover, apply & track government scholarships for ST students
        </p>
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-1.5 bg-white text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold"
        >
          Browse Schemes <ChevronRight size={16} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-stone-500 text-xs">Approved</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{approved}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-amber-600" />
            <span className="text-stone-500 text-xs">In Process</span>
          </div>
          <p className="text-2xl font-bold text-stone-800">{pending}</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-stone-800 font-semibold mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/eligibility" className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm active:scale-95 transition">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
            <CheckCircle2 size={20} className="text-amber-600" />
          </div>
          <p className="font-semibold text-stone-800 text-sm">Check Eligibility</p>
        </Link>
        <Link to="/applications" className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm active:scale-95 transition">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-2">
            <Wallet size={20} className="text-sky-600" />
          </div>
          <p className="font-semibold text-stone-800 text-sm">Track Payments</p>
        </Link>
      </div>

      {/* Recent applications */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-stone-800 font-semibold">Recent Applications</h2>
        <Link to="/applications" className="text-emerald-700 text-sm font-medium">View all</Link>
      </div>
      {loading ? (
        <div className="text-stone-400 text-sm">Loading…</div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-5 border border-stone-100 text-center">
          <p className="text-stone-500 text-sm mb-3">No applications yet</p>
          <Link to="/scholarships" className="text-emerald-700 text-sm font-semibold">Apply for a scholarship →</Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {applications.slice(0, 3).map((app) => (
            <Link key={app.id} to="/applications" className="block bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 text-sm truncate">{app.scholarship_name}</p>
                  <p className="text-stone-400 text-xs mt-0.5 flex items-center gap-1">
                    <Calendar size={11} /> {app.submitted_date}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-amber-100 text-amber-700",
    under_verification: "bg-sky-100 text-sky-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  const label = status === "under_verification" ? "Verifying" : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${map[status] || ""}`}>{label}</span>;
}