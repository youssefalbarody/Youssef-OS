const overviewContent = document.querySelector("#overview-content");
const taskAnalyticsContent = document.querySelector("#task-analytics-content");
const newProjectButton = document.querySelector("#quick-new-project-button");
const newTaskButton = document.querySelector("#quick-new-task-button");

function createState(message, state) {
  const stateElement = document.createElement("p");

  stateElement.className = "overview-state";
  stateElement.dataset.state = state;
  stateElement.textContent = message;

  return stateElement;
}

function createMetric(label, value, tone) {
  const metric = document.createElement("article");
  const valueElement = document.createElement("strong");
  const labelElement = document.createElement("span");

  metric.className = "overview-card";
  metric.dataset.tone = tone;
  valueElement.textContent = value;
  labelElement.textContent = label;
  metric.append(valueElement, labelElement);

  return metric;
}

function replaceOverviewContent(content) {
  overviewContent?.replaceChildren(content);
}

function replaceTaskAnalyticsContent(content) {
  taskAnalyticsContent?.replaceChildren(content);
}

export function renderOverviewLoading() {
  replaceOverviewContent(createState("Loading your overview...", "loading"));
}

export function renderOverview(summary) {
  const metrics = document.createElement("div");

  metrics.className = "overview-metrics";
  metrics.append(
    createMetric("Active Projects", summary.activeProjects, "accent"),
    createMetric("Pending Tasks", summary.pendingTasks, "warning"),
    createMetric("Completed Tasks", summary.completedTasks, "success"),
    createMetric("Total Tasks", summary.totalTasks, "neutral"),
  );
  replaceOverviewContent(metrics);
}

export function renderOverviewError() {
  replaceOverviewContent(
    createState("Your overview could not be loaded. Please check the connection.", "error"),
  );
}

function createAnalyticsMetric(label, value, tone = "neutral") {
  const metric = document.createElement("article");
  const valueElement = document.createElement("strong");
  const labelElement = document.createElement("span");

  metric.className = "task-analytics__metric";
  metric.dataset.tone = tone;
  valueElement.textContent = value;
  labelElement.textContent = label;
  metric.append(valueElement, labelElement);
  return metric;
}

function createDistributionItem(label, value, tone) {
  const item = document.createElement("div");
  const labelElement = document.createElement("span");
  const valueElement = document.createElement("strong");

  item.className = "priority-distribution__item";
  item.dataset.priority = tone;
  labelElement.textContent = label;
  valueElement.textContent = value;
  item.append(labelElement, valueElement);
  return item;
}

function createTrend(activities) {
  if (activities.length === 0) {
    return createState("No completion history is available yet.", "empty");
  }

  const trend = document.createElement("div");

  trend.className = "completion-trend";
  activities.forEach((activity) => {
    const item = document.createElement("div");
    const bar = document.createElement("span");
    const count = document.createElement("strong");
    const label = document.createElement("small");

    item.className = "completion-trend__item";
    bar.className = "completion-trend__bar";
    bar.style.setProperty("--completion-count", activity.count);
    count.textContent = activity.count;
    label.textContent = activity.label;
    item.append(bar, count, label);
    trend.append(item);
  });
  return trend;
}

export function renderTaskAnalyticsLoading() {
  replaceTaskAnalyticsContent(createState("Loading task analytics...", "loading"));
}

export function renderTaskAnalytics(analytics) {
  const content = document.createElement("div");
  const metrics = document.createElement("div");
  const distributionSection = document.createElement("section");
  const distributionTitle = document.createElement("h3");
  const distribution = document.createElement("div");
  const trendSection = document.createElement("section");
  const trendTitle = document.createElement("h3");

  content.className = "task-analytics";
  metrics.className = "task-analytics__metrics";
  metrics.append(
    createAnalyticsMetric("Total Tasks", analytics.total, "accent"),
    createAnalyticsMetric("Pending Tasks", analytics.pending, "warning"),
    createAnalyticsMetric("Completed Tasks", analytics.completed, "success"),
    createAnalyticsMetric("Overdue Tasks", analytics.overdue, "danger"),
    createAnalyticsMetric("Due Today", analytics.dueToday, "neutral"),
    createAnalyticsMetric("Completion Rate", `${analytics.completionRate}%`, "accent"),
  );

  distributionSection.className = "task-analytics__section";
  distributionTitle.textContent = "Priority distribution";
  distribution.className = "priority-distribution";
  if (analytics.total === 0) {
    distribution.append(createState("No priority data is available yet.", "empty"));
  } else {
    distribution.append(
      createDistributionItem("High", analytics.priorities.high, "high"),
      createDistributionItem("Medium", analytics.priorities.medium, "medium"),
      createDistributionItem("Low", analytics.priorities.low, "low"),
    );
  }
  distributionSection.append(distributionTitle, distribution);

  trendSection.className = "task-analytics__section";
  trendTitle.textContent = "Completion activity";
  trendSection.append(trendTitle, createTrend(analytics.completionActivities));
  content.append(metrics, distributionSection, trendSection);
  replaceTaskAnalyticsContent(content);
}

export function renderTaskAnalyticsError() {
  replaceTaskAnalyticsContent(
    createState("Task analytics could not be loaded. Please check the connection.", "error"),
  );
}

export function initializeOverview({ onNewProject, onNewTask }) {
  newProjectButton?.addEventListener("click", onNewProject);
  newTaskButton?.addEventListener("click", onNewTask);
}

export function setQuickTaskAvailable(isAvailable) {
  if (newTaskButton) {
    newTaskButton.disabled = !isAvailable;
    newTaskButton.title = isAvailable ? "" : "Create a project before adding a task.";
  }
}
