import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" }
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-ink-200 bg-white p-2 text-ink-700 shadow md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-ink-900/45 transition md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setIsOpen(false)}
        role="presentation"
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-ink-100 bg-white/95 px-4 pb-4 pt-6 shadow-lg backdrop-blur transition md:static md:z-0 md:translate-x-0 md:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-600">MindForge AI</p>
            <h1 className="mt-1 text-xl font-semibold text-ink-900">Learning Studio</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/20 p-2">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Learning Co-Pilot</p>
              <p className="text-xs text-white/80">Upload once, learn actively</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-white/90">
            <FileText className="h-3.5 w-3.5" />
            Documents
            <MessageSquare className="ml-2 h-3.5 w-3.5" />
            Chat
            <BookOpen className="ml-2 h-3.5 w-3.5" />
            Revision
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50 p-3">
          <p className="text-xs text-ink-500">Signed in as</p>
          <p className="truncate text-sm font-medium text-ink-800">{user?.email}</p>
          <button type="button" onClick={logout} className="btn-secondary mt-3 w-full gap-2 py-2 text-xs">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
