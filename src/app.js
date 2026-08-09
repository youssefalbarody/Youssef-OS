"use strict";

import {
  SUPABASE_CONNECTION_CHECK_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "./supabase.config.js";
import "./supabase.client.js";
import { initializeProjectForm } from "./project-form.js?v=0.4.0";
import { initializeNavigation } from "./navigation.js?v=0.4.0";
import { getProjects } from "./projects.service.js?v=0.4.0";
import { getGoals } from "./goals.service.js?v=0.4.0";
import { getHabits } from "./habits.service.js?v=0.4.0";
import { buildProjectSummaries, buildTaskAnalytics, buildTimeline } from "./analytics.js?v=0.4.0";
import { initializeLifeFoundations, renderGoals, renderHabits, renderTimeline } from "./life-foundations.view.js?v=0.4.0";
import { initializeTaskForm } from "./task-form.js?v=0.4.0.1";
import {
  deleteTask,
  getTaskSummary,
  getTasksByProjectId,
  updateTaskStatus,
} from "./tasks.service.js?v=0.4.0";
import {
  initializeOverview,
  renderOverview,
  renderOverviewError,
  renderOverviewLoading,
  renderTaskAnalytics,
  renderTaskAnalyticsError,
  renderTaskAnalyticsLoading,
  setQuickTaskAvailable,
} from "./overview.view.js?v=0.4.0";
import {
  initializeTasksView,
  renderTasks,
  renderTasksError,
  renderTasksInitial,
  renderTasksLoading,
  selectTasksProject,
} from "./tasks.view.js?v=0.4.0";
import {
  initializeProjectsView,
  renderProjects,
  renderProjectsError,
  renderProjectsLoading,
} from "./projects.view.js?v=0.4.0";

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

async function refreshDashboard() {
  renderProjectsLoading();
  renderOverviewLoading();
  renderTaskAnalyticsLoading();
  try {
    const [projects, tasks, goals, habits] = await Promise.all([
      getProjects(), getTaskSummary(), getGoals(), getHabits(),
    ]);
    availableProjects = projects;
    setQuickTaskAvailable(projects.length > 0);
    const summary = tasks.reduce((counts, task) => {
      counts.totalTasks += 1;
      if (task.status === "done") counts.completedTasks += 1;
      else counts.pendingTasks += 1;
      return counts;
    }, {
      activeProjects: projects.filter((project) => project.status?.toLowerCase() === "active").length,
      pendingTasks: 0, completedTasks: 0, totalTasks: 0,
    });
    renderProjects(projects, buildProjectSummaries(projects, tasks));
    renderOverview(summary);
    renderTaskAnalytics(buildTaskAnalytics(tasks));
    renderGoals(goals);
    renderHabits(habits);
    renderTimeline(buildTimeline(tasks), projects);
  } catch (error) {
    console.error("Dashboard data could not be loaded.", error);
    renderProjectsError();
    renderOverviewError();
    renderTaskAnalyticsError();
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
  await Promise.all([loadTasksForProject(selectedTasksProject), refreshDashboard()]);
}

async function removeTask(task) {
  await deleteTask(task.id);
  await Promise.all([loadTasksForProject(selectedTasksProject), refreshDashboard()]);
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

  await Promise.all([loadTasksForProject(project), refreshDashboard()]);
});

initializeProjectsView({
  onEdit: projectForm.openForEdit,
  onSelect: async (project) => {
    window.location.hash = "tasks";
    await loadTasksForProject(project);
  },
});
initializeTasksView({
  onCreate: taskForm.openForCreate,
  onToggle: toggleTaskStatus,
  onEdit: taskForm.openForEdit,
  onDelete: removeTask,
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
initializeLifeFoundations({ onDataChanged: refreshDashboard });
initializeNavigation({
  onQuickAdd: (type) => {
    if (type === "project") projectForm.openForCreate();
    if (type === "task") {
      const project = selectedTasksProject || availableProjects[0];
      if (project) taskForm.openForCreate(project);
    }
    if (type === "goal") document.querySelector("#new-goal-button")?.click();
    if (type === "habit") document.querySelector("#new-habit-button")?.click();
  },
});
renderTasksInitial();
void checkSupabaseConnection();
void refreshDashboard();
