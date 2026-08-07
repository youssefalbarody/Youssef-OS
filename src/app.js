"use strict";

import {
  SUPABASE_CONNECTION_CHECK_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "./supabase.config.js";
import "./supabase.client.js";
import { initializeProjectForm } from "./project-form.js";
import { getProjects } from "./projects.service.js";
import { initializeTaskForm } from "./task-form.js";
import { getTasksByProjectId, updateTaskStatus } from "./tasks.service.js";
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
    renderProjects(projects);
  } catch (error) {
    console.error("Projects could not be loaded.", error);
    renderProjectsError();
  }
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
  await loadTasksForProject(selectedTasksProject);
}

renderConnectionStatus();
const projectForm = initializeProjectForm(loadProjects);
const taskForm = initializeTaskForm(loadTasksForProject);

initializeProjectsView({
  onEdit: projectForm.openForEdit,
  onSelect: loadTasksForProject,
});
initializeTasksView({
  onCreate: taskForm.openForCreate,
  onToggle: toggleTaskStatus,
});
renderTasksInitial();
void checkSupabaseConnection();
void loadProjects();
