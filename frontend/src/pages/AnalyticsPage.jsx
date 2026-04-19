import { useEffect, useState } from "react";
import { Activity, FileText, MessageCircle, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchAnalyticsOverview } from "../services/analyticsService";

const toLabel = (value) =>
  new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric"
  });

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchAnalyticsOverview();
      setAnalytics(data);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="glass-panel p-6">
        <LoadingSpinner label="Loading analytics..." />
      </div>
    );
  }

  if (!analytics) {
    return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
  }

  const metrics = analytics.metrics || {
    documentsCount: 0,
    quizAttemptsCount: 0,
    avgQuizScore: 0,
    chatMessagesCount: 0
  };

  const quizPerformance = (analytics.quizPerformance || []).map((item) => ({
    ...item,
    label: toLabel(item.date)
  }));

  const learningActivity = (analytics.learningActivity || []).map((item) => ({
    ...item,
    label: toLabel(item.date)
  }));

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Documents" value={metrics.documentsCount} hint="Uploaded study sources" icon={FileText} />
        <StatCard title="Quiz Attempts" value={metrics.quizAttemptsCount} hint="Evaluated assessments" icon={Trophy} />
        <StatCard title="Avg Quiz Score" value={`${metrics.avgQuizScore}%`} hint="Across recent attempts" icon={Activity} />
        <StatCard title="Chat Messages" value={metrics.chatMessagesCount} hint="Questions asked" icon={MessageCircle} />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-ink-900">Quiz Performance Trend</h3>
          <p className="mb-3 text-sm text-ink-500">Score progression across recent quiz attempts.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quizPerformance}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2edf1" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score %"
                  stroke="#1ea781"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#118567" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-ink-900">Weekly Learning Activity</h3>
          <p className="mb-3 text-sm text-ink-500">Documents, chat sessions, and quizzes over the last 7 days.</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={learningActivity}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2edf1" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="documents" fill="#1ea781" radius={[5, 5, 0, 0]} />
                <Bar dataKey="chats" fill="#f59f0b" radius={[5, 5, 0, 0]} />
                <Bar dataKey="quizzes" fill="#4c7d95" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
