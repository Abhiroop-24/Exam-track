import ProgressBar from './ProgressBar';

export default function Sidebar({
  activeSubject,
  onSelectSubject,
  subjectSummaries,
  overallStats,
  focusCount,
}) {
  return (
    <aside className="min-w-0 w-full xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:w-[320px]">
      <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-glow backdrop-blur-2xl">
        <div className="border-b border-white/10 p-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-lime-100">
            Live tracker
          </div>
          <h2 className="mt-4 font-display text-2xl tracking-tight text-white">Subjects</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Your exam plan stays in localStorage and auto-updates as you track each topic.
          </p>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/10 p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Overall</p>
                <div className="mt-2 font-display text-3xl tracking-tight text-white">
                  {Math.round(overallStats.completionRate)}%
                </div>
              </div>
              <div className="text-right text-xs text-slate-400">
                <div>{overallStats.completedTopics}/{overallStats.totalTopics} topics</div>
                <div>{focusCount} focus items</div>
              </div>
            </div>
            <ProgressBar value={overallStats.completionRate} className="mt-4" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {subjectSummaries.map((summary) => (
              <button
                key={summary.subject}
                type="button"
                onClick={() => onSelectSubject(summary.subject)}
                className={`w-full rounded-[24px] border p-3 text-left transition-all duration-300 ${summary.borderClass} ${
                  activeSubject === summary.subject
                    ? 'bg-lime-400/10 shadow-[0_0_0_1px_rgba(201,255,90,0.15)]'
                    : 'bg-white/5 hover:-translate-y-0.5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="break-words font-display text-lg tracking-tight text-white">{summary.subject}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {summary.subjectStats.completedTopics}/{summary.subjectStats.totalTopics} complete ·{' '}
                      {summary.subjectStats.focusTopics} focus
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {Math.round(summary.completionRate)}%
                  </span>
                </div>

                <ProgressBar value={summary.completionRate} tone={summary.subjectStats.focusTopics > 0 ? 'amber' : 'emerald'} className="mt-3" />

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                  <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                    {summary.subjectStats.lowConfidenceTopics} low
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/15 px-2.5 py-1">
                    {summary.subjectStats.practiceDoneTopics} practice
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
