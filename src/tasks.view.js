const tasksContent = document.querySelector("#tasks-content");
const tasksTitle = document.querySelector("#tasks-title");
const newTaskButton = document.querySelector("#new-task-button");
const searchInput = document.querySelector("#task-search");
const statusFilter = document.querySelector("#task-status-filter");
const priorityFilter = document.querySelector("#task-priority-filter");
const sortControl = document.querySelector("#task-sort");
const quickFilterButtons = document.querySelectorAll("[data-quick-filter]");
const taskCounts = document.querySelector("#task-counts");
let onCreateTask = () => {};
let onToggleTask = async () => {};
let onEditTask = () => {};
let onDeleteTask = async () => {};
let selectedProject = null;
let tasksById = new Map();
let loadedTasks = [];
let activeQuickFilter = "all";

function getToday() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function isOverdue(task) {
  return task.due_date && task.status !== "done" && task.due_date < getToday();
}

function createState(message, state) {
  const stateElement = document.createElement("div");
  const messageElement = document.createElement("p");

  stateElement.className = "tasks-state";
  stateElement.dataset.state = state;
  messageElement.textContent = message;
  stateElement.append(messageElement);

  return stateElement;
}

function createTaskItem(task) {
  const item = document.createElement("article");
  const title = document.createElement("h3");
  const details = document.createElement("dl");
  const statusLabel = document.createElement("dt");
  const statusValue = document.createElement("dd");
  const priorityValue = document.createElement("span");
  const dueDateValue = document.createElement("span");
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const toggleButton = document.createElement("button");
  const deleteButton = document.createElement("button");
  const status = task.status || "todo";
  const priority = task.priority || "medium";
  const dueDate = task.due_date;
  const overdue = isOverdue(task);

  item.className = "task-item";
  title.textContent = task.title;
  statusLabel.textContent = "Status";
  statusValue.className = "status-badge";
  statusValue.dataset.status = status.toLowerCase().replace(/\s+/g, "-");
  statusValue.textContent = status;
  priorityValue.className = "priority-badge";
  priorityValue.dataset.priority = priority;
  priorityValue.textContent = `Priority: ${priority}`;
  details.append(statusLabel, statusValue, priorityValue);

  if (dueDate) {
    dueDateValue.className = "due-date";
    dueDateValue.textContent = `Due: ${new Date(`${dueDate}T00:00:00`).toLocaleDateString()}`;
    if (overdue) {
      dueDateValue.dataset.state = "overdue";
      dueDateValue.textContent += " (Overdue)";
      item.dataset.overdue = "true";
    }
    details.append(dueDateValue);
  }
  actions.className = "task-item__actions";
  editButton.className = "button button--secondary";
  editButton.type = "button";
  editButton.dataset.taskId = task.id;
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";
  editButton.setAttribute("aria-label", `Edit ${task.title}`);
  toggleButton.className = "button button--secondary";
  toggleButton.type = "button";
  toggleButton.dataset.taskId = task.id;
  toggleButton.dataset.action = "toggle-status";
  toggleButton.textContent = status === "done" ? "Mark as todo" : "Complete";
  toggleButton.setAttribute(
    "aria-label",
    status === "done" ? `Mark ${task.title} as todo` : `Mark ${task.title} as done`,
  );
  deleteButton.className = "button button--danger";
  deleteButton.type = "button";
  deleteButton.dataset.taskId = task.id;
  deleteButton.dataset.action = "delete";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);
  actions.append(editButton, toggleButton, deleteButton);
  item.append(title, details, actions);

  return item;
}

function replaceTasksContent(content) {
  if (tasksContent) {
    tasksContent.replaceChildren(content);
  }
}

function setTasksTitle(projectName) {
  if (tasksTitle) {
    tasksTitle.textContent = projectName ? `Tasks — ${projectName}` : "Tasks";
  }
}

function setSelectedProject(project = null) {
  selectedProject = project;

  if (newTaskButton) {
    newTaskButton.hidden = !project;
  }
}

function matchesQuickFilter(task) {
  if (activeQuickFilter === "today") {
    return task.due_date === getToday();
  }

  if (activeQuickFilter === "overdue") {
    return isOverdue(task);
  }

  if (activeQuickFilter === "high-priority") {
    return task.priority === "high";
  }

  if (activeQuickFilter === "completed") {
    return task.status === "done";
  }

  return true;
}

function getVisibleTasks() {
  const query = searchInput?.value.trim().toLocaleLowerCase() || "";
  const selectedStatus = statusFilter?.value || "all";
  const selectedPriority = priorityFilter?.value || "all";
  const sortBy = sortControl?.value || "newest";
  const priorityOrder = { high: 0, medium: 1, low: 2 };

  return [...loadedTasks]
    .filter((task) => !query || task.title.toLocaleLowerCase().includes(query))
    .filter((task) => selectedStatus === "all" || task.status === selectedStatus)
    .filter((task) => selectedPriority === "all" || task.priority === selectedPriority)
    .filter(matchesQuickFilter)
    .sort((first, second) => {
      if (sortBy === "oldest") {
        return new Date(first.created_at) - new Date(second.created_at);
      }

      if (sortBy === "priority") {
        return (priorityOrder[first.priority] ?? 1) - (priorityOrder[second.priority] ?? 1);
      }

      if (sortBy === "due-date") {
        if (!first.due_date && !second.due_date) return 0;
        if (!first.due_date) return 1;
        if (!second.due_date) return -1;
        return first.due_date.localeCompare(second.due_date);
      }

      return new Date(second.created_at) - new Date(first.created_at);
    });
}

function renderTaskCounts(tasks) {
  if (!taskCounts) {
    return;
  }

  const counts = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status !== "done").length,
    completed: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter(isOverdue).length,
  };

  const metrics = [
    ["Total", counts.total],
    ["Pending", counts.pending],
    ["Completed", counts.completed],
    ["Overdue", counts.overdue],
  ].map(([label, value]) => {
    const metric = document.createElement("span");
    const valueElement = document.createElement("strong");

    metric.className = "task-count";
    metric.dataset.count = label.toLocaleLowerCase();
    valueElement.textContent = value;
    metric.append(valueElement, ` ${label}`);
    return metric;
  });

  taskCounts.replaceChildren(...metrics);
}

function getEmptyStateMessage() {
  if (loadedTasks.length === 0) {
    return "No tasks for this project yet.";
  }

  if (searchInput?.value.trim()) {
    return "No tasks match your search.";
  }

  if (activeQuickFilter === "overdue") {
    return "No overdue tasks.";
  }

  if (activeQuickFilter === "today") {
    return "No tasks due today.";
  }

  return "No tasks match your selected filters.";
}

function getTaskGroups(tasks) {
  const groups = [
    ["Overdue", (task) => isOverdue(task)],
    ["Today", (task) => task.due_date === getToday()],
    ["Upcoming", (task) => task.due_date && task.due_date > getToday()],
    ["Completed", (task) => task.status === "done"],
    ["No Due Date", (task) => !task.due_date],
  ];
  const remaining = new Set(tasks.map((task) => task.id));

  return groups
    .map(([label, matches]) => {
      const groupedTasks = tasks.filter((task) => remaining.has(task.id) && matches(task));
      groupedTasks.forEach((task) => remaining.delete(task.id));
      return { label, tasks: groupedTasks };
    })
    .filter((group) => group.tasks.length);
}

function createTaskGroup(group) {
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  const list = document.createElement("div");

  section.className = "task-group";
  heading.className = "task-group__title";
  heading.textContent = group.label;
  list.className = "tasks-list";
  group.tasks.forEach((task) => list.append(createTaskItem(task)));
  section.append(heading, list);
  return section;
}

function renderVisibleTasks() {
  const tasks = getVisibleTasks();
  tasksById = new Map(loadedTasks.map((task) => [task.id, task]));
  renderTaskCounts(tasks);

  if (tasks.length === 0) {
    replaceTasksContent(createState(getEmptyStateMessage(), "empty"));
    return;
  }

  if (sortControl?.value === "due-date") {
    const groups = document.createElement("div");

    groups.className = "task-groups";
    getTaskGroups(tasks).forEach((group) => groups.append(createTaskGroup(group)));
    replaceTasksContent(groups);
    return;
  }

  const list = document.createElement("div");
  list.className = "tasks-list";
  tasks.forEach((task) => list.append(createTaskItem(task)));
  replaceTasksContent(list);
}

export function renderTasksInitial() {
  loadedTasks = [];
  renderTaskCounts([]);
  setSelectedProject();
  setTasksTitle();
  replaceTasksContent(createState("Select a project to view its tasks.", "initial"));
}

export function renderTasksLoading(projectName) {
  setTasksTitle(projectName);
  replaceTasksContent(createState("Loading tasks...", "loading"));
}

export function renderTasks(tasks, projectName) {
  setTasksTitle(projectName);
  loadedTasks = tasks;
  renderVisibleTasks();
}

export function renderTasksError(projectName) {
  setTasksTitle(projectName);
  replaceTasksContent(
    createState("Tasks could not be loaded. Please check the connection.", "error"),
  );
}

export function initializeTasksView({ onCreate, onToggle, onEdit, onDelete }) {
  onCreateTask = onCreate;
  onToggleTask = onToggle;
  onEditTask = onEdit;
  onDeleteTask = onDelete;

  [searchInput, statusFilter, priorityFilter, sortControl].forEach((control) => {
    control?.addEventListener("input", renderVisibleTasks);
    control?.addEventListener("change", renderVisibleTasks);
  });

  quickFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeQuickFilter = button.dataset.quickFilter;
      quickFilterButtons.forEach((filterButton) => {
        const isActive = filterButton === button;
        filterButton.dataset.active = isActive;
        filterButton.setAttribute("aria-pressed", String(isActive));
      });
      renderVisibleTasks();
    });
  });

  newTaskButton?.addEventListener("click", () => {
    if (selectedProject) {
      onCreateTask(selectedProject);
    }
  });

  tasksContent?.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-task-id]");

    if (!actionButton) {
      return;
    }

    const task = tasksById.get(actionButton.dataset.taskId);

    if (!task) {
      return;
    }

    if (actionButton.dataset.action === "edit") {
      onEditTask(task);
      return;
    }

    if (actionButton.dataset.action === "delete") {
      if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
        return;
      }

      actionButton.disabled = true;
      actionButton.textContent = "Deleting...";

      try {
        await onDeleteTask(task);
      } catch (error) {
        console.error("Task could not be deleted.", error);
        actionButton.disabled = false;
        actionButton.textContent = "Delete";
        const feedback = createState(
          "Task could not be deleted. Please try again.",
          "error",
        );
        feedback.classList.add("tasks-feedback");
        actionButton.closest(".task-item")?.append(feedback);
      }

      return;
    }

    if (actionButton.dataset.action !== "toggle-status") {
      return;
    }

    const originalLabel = actionButton.textContent;
    actionButton.disabled = true;
    actionButton.textContent = "Updating...";

    try {
      await onToggleTask(task);
    } catch (error) {
      console.error("Task status could not be updated.", error);
      actionButton.disabled = false;
      actionButton.textContent = originalLabel;

      const feedback = createState(
        "Task status could not be updated. Please try again.",
        "error",
      );
      feedback.classList.add("tasks-feedback");
      actionButton.closest(".task-item")?.append(feedback);
    }
  });
}

export function selectTasksProject(project) {
  setSelectedProject(project);
}
