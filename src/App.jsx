import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import SubjectCard from './components/SubjectCard';
import { syllabus } from './data/syllabus';
import {
  collectFocusTopics,
  collectOverallStats,
  collectSubjectSummaries,
  collectVisibleSubjects,
  loadProgress,
  resetSubject,
  saveProgress,
  updateTopic,
  STORAGE_KEY,
} from './lib/tracker';

const subjectMetadata = {
  'Linear Algebra': { credits: 4, borderClass: 'border-orange-400/40' },
  Microprocessor: { credits: 5, borderClass: 'border-rose-500/45' },
  DAA: { credits: 4, borderClass: 'border-orange-400/40' },
  'Computer Networks': { credits: 5, borderClass: 'border-rose-500/45' },
  'Operating Systems': { credits: 4, borderClass: 'border-orange-400/40' },
  EIE: { credits: 2, borderClass: 'border-cyan-400/35' },
};

const examTimetable = [
  {
    date: '07 May 2026 (Thursday)',
    subject: 'Linear Algebra and Its Applications',
    code: 'UE24MA241B',
    time: '8:30 AM - 11:30 AM',
  },
  {
    date: '11 May 2026 (Monday)',
    subject: 'Microprocessor and Computer Architecture',
    code: 'UE24CS251B',
    time: '8:30 AM - 11:30 AM',
  },
  {
    date: '14 May 2026 (Thursday)',
    subject: 'Design and Analysis of Algorithms',
    code: 'UE24CS241B',
    time: '8:30 AM - 11:30 AM',
  },
  {
    date: '18 May 2026 (Monday)',
    subject: 'Computer Networks',
    code: 'UE24CS252B',
    time: '8:30 AM - 11:30 AM',
  },
  {
    date: '21 May 2026 (Thursday)',
    subject: 'Operating Systems',
    code: 'UE24CS242B',
    time: '8:30 AM - 11:30 AM',
  },
  {
    date: '23 May 2026 (Saturday)',
    subject: 'Essentials of Innovation & Entrepreneurship - II',
    code: 'UZ24UZZ21B',
    time: '9:30 AM - 11:00 AM',
    note: 'Different timing',
  },
];

function getSubjectMetadata(subject) {
  return subjectMetadata[subject] ?? { credits: 4, borderClass: 'border-orange-400/40' };
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-slate-400">
      <path
        d="M8.5 14.5C11.8137 14.5 14.5 11.8137 14.5 8.5C14.5 5.18629 11.8137 2.5 8.5 2.5C5.18629 2.5 2.5 5.18629 2.5 8.5C2.5 11.8137 5.18629 14.5 8.5 14.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M13 13L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-lime-200">
      <path
        d="M10 2.5L11.9 7.1L16.5 9L11.9 10.9L10 15.5L8.1 10.9L3.5 9L8.1 7.1L10 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ToggleButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        active
          ? 'border-lime-400/30 bg-lime-400/10 text-lime-100 shadow-[0_0_0_1px_rgba(201,255,90,0.18)]'
          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, detail, tone = 'lime' }) {
  const toneMap = {
    lime: 'from-lime-400/25 to-transparent',
    amber: 'from-amber-400/25 to-transparent',
    rose: 'from-rose-400/25 to-transparent',
    sky: 'from-sky-400/25 to-transparent',
    emerald: 'from-emerald-400/25 to-transparent',
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneMap[tone]}`} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <div className="mt-3 font-display text-3xl tracking-tight text-white">{value}</div>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function FocusItem({ item }) {
  const reason = item.state.confidence === 'Low' ? 'Low confidence' : !item.state.completed ? 'Incomplete' : 'Review';

  return (
    <article className="rounded-3xl border border-white/10 bg-black/15 p-4 transition-all duration-300 hover:border-white/20 hover:bg-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {item.subject} / {item.unit}
          </p>
          <h4 className="mt-2 font-display text-lg tracking-tight text-white">{item.topic}</h4>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
            item.state.confidence === 'Low'
              ? 'border-rose-400/25 bg-rose-500/15 text-rose-100'
              : 'border-amber-400/25 bg-amber-500/15 text-amber-100'
          }`}
        >
          {reason}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
        <span
          className={`rounded-full border px-2 py-1 ${
            item.state.completed
              ? 'border-emerald-400/25 bg-emerald-500/15 text-emerald-100'
              : 'border-white/10 bg-white/5'
          }`}
        >
          {item.state.completed ? 'Completed' : 'Pending'}
        </span>
        <span
          className={`rounded-full border px-2 py-1 ${
            item.state.revision1
              ? 'border-lime-400/25 bg-lime-500/15 text-lime-100'
              : 'border-white/10 bg-white/5'
          }`}
        >
          Rev 1
        </span>
        <span
          className={`rounded-full border px-2 py-1 ${
            item.state.practiceDone
              ? 'border-violet-400/25 bg-violet-500/15 text-violet-100'
              : 'border-white/10 bg-white/5'
          }`}
        >
          Practice
        </span>
      </div>
    </article>
  );
}

export default function App() {
  const [progress, setProgress] = useState(() => loadProgress(syllabus));
  const [searchQuery, setSearchQuery] = useState('');
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        setProgress(loadProgress(syllabus));
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const overallStats = collectOverallStats(syllabus, progress);
  const subjectSummaries = collectSubjectSummaries(syllabus, progress).map((summary) => ({
    ...summary,
    ...getSubjectMetadata(summary.subject),
  }));
  const subjectSummaryMap = Object.fromEntries(subjectSummaries.map((summary) => [summary.subject, summary]));
  const focusTopics = collectFocusTopics(syllabus, progress, searchQuery);
  const visibleSubjects = collectVisibleSubjects(syllabus, progress, {
    searchQuery,
    activeSubject,
    showIncompleteOnly,
  });

  const clearFilters = () => {
    setSearchQuery('');
    setShowIncompleteOnly(false);
    setActiveSubject(null);
  };

  const updateTopicState = (subject, unit, topic, patch) => {
    setProgress((current) => updateTopic(current, subject, unit, topic, patch));
  };

  const handleResetSubject = (subject) => {
    const confirmed = window.confirm(`Reset all progress for ${subject}?`);

    if (!confirmed) {
      return;
    }

    setProgress((current) => resetSubject(current, syllabus, subject));
  };

  const selectedSubjectLabel = activeSubject ?? 'Select a subject';
  const hasFilters = Boolean(searchQuery.trim()) || showIncompleteOnly || Boolean(activeSubject);
  const visibleSubjectCount = visibleSubjects.length;
  const showEmptyState = !activeSubject && !searchQuery.trim() && !showIncompleteOnly;

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="absolute right-0 top-12 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-rose-400/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1680px] flex-col gap-5 px-4 py-4 md:px-6 lg:px-8 xl:flex-row">
        <Sidebar
          activeSubject={activeSubject}
          onSelectSubject={setActiveSubject}
          subjectSummaries={subjectSummaries}
          overallStats={overallStats}
          focusCount={focusTopics.length}
        />

        <main className="min-w-0 flex-1 space-y-5 pb-8">
          <section className="grid min-w-0 gap-5 xl:grid-cols-[1.25fr_0.95fr]">
            <div className="relative min-w-0 overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-2xl md:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,255,90,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(110,231,255,0.08),transparent_30%)]" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  <SparkIcon />
                  Exam Preparation Tracker
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-3xl font-display text-3xl tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Stay on top of every subject, unit, and topic without losing the big picture.
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                    Clean dark dashboard, smart focus queue, and granular progress tracking for revisions, practice,
                    and confidence. Everything persists automatically in localStorage.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-lime-100">
                    {overallStats.subjectCount} subjects
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                    {overallStats.unitCount} units
                  </span>
                  <span className="rounded-full border border-rose-400/25 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-100">
                    {overallStats.lowConfidenceTopics} low confidence
                  </span>
                  <span className="rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
                    {focusTopics.length} focus topics
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Overall progress"
                    value={`${Math.round(overallStats.completionRate)}%`}
                    detail={`${overallStats.completedTopics}/${overallStats.totalTopics} topics complete`}
                    tone="lime"
                  />
                  <StatCard
                    label="Revision 1"
                    value={overallStats.revision1Topics}
                    detail="First revision checkpoints done"
                    tone="sky"
                  />
                  <StatCard
                    label="Revision 2"
                    value={overallStats.revision2Topics}
                    detail="Second revision checkpoints done"
                    tone="amber"
                  />
                  <StatCard
                    label="Practice done"
                    value={overallStats.practiceDoneTopics}
                    detail="Practice sessions completed"
                    tone="emerald"
                  />
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-[36px] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-2xl md:p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Performance</p>
                      <h2 className="mt-2 font-display text-2xl tracking-tight text-white sm:text-3xl">Overall progress</h2>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                      Saved locally
                    </div>
                  </div>

                  <div className="mx-auto flex max-w-[230px] items-center justify-center">
                    <div
                      className="relative flex aspect-square w-full items-center justify-center rounded-full p-4"
                      style={{
                        background: `conic-gradient(#c9ff5a ${overallStats.completionRate}%, rgba(255,255,255,0.08) 0)`,
                      }}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/95 text-center">
                        <span className="font-display text-5xl tracking-tight text-white">
                          {Math.round(overallStats.completionRate)}%
                        </span>
                        <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                          completion
                        </span>
                      </div>
                    </div>
                  </div>

                  <ProgressBar value={overallStats.completionRate} />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <StatCard
                    label="Today's focus"
                    value={focusTopics.length}
                    detail="Auto-prioritized topics"
                    tone="rose"
                  />
                  <StatCard
                    label="Low confidence"
                    value={overallStats.lowConfidenceTopics}
                    detail="Flagged for extra revision"
                    tone="rose"
                  />
                  <StatCard
                    label="Subjects tracked"
                    value={overallStats.subjectCount}
                    detail="All subjects loaded"
                    tone="sky"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] border border-white/10 bg-white/[0.045] p-5 shadow-glow backdrop-blur-2xl md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Controls</p>
                <h2 className="mt-2 font-display text-2xl tracking-tight text-white sm:text-3xl">Search, filter, and focus</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Search by subject, unit, or topic. Narrow to incomplete work, or jump to a single subject from the
                  sidebar.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Clear filters
                  </button>
                )}
                <ToggleButton
                  active={showIncompleteOnly}
                  label="Show incomplete only"
                  onClick={() => setShowIncompleteOnly((current) => !current)}
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <label className="flex items-center gap-3 rounded-[24px] border border-white/10 bg-black/15 px-4 py-3 transition focus-within:border-lime-400/40">
                <SearchIcon />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search subjects, units, or topics"
                  className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </label>

              <div className="rounded-[24px] border border-white/10 bg-black/15 px-4 py-3 text-sm text-slate-400">
                Viewing <span className="font-semibold text-white">{selectedSubjectLabel}</span>
                {searchQuery.trim() ? (
                  <span>
                    {' '}
                    · search “{searchQuery.trim()}”
                  </span>
                ) : null}
                {showIncompleteOnly ? <span> · incomplete only</span> : null}
              </div>
            </div>

            <div className="mt-4 rounded-[28px] border border-white/10 bg-black/15 p-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Exam timetable</p>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">May 2026</p>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {examTimetable.map((exam) => (
                    <article key={exam.code} className="rounded-[20px] border border-white/10 bg-black/20 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{exam.date}</p>
                      <h4 className="mt-2 break-words text-sm font-semibold text-white">{exam.subject}</h4>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{exam.code}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium">{exam.time}</span>
                        {exam.note ? (
                          <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-amber-100">
                            {exam.note}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-5">
            {visibleSubjectCount > 0 ? (
              visibleSubjects.map((subjectEntry) => {
                const subjectSummary = subjectSummaryMap[subjectEntry.subject];

                return (
                  <SubjectCard
                    key={subjectEntry.subject}
                    subject={subjectEntry.subject}
                    subjectStats={subjectSummary.subjectStats}
                    units={subjectEntry.units}
                    onTopicUpdate={updateTopicState}
                    onReset={handleResetSubject}
                    creditBorderClass={getSubjectMetadata(subjectEntry.subject).borderClass}
                    shouldAutoOpen={Boolean(searchQuery.trim() || showIncompleteOnly)}
                  />
                );
              })
            ) : showEmptyState ? (
              <div className="rounded-[32px] border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
                <h3 className="font-display text-3xl tracking-tight text-white">Pick a subject to begin</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  Tap a subject from the sidebar to open its units and topics. Progress and focus stats stay visible
                  at the top.
                </p>
              </div>
            ) : (
              <div className="rounded-[32px] border border-dashed border-white/15 bg-white/[0.04] p-10 text-center">
                <h3 className="font-display text-3xl tracking-tight text-white">No topics match these filters</h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
                  Clear the search or turn off the incomplete-only filter to bring topics back into view.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full border border-lime-400/25 bg-lime-400/10 px-5 py-3 text-sm font-semibold text-lime-100 transition hover:border-lime-400/40 hover:bg-lime-400/15"
                >
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
