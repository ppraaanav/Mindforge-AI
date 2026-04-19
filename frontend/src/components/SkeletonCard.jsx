const SkeletonCard = ({ className = "h-32" }) => {
  return (
    <div className={`glass-panel overflow-hidden ${className}`}>
      <div className="h-full w-full animate-pulse bg-gradient-to-r from-ink-50 via-white to-ink-50" />
    </div>
  );
};

export default SkeletonCard;
