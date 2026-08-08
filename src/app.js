"use strict";

import {
  SUPABASE_CONNECTION_CHECK_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "./supabase.config.js";
import "./supabase.client.js";
import { initializeProjectForm } from "./project-form.js";
import { getProjects } from "./projects.service.js";
import { initializeTaskForm } from "./task-form.js";
import { getTaskSummary, getTasksByProjectId, updateTaskStatus } from "./tasks.service.js";
import {
  initializeOverview,
  renderOverview,
  renderOverviewError,
  renderOverviewLoading,
  setQuickTaskAvailable,
} from "./overview.view.js";
import {
  initializeTasksView,
  renderTasks,
  renderTasksError,
  renderTasksInitial,
  renderTasksLoading,
  selectTasksProject,
} from "./tasks.view.js";
import {
  initializeProjectsView,
  renderProjects,
  renderProjectsError,
  renderProjectsLoading,
} from "./projects.view.js";

const connection = {
  state: "checking",
  label: "Checking connection",
};
let selectedTasksProject = null;
let availableProjects = [];

function renderConnectionStatus() {
  const statusElement = document.querySelector("#connection-status");

  if (statusElement) {
    statusElement.dataset.state = connection.state;
    statusElement.textContent = connection.label;
  }
}

function setConnectionStatus(state, label) {
  connection.state = state;
  connection.label = label;
  renderConnectionStatus();
}

async function checkSupabaseConnection() {
  try {
    // This requests public project settings only; it does not access a table or user session.
    const response = await fetch(SUPABASE_CONNECTION_CHECK_URL, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase REST API returned ${response.status}`);
    }

    setConnectionStatus("connected", "Connected ✅");
  } catch (error) {
    console.error("Supabase connection check failed.", error);
    setConnectionStatus("failed", "Failed ❌");
  }
}

async function loadProjects() {
  renderProjectsLoading();

  try {
    const projects = await getProjects();
    availableProjects = projects;
    setQuickTaskAvailable(projects.length > 0);
    renderProjects(projects);
  } catch (error) {
    console.error("Projects could not be loaded.", error);
    renderProjectsError();
  }
}

async function loadOverview() {
  renderOverviewLoading();

  try {
    const [projects, tasks] = await Promise.all([getProjects(), getTaskSummary()]);
    const summary = tasks.reduce(
      (counts, task) => {
        counts.totalTasks += 1;

        if (task.status === "done") {
          counts.completedTasks += 1;
        } else {
          counts.pendingTasks += 1;
        }

        return counts;
      },
      {
        activeProjects: projects.filter(
          (project) => project.status?.toLowerCase() === "active",
        ).length,
        pendingTasks: 0,
        completedTasks: 0,
        totalTasks: 0,
      },
    );

    renderOverview(summary);
  } catch (error) {
    console.error("Dashboard overview could not be loaded.", error);
    renderOverviewError();
  }
}

async function refreshDashboard() {
  await Promise.all([loadProjects(), loadOverview()]);
}

async function loadTasksForProject(project) {
  selectedTasksProject = project;
  selectTasksProject(project);
  renderTasksLoading(project.name);

  try {
    const tasks = await getTasksByProjectId(project.id);
    renderTasks(tasks, project.name);
  } catch (error) {
    console.error("Tasks could not be loaded.", error);
    renderTasksError(project.name);
  }
}

async function toggleTaskStatus(task) {
  const nextStatus = task.status === "done" ? "todo" : "done";

  await updateTaskStatus(task.id, nextStatus);
  await Promise.all([loadTasksForProject(selectedTasksProject), loadOverview()]);
}

renderConnectionStatus();
const projectForm = initializeProjectForm(async (createdProject) => {
  await refreshDashboard();

  if (createdProject) {
    await loadTasksForProject(createdProject);
  }
});
const taskForm = initializeTaskForm(async (project = selectedTasksProject) => {
  if (!project) {
    return;
  }

  await Promise.all([loadTasksForProject(project), loadOverview()]);
});

initializeProjectsView({
  onEdit: projectForm.openForEdit,
  onSelect: loadTasksForProject,
});
initializeTasksView({
  onCreate: taskForm.openForCreate,
  onToggle: toggleTaskStatus,
  onEdit: taskForm.openForEdit,
});
initializeOverview({
  onNewProject: projectForm.openForCreate,
  onNewTask: () => {
    const project = selectedTasksProject || availableProjects[0];

    if (project) {
      taskForm.openForCreate(project);
    }
  },
});
renderTasksInitial();
void checkSupabaseConnection();
void refreshDashboard();
