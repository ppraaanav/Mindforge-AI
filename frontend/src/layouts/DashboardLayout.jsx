import { Outlet, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Sidebar from "../components/Sidebar";

const routeMeta = {
  "/": {
    title: "Learning Dashboard",
    subtitle: "Manage documents and jump into AI-powered revision tools."
  },
  "/analytics": {
    title: "Learning Analytics",
    subtitle: "Track momentum, quiz performance, and study consistency."
  }
};

const DashboardLayout = () => {
  const location = useLocation();

  const active =
    routeMeta[location.pathname] ||
    (location.pathname.startsWith("/chat/")
      ? {
          title: "Document Chat",
          subtitle: "Ask grounded questions and get context-aware answers."
        }
      : location.pathname.startsWith("/flashcards/")
        ? {
            title: "AI Flashcards",
            subtitle: "Flip through generated prompts for rapid revision."
          }
        : location.pathname.startsWith("/quiz/")
          ? {
              title: "Quiz Lab",
              subtitle: "Generate assessments and get instant scoring feedback."
            }
          : {
              title: "MindForge AI",
              subtitle: "Interactive learning workspace"
            });

  return (
    <div className="min-h-screen md:flex">
      <Sidebar />

      <div className="min-h-screen flex-1 md:ml-0">
        <header className="sticky top-0 z-20 border-b border-ink-100/90 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
            <div className="pl-12 md:pl-0">
              <h2 className="text-lg font-semibold text-ink-900 md:text-2xl">{active.title}</h2>
              <p className="text-xs text-ink-500 md:text-sm">{active.subtitle}</p>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs text-brand-700 md:flex">
              <Sparkles className="h-4 w-4" />
              AI Powered Learning
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
