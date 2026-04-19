const StatCard = ({ title, value, hint, icon: Icon }) => {
  return (
    <div className="glass-panel animate-rise p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
          {hint ? <p className="mt-2 text-xs text-ink-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-700">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatCard;
