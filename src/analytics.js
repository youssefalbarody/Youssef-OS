export function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function getDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function buildTaskAnalytics(tasks) {
  const today = getToday();
  const completionCounts = new Map();
  const priorities = { high: 0, medium: 0, low: 0 };
  let pending = 0;
  let completed = 0;
  let overdue = 0;
  let dueToday = 0;

  tasks.forEach((task) => {
    const priority = task.priority || "medium";
    priorities[priority] = (priorities[priority] || 0) + 1;
    if (task.status === "done") completed += 1;
    else pending += 1;
    if (task.due_date === today) dueToday += 1;
    if (task.due_date && task.status !== "done" && task.due_date < today) overdue += 1;
    if (task.completed_at) {
      const date = new Date(task.completed_at);
      const key = getDateKey(date);
      const activity = completionCounts.get(key) || {
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: 0,
      };
      activity.count += 1;
      completionCounts.set(key, activity);
    }
  });

  return {
    total: tasks.length, pending, completed, overdue, dueToday, priorities,
    completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    completionActivities: [...completionCounts.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-7).map(([, value]) => value),
  };
}

export function buildProjectSummaries(projects, tasks) {
  const taskGroups = new Map(projects.map((project) => [project.id, []]));
  tasks.forEach((task) => taskGroups.get(task.project_id)?.push(task));
  return new Map(projects.map((project) => {
    const projectTasks = taskGroups.get(project.id) || [];
    const completed = projectTasks.filter((task) => task.status === "done").length;
    return [project.id, {
      total: projectTasks.length,
      completed,
      pending: projectTasks.length - completed,
      completionRate: projectTasks.length ? Math.round((completed / projectTasks.length) * 100) : 0,
    }];
  }));
}

export function buildTimeline(tasks) {
  const today = getToday();
  const nextWeek = new Date(`${today}T00:00:00`);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekKey = getDateKey(nextWeek);
  const dated = tasks.filter((task) => task.due_date && task.status !== "done");
  return {
    overdue: dated.filter((task) => task.due_date < today),
    today: dated.filter((task) => task.due_date === today),
    upcoming: dated.filter((task) => task.due_date > today && task.due_date <= nextWeekKey).sort((a, b) => a.due_date.localeCompare(b.due_date)),
    future: dated.filter((task) => task.due_date > nextWeekKey).sort((a, b) => a.due_date.localeCompare(b.due_date)),
  };
}
