import { supabase } from "./supabase.client.js";
import { createProjectSlug } from "./projects.utils.js";

/**
 * Reads project data needed for the dashboard and shared project form.
 */
export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, color, icon, status")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Creates one project with the fields approved for the current sprint.
 */
export async function createProject(project) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      slug: createProjectSlug(project.name),
      description: project.description || null,
      color: project.color || null,
      icon: project.icon || null,
      status: project.status || null,
    })
    .select("id, name, description, color, icon, status")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Updates one project. The slug changes only when the project name changes.
 */
export async function updateProject(projectId, project, nameChanged) {
  const changes = {
    name: project.name,
    description: project.description || null,
    color: project.color || null,
    icon: project.icon || null,
    status: project.status || null,
  };

  if (nameChanged) {
    changes.slug = createProjectSlug(project.name);
  }

  const { error } = await supabase
    .from("projects")
    .update(changes)
    .eq("id", projectId);

  if (error) {
    throw error;
  }
}
