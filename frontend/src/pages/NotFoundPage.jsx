import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass-panel w-full max-w-md p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-3 text-sm text-ink-500">
          The page you requested does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
