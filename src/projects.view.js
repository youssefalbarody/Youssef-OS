const projectsContent = document.querySelector("#projects-content");
let projectsById = new Map();
let onEditProject = () => {};
let onSelectProject = () => {};

function createState(message, state) {
  const stateElement = document.createElement("div");
  const messageElement = document.createElement("p");

  stateElement.className = "projects-state";
  stateElement.dataset.state = state;
  messageElement.textContent = message;
  stateElement.append(messageElement);

  return stateElement;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  const name = document.createElement("h3");
  const details = document.createElement("dl");
  const statusLabel = document.createElement("dt");
  const statusValue = document.createElement("dd");
  const actions = document.createElement("div");
  const viewTasksButton = document.createElement("button");
  const editButton = document.createElement("button");

  card.className = "project-card";
  if (project.color) {
    card.style.setProperty("--project-color", project.color);
  }
  name.textContent = project.name;
  statusLabel.textContent = "Status";
  statusValue.textContent = project.status || "Not set";
  details.append(statusLabel, statusValue);
  card.append(name, details);

  actions.className = "project-card__actions";
  viewTasksButton.className = "button button--primary";
  viewTasksButton.type = "button";
  viewTasksButton.dataset.projectId = project.id;
  viewTasksButton.dataset.action = "view-tasks";
  viewTasksButton.textContent = "View Tasks";

  editButton.className = "button button--secondary";
  editButton.type = "button";
  editButton.dataset.projectId = project.id;
  editButton.dataset.action = "edit";
  editButton.textContent = "Edit";
  actions.append(viewTasksButton, editButton);
  card.append(actions);

  return card;
}

function replaceProjectsContent(content) {
  if (projectsContent) {
    projectsContent.replaceChildren(content);
  }
}

export function renderProjectsLoading() {
  replaceProjectsContent(createState("Loading projects...", "loading"));
}

export function renderProjects(projects) {
  if (projects.length === 0) {
    replaceProjectsContent(
      createState("No projects yet. Your projects will appear here.", "empty"),
    );
    return;
  }

  const list = document.createElement("div");
  list.className = "projects-grid";

  projectsById = new Map(projects.map((project) => [project.id, project]));
  projects.forEach((project) => list.append(createProjectCard(project)));
  replaceProjectsContent(list);
}

export function renderProjectsError() {
  replaceProjectsContent(
    createState("Projects could not be loaded. Please check the connection.", "error"),
  );
}

export function initializeProjectsView({ onEdit, onSelect }) {
  onEditProject = onEdit;
  onSelectProject = onSelect;

  projectsContent?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-project-id]");

    if (actionButton) {
      const project = projectsById.get(actionButton.dataset.projectId);

      if (project) {
        if (actionButton.dataset.action === "view-tasks") {
          onSelectProject(project);
        }

        if (actionButton.dataset.action === "edit") {
          onEditProject(project);
        }
      }
    }
  });
}
