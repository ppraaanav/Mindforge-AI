import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { BrainCircuit, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/");
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute -left-40 top-10 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />

      <div className="glass-panel z-10 w-full max-w-md animate-rise p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to continue your learning flow.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="********"
              value={form.password}
              onChange={onChange}
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2">
            <LogIn className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          New to MindForge?{" "}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
