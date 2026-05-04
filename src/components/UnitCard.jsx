import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';
import TopicRow from './TopicRow';

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

export default function UnitCard({
  subject,
  unit,
  topics,
  unitStats,
  onTopicUpdate,
  shouldAutoOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (shouldAutoOpen && topics.length > 0) {
      setIsOpen(true);
    }
  }, [shouldAutoOpen, topics.length]);

  const tone = unitStats.focusTopics > 0 ? 'amber' : unitStats.completedTopics === unitStats.totalTopics ? 'emerald' : 'sky';

  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Unit</p>
          <h4 className="mt-1 break-words font-display text-xl tracking-tight text-white">{unit}</h4>
          <p className="mt-1 text-sm text-slate-400">
            {unitStats.completedTopics}/{unitStats.totalTopics} complete · {unitStats.focusTopics} focus items
          </p>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <ProgressBar value={unitStats.completionRate} tone={tone} className="hidden w-full sm:block sm:max-w-36" />
          <Chevron open={isOpen} />
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden px-4 pb-4">
          <div className="space-y-3">
            <ProgressBar value={unitStats.completionRate} tone={tone} />

            <div className="grid gap-3">
              {topics.map(({ topic, state }) => (
                <TopicRow
                  key={`${subject}-${unit}-${topic}`}
                  subject={subject}
                  unit={unit}
                  topic={topic}
                  state={state}
                  onUpdate={(patch) => onTopicUpdate(subject, unit, topic, patch)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
