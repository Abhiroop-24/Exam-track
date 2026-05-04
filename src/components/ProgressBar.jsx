export default function ProgressBar({ value = 0, label, caption, tone = 'lime', className = '' }) {
  const percentage = Math.max(0, Math.min(100, value));

  const toneClasses = {
    lime: 'from-lime-400 via-emerald-400 to-cyan-400',
    emerald: 'from-emerald-400 via-lime-400 to-teal-400',
    amber: 'from-amber-300 via-yellow-400 to-orange-400',
    rose: 'from-rose-400 via-pink-400 to-orange-400',
    sky: 'from-sky-400 via-cyan-400 to-lime-300',
  };

  return (
    <div className={className}>
      {(label || caption) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-slate-300">
          <span>{label}</span>
          <span className="text-slate-400">{caption ?? `${Math.round(percentage)}%`}</span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${toneClasses[tone]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
