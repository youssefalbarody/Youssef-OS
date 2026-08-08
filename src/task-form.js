import { createTask, updateTaskTitle } from "./tasks.service.js";

const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");
const closeButton = document.querySelector("#close-task-dialog");
const cancelButton = document.querySelector("#cancel-task-button");
const submitButton = document.querySelector("#create-task-button");
const feedback = document.querySelector("#task-form-feedback");
const titleInput = document.querySelector("#task-title");
const dialogTitle = document.querySelector("#task-dialog-title");

let selectedProject = null;
let editingTask = null;

function setFeedback(message, state = "") {
  if (feedback) {
    feedback.dataset.state = state;
    feedback.textContent = message;
  }
}

function setFormMode(task = null) {
  editingTask = task;

  if (dialogTitle) {
    dialogTitle.textContent = task ? "Edit Task" : "New Task";
  }

  if (submitButton) {
    submitButton.textContent = task ? "Save Changes" : "Create Task";
  }
}

function setSubmitting(isSubmitting) {
  if (submitButton) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? editingTask
        ? "Saving..."
        : "Creating..."
      : editingTask
        ? "Save Changes"
        : "Create Task";
  }
}

function closeDialog() {
  if (dialog?.open) {
    dialog.close();
  }
}

export function initializeTaskForm(onSaved) {
  function openForCreate(project) {
    selectedProject = project;
    form?.reset();
    setFormMode();
    setFeedback();
    dialog?.showModal();
    titleInput?.focus();
  }

  function openForEdit(task) {
    selectedProject = null;
    form?.reset();
    setFormMode(task);
    setFeedback();

    if (titleInput) {
      titleInput.value = task.title;
    }

    dialog?.showModal();
    titleInput?.focus();
  }

  closeButton?.addEventListener("click", closeDialog);
  cancelButton?.addEventListener("click", closeDialog);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput?.value.trim() || "";

    if (!title) {
      setFeedback("Task title is required.", "error");
      titleInput?.focus();
      return;
    }

    if (!editingTask && !selectedProject) {
      setFeedback("Select a project before creating a task.", "error");
      return;
    }

    setSubmitting(true);
    setFeedback(editingTask ? "Saving task..." : "Creating task...", "loading");

    try {
      if (editingTask) {
        await updateTaskTitle(editingTask.id, title);
        await onSaved();
        setFeedback("Task updated successfully.", "success");
      } else {
        await createTask(selectedProject.id, title);
        await onSaved(selectedProject);
        setFeedback("Task created successfully.", "success");
      }
    } catch (error) {
      console.error("Task could not be saved.", error);
      setFeedback("Task could not be saved. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  });

  return { openForCreate, openForEdit };
}
