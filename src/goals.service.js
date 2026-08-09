import { supabase } from "./supabase.client.js";

export async function getGoals() {
  const { data, error } = await supabase.from("goals")
    .select("id, title, description, status, target_date, progress, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGoal(goal) {
  const { error } = await supabase.from("goals").insert({
    title: goal.title,
    description: goal.description || null,
    status: goal.status,
    target_date: goal.targetDate || null,
    progress: goal.progress,
  });
  if (error) throw error;
}

export async function updateGoal(id, goal) {
  const { error } = await supabase.from("goals").update({
    title: goal.title,
    description: goal.description || null,
    status: goal.status,
    target_date: goal.targetDate || null,
    progress: goal.progress,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}
