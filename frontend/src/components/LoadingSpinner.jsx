const LoadingSpinner = ({ label = "Loading...", size = "md" }) => {
  const sizeClass = size === "sm" ? "h-4 w-4 border-2" : "h-8 w-8 border-[3px]";

  return (
    <div className="flex items-center gap-2 text-ink-500">
      <span
        className={`${sizeClass} inline-block animate-spin rounded-full border-brand-500 border-r-transparent`}
      />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
