const confidenceToneMap = {
  Low: {
    wrapper: 'border-rose-500/30 bg-rose-500/[0.08] hover:border-rose-400/60',
    accent: 'bg-rose-400',
    chip: 'border-rose-400/30 bg-rose-500/15 text-rose-200',
    label: 'Low confidence',
  },
  Medium: {
    wrapper: 'border-amber-500/30 bg-amber-500/[0.08] hover:border-amber-400/60',
    accent: 'bg-amber-400',
    chip: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
    label: 'Medium confidence',
  },
  High: {
    wrapper: 'border-cyan-500/30 bg-cyan-500/[0.08] hover:border-cyan-400/60',
    accent: 'bg-cyan-400',
    chip: 'border-cyan-400/30 bg-cyan-500/15 text-cyan-100',
    label: 'High confidence',
  },
};

function PillCheckbox({ label, checked, onChange, accentClass }) {
  return (
    <label
      className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/10 ${accentClass}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-white/20 bg-slate-900 text-lime-400 accent-lime-400"
      />
      <span>{label}</span>
    </label>
  );
}

export default function TopicRow({ subject, unit, topic, state, onUpdate }) {
  const tone = state.completed ? 'completed' : confidenceToneMap[state.confidence] ?? confidenceToneMap.Medium;

  return (
    <article
      className={`group min-w-0 rounded-3xl border p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow ${
        state.completed ? 'border-emerald-500/35 bg-emerald-500/[0.10]' : tone.wrapper
      }`}
    >
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${state.completed ? 'bg-emerald-400' : tone.accent}`} />
            <h4 className="break-words font-display text-base tracking-tight text-white">{topic}</h4>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                state.completed ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : tone.chip
              }`}
            >
              {state.completed ? 'Completed' : tone.label}
            </span>
          </div>
          <p className="break-words text-sm text-slate-400">
            {subject} / {unit}
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300">
          {state.completed ? 'Tracked' : 'In progress'}
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <PillCheckbox
          label="Completed"
          checked={state.completed}
          onChange={() => onUpdate({ completed: !state.completed })}
          accentClass={state.completed ? 'border-emerald-400/25 bg-emerald-500/10' : ''}
        />
        <PillCheckbox
          label="Revision 1"
          checked={state.revision1}
          onChange={() => onUpdate({ revision1: !state.revision1 })}
          accentClass={state.revision1 ? 'border-lime-400/25 bg-lime-500/10' : ''}
        />
        <PillCheckbox
          label="Revision 2"
          checked={state.revision2}
          onChange={() => onUpdate({ revision2: !state.revision2 })}
          accentClass={state.revision2 ? 'border-sky-400/25 bg-sky-500/10' : ''}
        />
        <PillCheckbox
          label="Practice Done"
          checked={state.practiceDone}
          onChange={() => onUpdate({ practiceDone: !state.practiceDone })}
          accentClass={state.practiceDone ? 'border-violet-400/25 bg-violet-500/10' : ''}
        />

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 xl:col-span-1">
          <span>Confidence</span>
          <select
            value={state.confidence}
            onChange={(event) => onUpdate({ confidence: event.target.value })}
            className="w-full min-w-0 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-100 outline-none transition focus:border-lime-400/60"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
      </div>
    </article>
  );
}
