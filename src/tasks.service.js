import { supabase } from "./supabase.client.js";

/**
 * Reads the tasks that belong to one selected project.
 */
export async function getTasksByProjectId(projectId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, priority, due_date, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Reads the task fields used by the dashboard overview and analytics.
 */
export async function getTaskSummary() {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, project_id, title, status, priority, due_date, completed_at");

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Creates one task for the selected project.
 */
export async function createTask(projectId, task) {
  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    title: task.title,
    status: "todo",
    priority: task.priority,
    due_date: task.dueDate || null,
  });

  if (error) {
    throw error;
  }
}

/**
 * Updates the completion status of one task.
 */
export async function updateTaskStatus(taskId, status) {
  const completedAt = status === "done" ? new Date().toISOString() : null;
  const { error } = await supabase
    .from("tasks")
    .update({ status, completed_at: completedAt })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * Updates the title of one task without changing its status.
 */
export async function updateTask(taskId, task) {
  const { error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      priority: task.priority,
      due_date: task.dueDate || null,
    })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * Deletes only the selected task.
 */
export async function deleteTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    throw error;
  }
}
