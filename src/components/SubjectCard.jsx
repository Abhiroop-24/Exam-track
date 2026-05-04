import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import UnitCard from './UnitCard';

function Chevron({ open }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SubjectCard({
  subject,
  subjectStats,
  units,
  onTopicUpdate,
  onReset,
  creditBorderClass = 'border-white/10',
  shouldAutoOpen,
}) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (shouldAutoOpen && units.length > 0) {
      setIsOpen(true);
    }
  }, [shouldAutoOpen, units.length]);

  const tone = subjectStats.focusTopics > 0 ? 'amber' : subjectStats.completedTopics === subjectStats.totalTopics ? 'emerald' : 'lime';

  return (
    <section className={`min-w-0 overflow-hidden rounded-[32px] border ${creditBorderClass} bg-white/[0.045] shadow-glow backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex min-w-0 flex-col gap-4 border-b border-white/10 px-5 py-4 xl:flex-row xl:items-start xl:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-start justify-between gap-4 text-left"
          aria-expanded={isOpen}
        >
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="break-words font-display text-2xl tracking-tight text-white sm:text-[1.8rem]">
                {subject}
              </h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                {subjectStats.completedTopics}/{subjectStats.totalTopics} complete
              </span>
            </div>
            <p className="max-w-2xl break-words text-sm text-slate-400">
              Track units and topics with revision checkboxes, confidence tags, and local autosave.
            </p>
          </div>

          <span className="mt-1 rounded-full border border-white/10 bg-white/5 p-2 text-slate-300">
            <Chevron open={isOpen} />
          </span>
        </button>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <ProgressBar value={subjectStats.completionRate} tone={tone} className="w-full xl:min-w-56" />
          <button
            type="button"
            onClick={() => onReset(subject)}
            className="rounded-full border border-rose-400/25 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-200 transition hover:border-rose-400/40 hover:bg-rose-500/15"
          >
            Reset subject
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden px-5 py-5">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Completion" value={`${Math.round(subjectStats.completionRate)}%`} hint={`${subjectStats.completedTopics}/${subjectStats.totalTopics} topics`} />
              <Metric label="Today's Focus" value={subjectStats.focusTopics} hint="Unfinished or low confidence" />
              <Metric label="Low Confidence" value={subjectStats.lowConfidenceTopics} hint="Needs attention" />
              <Metric label="Practice Done" value={subjectStats.practiceDoneTopics} hint="Practice checkpoint" />
            </div>

            <div className="space-y-4">
              {units.map(({ unit, topics, unitStats }) => (
                <UnitCard
                  key={`${subject}-${unit}`}
                  subject={subject}
                  unit={unit}
                  topics={topics}
                  unitStats={unitStats}
                  onTopicUpdate={onTopicUpdate}
                  shouldAutoOpen={shouldAutoOpen}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/10 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <div className="mt-2 font-display text-xl tracking-tight text-white">{value}</div>
      <p className="mt-1 text-sm text-slate-400">{hint}</p>
    </div>
  );
}
