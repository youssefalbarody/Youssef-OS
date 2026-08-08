const overviewContent = document.querySelector("#overview-content");
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
