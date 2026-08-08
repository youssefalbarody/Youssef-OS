import { supabase } from "./supabase.client.js";

/**
 * Reads the tasks that belong to one selected project.
 */
export async function getTasksByProjectId(projectId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Reads task statuses used by the dashboard overview.
 */
export async function getTaskSummary() {
  const { data, error } = await supabase.from("tasks").select("status");

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Creates one task for the selected project.
 */
export async function createTask(projectId, title) {
  const { error } = await supabase.from("tasks").insert({
    project_id: projectId,
    title,
    status: "todo",
  });

  if (error) {
    throw error;
  }
}

/**
 * Updates the completion status of one task.
 */
export async function updateTaskStatus(taskId, status) {
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}

/**
 * Updates the title of one task without changing its status.
 */
export async function updateTaskTitle(taskId, title) {
  const { error } = await supabase
    .from("tasks")
    .update({ title })
    .eq("id", taskId);

  if (error) {
    throw error;
  }
}
