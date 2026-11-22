import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, GraduationCap, FileText, Bell, User } from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scholarships", label: "Schemes", icon: GraduationCap },
  { to: "/applications", label: "My Apps", icon: FileText },
  { to: "/notifications", label: "Alerts", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col max-w-md mx-auto relative shadow-2xl">
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-stone-200 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    active ? "bg-emerald-700 text-white" : "text-stone-500"
                  }`}
                >
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-emerald-800" : "text-stone-400"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}