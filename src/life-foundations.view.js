import { createGoal, updateGoal } from "./goals.service.js";
import { createHabit, updateHabit, updateHabitActive } from "./habits.service.js";

const goalsContent = document.querySelector("#goals-content");
const habitsContent = document.querySelector("#habits-content");
const timelineContent = document.querySelector("#timeline-content");
const goalDialog = document.querySelector("#goal-dialog");
const habitDialog = document.querySelector("#habit-dialog");
const goalForm = document.querySelector("#goal-form");
const habitForm = document.querySelector("#habit-form");
let onChanged = async () => {};
let habitsById = new Map();
let goalsById = new Map();
let editingGoal = null;
let editingHabit = null;

function state(message) {
  const element = document.createElement("p");
  element.className = "life-state";
  element.textContent = message;
  return element;
}

function dateLabel(value) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No target date";
}

export function renderGoals(goals) {
  if (!goalsContent) return;
  goalsById = new Map(goals.map((goal) => [goal.id, goal]));
  if (!goals.length) {
    goalsContent.replaceChildren(state("No goals yet. Add a focused outcome to begin."));
    return;
  }
  const list = document.createElement("div");
  list.className = "life-list";
  goals.forEach((goal) => {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const meta = document.createElement("p");
    const progress = document.createElement("div");
    const bar = document.createElement("span");
    const edit = document.createElement("button");
    card.className = "life-card";
    title.textContent = goal.title;
    meta.textContent = `${goal.status} · ${dateLabel(goal.target_date)} · ${goal.progress}%`;
    progress.className = "project-progress";
    bar.style.setProperty("--progress", `${goal.progress}%`);
    progress.append(bar);
    card.append(title);
    if (goal.description) { const description = document.createElement("p"); description.textContent = goal.description; card.append(description); }
    edit.className = "button button--secondary";
    edit.type = "button";
    edit.dataset.goalId = goal.id;
    edit.textContent = "Edit";
    card.append(meta, progress, edit);
    list.append(card);
  });
  goalsContent.replaceChildren(list);
}

export function renderHabits(habits) {
  if (!habitsContent) return;
  habitsById = new Map(habits.map((habit) => [habit.id, habit]));
  if (!habits.length) { habitsContent.replaceChildren(state("No habits yet. Add one small recurring practice.")); return; }
  const list = document.createElement("div");
  list.className = "life-list";
  habits.forEach((habit) => {
    const card = document.createElement("article");
    const title = document.createElement("h3");
    const meta = document.createElement("p");
    const button = document.createElement("button");
    card.className = "life-card life-card--habit";
    title.textContent = habit.name;
    meta.textContent = `${habit.frequency} · ${habit.is_active ? "Active" : "Inactive"}`;
    button.className = "button button--secondary";
    button.type = "button";
    button.dataset.habitId = habit.id;
    button.textContent = habit.is_active ? "Pause" : "Activate";
    const edit = document.createElement("button");
    edit.className = "button button--secondary";
    edit.type = "button";
    edit.dataset.editHabitId = habit.id;
    edit.textContent = "Edit";
    card.append(title, meta, button, edit);
    list.append(card);
  });
  habitsContent.replaceChildren(list);
}

export function renderTimeline(timeline, projects) {
  if (!timelineContent) return;
  const names = new Map(projects.map((project) => [project.id, project.name]));
  const sections = [["Overdue", timeline.overdue], ["Today", timeline.today], ["Upcoming", timeline.upcoming], ["Future", timeline.future]];
  const content = document.createElement("div");
  content.className = "timeline-grid";
  sections.forEach(([label, tasks]) => {
    const section = document.createElement("section");
    const heading = document.createElement("h3");
    heading.textContent = label;
    section.append(heading);
    if (!tasks.length) section.append(state(`No ${label.toLocaleLowerCase()} items.`));
    else tasks.forEach((task) => { const item = document.createElement("p"); item.className = "timeline-item"; item.textContent = `${dateLabel(task.due_date)} · ${task.title}${names.get(task.project_id) ? ` · ${names.get(task.project_id)}` : ""}`; section.append(item); });
    content.append(section);
  });
  timelineContent.replaceChildren(content);
}

export function initializeLifeFoundations({ onDataChanged }) {
  onChanged = onDataChanged;
  document.querySelector("#new-goal-button")?.addEventListener("click", () => {
    editingGoal = null;
    goalForm?.reset();
    document.querySelector("#goal-dialog-title").textContent = "New Goal";
    goalForm?.querySelector('[type="submit"]').replaceChildren("Create Goal");
    goalDialog?.showModal();
  });
  document.querySelector("#new-habit-button")?.addEventListener("click", () => {
    editingHabit = null;
    habitForm?.reset();
    document.querySelector("#habit-dialog-title").textContent = "New Habit";
    habitForm?.querySelector('[type="submit"]').replaceChildren("Create Habit");
    habitDialog?.showModal();
  });
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close()));
  goalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(goalForm);
    const title = data.get("title").trim();
    if (!title) return;
    const goal = { title, description: data.get("description").trim(), status: data.get("status"), targetDate: data.get("target-date"), progress: Number(data.get("progress")) };
    if (editingGoal) await updateGoal(editingGoal.id, goal);
    else await createGoal(goal);
    goalDialog?.close();
    await onChanged();
  });
  habitForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(habitForm);
    const name = data.get("name").trim();
    if (!name) return;
    const habit = { name, frequency: data.get("frequency") };
    if (editingHabit) await updateHabit(editingHabit.id, habit);
    else await createHabit(habit);
    habitDialog?.close();
    await onChanged();
  });
  habitsContent?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-habit-id]");
    if (editButton) {
      editingHabit = habitsById.get(editButton.dataset.editHabitId);
      if (!editingHabit) return;
      habitForm.elements.name.value = editingHabit.name;
      habitForm.elements.frequency.value = editingHabit.frequency;
      document.querySelector("#habit-dialog-title").textContent = "Edit Habit";
      habitForm.querySelector('[type="submit"]').replaceChildren("Save Habit");
      habitDialog?.showModal();
      return;
    }
    const button = event.target.closest("[data-habit-id]");
    const habit = habitsById.get(button?.dataset.habitId);
    if (!habit) return;
    button.disabled = true;
    await updateHabitActive(habit.id, !habit.is_active);
    await onChanged();
  });
  goalsContent?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-goal-id]");
    editingGoal = goalsById.get(button?.dataset.goalId);
    if (!editingGoal) return;
    goalForm.elements.title.value = editingGoal.title;
    goalForm.elements.description.value = editingGoal.description || "";
    goalForm.elements.status.value = editingGoal.status;
    goalForm.elements["target-date"].value = editingGoal.target_date || "";
    goalForm.elements.progress.value = editingGoal.progress;
    document.querySelector("#goal-dialog-title").textContent = "Edit Goal";
    goalForm.querySelector('[type="submit"]').replaceChildren("Save Goal");
    goalDialog?.showModal();
  });
}
