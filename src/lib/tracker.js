export const STORAGE_KEY = 'exam-preparation-tracker:v1';

export const confidenceLevels = ['Low', 'Medium', 'High'];

const defaultTopicState = {
  completed: false,
  revision1: false,
  revision2: false,
  practiceDone: false,
  confidence: 'Medium',
};

function createTopicState(storedTopic = {}) {
  return {
    completed: Boolean(storedTopic.completed),
    revision1: Boolean(storedTopic.revision1),
    revision2: Boolean(storedTopic.revision2),
    practiceDone: Boolean(storedTopic.practiceDone),
    confidence: confidenceLevels.includes(storedTopic.confidence)
      ? storedTopic.confidence
      : defaultTopicState.confidence,
  };
}

function createEmptyStats() {
  return {
    totalTopics: 0,
    completedTopics: 0,
    revision1Topics: 0,
    revision2Topics: 0,
    practiceDoneTopics: 0,
    lowConfidenceTopics: 0,
    mediumConfidenceTopics: 0,
    highConfidenceTopics: 0,
    focusTopics: 0,
  };
}

function accumulateTopic(stats, topicState) {
  stats.totalTopics += 1;

  if (topicState.completed) {
    stats.completedTopics += 1;
  }

  if (topicState.revision1) {
    stats.revision1Topics += 1;
  }

  if (topicState.revision2) {
    stats.revision2Topics += 1;
  }

  if (topicState.practiceDone) {
    stats.practiceDoneTopics += 1;
  }

  if (topicState.confidence === 'Low') {
    stats.lowConfidenceTopics += 1;
  } else if (topicState.confidence === 'Medium') {
    stats.mediumConfidenceTopics += 1;
  } else {
    stats.highConfidenceTopics += 1;
  }

  if (!topicState.completed || topicState.confidence === 'Low') {
    stats.focusTopics += 1;
  }
}

function summarizeTopicStates(topicStates) {
  const stats = createEmptyStats();

  topicStates.forEach((topicState) => {
    accumulateTopic(stats, topicState);
  });

  stats.completionRate = stats.totalTopics ? (stats.completedTopics / stats.totalTopics) * 100 : 0;

  return stats;
}

export function createProgressFromSyllabus(syllabus) {
  return Object.fromEntries(
    Object.entries(syllabus).map(([subject, units]) => [
      subject,
      Object.fromEntries(
        Object.entries(units).map(([unit, topics]) => [
          unit,
          Object.fromEntries(topics.map((topic) => [topic, createTopicState()])),
        ]),
      ),
    ]),
  );
}

export function normalizeProgress(syllabus, storedProgress) {
  return Object.fromEntries(
    Object.entries(syllabus).map(([subject, units]) => [
      subject,
      Object.fromEntries(
        Object.entries(units).map(([unit, topics]) => [
          unit,
          Object.fromEntries(
            topics.map((topic) => [
              topic,
              createTopicState(storedProgress?.[subject]?.[unit]?.[topic]),
            ]),
          ),
        ]),
      ),
    ]),
  );
}

export function loadProgress(syllabus) {
  if (typeof window === 'undefined') {
    return createProgressFromSyllabus(syllabus);
  }

  const rawProgress = window.localStorage.getItem(STORAGE_KEY);

  if (!rawProgress) {
    return createProgressFromSyllabus(syllabus);
  }

  try {
    return normalizeProgress(syllabus, JSON.parse(rawProgress));
  } catch {
    return createProgressFromSyllabus(syllabus);
  }
}

export function saveProgress(progress) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateTopic(progress, subject, unit, topic, patch) {
  return {
    ...progress,
    [subject]: {
      ...progress[subject],
      [unit]: {
        ...progress[subject][unit],
        [topic]: {
          ...progress[subject][unit][topic],
          ...patch,
        },
      },
    },
  };
}

export function resetSubject(progress, syllabus, subject) {
  return {
    ...progress,
    [subject]: normalizeProgress({ [subject]: syllabus[subject] }, {})[subject],
  };
}

export function collectOverallStats(syllabus, progress) {
  const stats = createEmptyStats();
  stats.subjectCount = Object.keys(syllabus).length;
  stats.unitCount = 0;

  Object.entries(syllabus).forEach(([subject, units]) => {
    Object.entries(units).forEach(([unit, topics]) => {
      stats.unitCount += 1;

      topics.forEach((topic) => {
        accumulateTopic(stats, progress[subject][unit][topic]);
      });
    });
  });

  stats.completionRate = stats.totalTopics ? (stats.completedTopics / stats.totalTopics) * 100 : 0;

  return stats;
}

export function collectSubjectSummaries(syllabus, progress) {
  return Object.entries(syllabus).map(([subject, units]) => {
    const subjectStats = createEmptyStats();
    const unitSummaries = Object.entries(units).map(([unit, topics]) => {
      const topicStates = topics.map((topic) => progress[subject][unit][topic]);
      const unitStats = summarizeTopicStates(topicStates);

      topicStates.forEach((topicState) => {
        accumulateTopic(subjectStats, topicState);
      });

      return {
        unit,
        topics,
        unitStats,
      };
    });

    subjectStats.completionRate = subjectStats.totalTopics
      ? (subjectStats.completedTopics / subjectStats.totalTopics) * 100
      : 0;

    return {
      subject,
      units: unitSummaries,
      subjectStats,
      completionRate: subjectStats.completionRate,
    };
  });
}

export function collectVisibleSubjects(syllabus, progress, options = {}) {
  const searchQuery = (options.searchQuery ?? '').trim().toLowerCase();
  const activeSubject = options.activeSubject && options.activeSubject !== 'All Subjects' ? options.activeSubject : null;
  const showIncompleteOnly = Boolean(options.showIncompleteOnly);

  if (!activeSubject && !searchQuery && !showIncompleteOnly) {
    return [];
  }

  return Object.entries(syllabus)
    .filter(([subject]) => !activeSubject || subject === activeSubject)
    .map(([subject, units]) => {
      const unitEntries = Object.entries(units)
        .map(([unit, topics]) => {
          const visibleTopics = topics.filter((topic) => {
            const topicState = progress[subject][unit][topic];
            const matchesSearch =
              !searchQuery ||
              subject.toLowerCase().includes(searchQuery) ||
              unit.toLowerCase().includes(searchQuery) ||
              topic.toLowerCase().includes(searchQuery);
            const matchesFilter = !showIncompleteOnly || !topicState.completed;

            return matchesSearch && matchesFilter;
          });

          if (visibleTopics.length === 0) {
            return null;
          }

          const unitStats = summarizeTopicStates(topics.map((topic) => progress[subject][unit][topic]));

          return {
            unit,
            topics: visibleTopics.map((topic) => ({
              topic,
              state: progress[subject][unit][topic],
            })),
            unitStats,
          };
        })
        .filter(Boolean);

      if (unitEntries.length === 0) {
        return null;
      }

      return {
        subject,
        units: unitEntries,
      };
    })
    .filter(Boolean);
}

export function collectFocusTopics(syllabus, progress, searchQuery = '') {
  const query = searchQuery.trim().toLowerCase();
  const items = [];

  Object.entries(syllabus).forEach(([subject, units], subjectIndex) => {
    Object.entries(units).forEach(([unit, topics], unitIndex) => {
      topics.forEach((topic, topicIndex) => {
        const topicState = progress[subject][unit][topic];
        const matchesSearch =
          !query || subject.toLowerCase().includes(query) || unit.toLowerCase().includes(query) || topic.toLowerCase().includes(query);

        if (!matchesSearch) {
          return;
        }

        if (topicState.completed && topicState.confidence !== 'Low') {
          return;
        }

        items.push({
          subject,
          unit,
          topic,
          state: topicState,
          subjectIndex,
          unitIndex,
          topicIndex,
        });
      });
    });
  });

  return items.sort((left, right) => {
    const leftPriority = left.state.confidence === 'Low' ? 0 : 1;
    const rightPriority = right.state.confidence === 'Low' ? 0 : 1;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    if (left.subjectIndex !== right.subjectIndex) {
      return left.subjectIndex - right.subjectIndex;
    }

    if (left.unitIndex !== right.unitIndex) {
      return left.unitIndex - right.unitIndex;
    }

    return left.topicIndex - right.topicIndex;
  });
}
