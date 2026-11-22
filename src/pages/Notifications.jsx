import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, CheckCircle2 } from "lucide-react";

const typeMeta = {
  deadline: { cls: "bg-rose-100 text-rose-600", label: "Deadline" },
  verification: { cls: "bg-sky-100 text-sky-600", label: "Verification" },
  status: { cls: "bg-stone-100 text-stone-600", label: "Status" },
  approval: { cls: "bg-emerald-100 text-emerald-600", label: "Approval" },
  payment: { cls: "bg-violet-100 text-violet-600", label: "Payment" },
  renewal: { cls: "bg-amber-100 text-amber-600", label: "Renewal" },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Notification.list("-created_date")
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, is_read: true })));
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Notifications</h1>
          <p className="text-stone-500 text-sm">Updates & reminders</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="text-emerald-700 text-sm font-medium">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-stone-400 text-sm py-10 text-center">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-stone-100 text-center">
          <Bell size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const meta = typeMeta[n.type] || typeMeta.status;
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`w-full text-left rounded-2xl p-4 border transition ${
                  n.is_read ? "bg-white border-stone-100" : "bg-emerald-50 border-emerald-100"
                } shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.cls}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-stone-800 text-sm">{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed">{n.message}</p>
                    <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                  {n.is_read && <CheckCircle2 size={14} className="text-stone-300 mt-1 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}