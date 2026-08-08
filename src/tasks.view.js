const tasksContent = document.querySelector("#tasks-content");
const tasksTitle = document.querySelector("#tasks-title");
const newTaskButton = document.querySelector("#new-task-button");
let onCreateTask = () => {};
let onToggleTask = async () => {};
let onEditTask = () => {};
let selectedProject = null;
let tasksById = new Map();

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
  const actions = document.createElement("div");
  const editButton = document.createElement("button");
  const toggleButton = document.createElement("button");
  const status = task.status || "todo";

  item.className = "task-item";
  title.textContent = task.title;
  statusLabel.textContent = "Status";
  statusValue.className = "status-badge";
  statusValue.dataset.status = status.toLowerCase().replace(/\s+/g, "-");
  statusValue.textContent = status;
  details.append(statusLabel, statusValue);
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
  actions.append(editButton, toggleButton);
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

export function renderTasksInitial() {
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
  tasksById = new Map(tasks.map((task) => [task.id, task]));

  if (tasks.length === 0) {
    replaceTasksContent(createState("No tasks for this project yet.", "empty"));
    return;
  }

  const list = document.createElement("div");
  list.className = "tasks-list";
  tasks.forEach((task) => list.append(createTaskItem(task)));
  replaceTasksContent(list);
}

export function renderTasksError(projectName) {
  setTasksTitle(projectName);
  replaceTasksContent(
    createState("Tasks could not be loaded. Please check the connection.", "error"),
  );
}

export function initializeTasksView({ onCreate, onToggle, onEdit }) {
  onCreateTask = onCreate;
  onToggleTask = onToggle;
  onEditTask = onEdit;

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
