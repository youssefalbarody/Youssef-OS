import { supabase } from "./supabase.client.js";

export async function getHabits() {
  const { data, error } = await supabase.from("habits")
    .select("id, name, is_active, frequency, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createHabit(habit) {
  const { error } = await supabase.from("habits").insert({ name: habit.name, frequency: habit.frequency });
  if (error) throw error;
}

export async function updateHabit(id, habit) {
  const { error } = await supabase.from("habits").update({
    name: habit.name,
    frequency: habit.frequency,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw error;
}

export async function updateHabitActive(id, isActive) {
  const { error } = await supabase.from("habits").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}
