import { createTask } from "./tasks.service.js";

const dialog = document.querySelector("#task-dialog");
const form = document.querySelector("#task-form");
const closeButton = document.querySelector("#close-task-dialog");
const cancelButton = document.querySelector("#cancel-task-button");
const submitButton = document.querySelector("#create-task-button");
const feedback = document.querySelector("#task-form-feedback");
const titleInput = document.querySelector("#task-title");

let selectedProject = null;

function setFeedback(message, state = "") {
  if (feedback) {
    feedback.dataset.state = state;
    feedback.textContent = message;
  }
}

function setSubmitting(isSubmitting) {
  if (submitButton) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Creating..." : "Create Task";
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
    setFeedback();
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

    if (!selectedProject) {
      setFeedback("Select a project before creating a task.", "error");
      return;
    }

    setSubmitting(true);
    setFeedback("Creating task...", "loading");

    try {
      await createTask(selectedProject.id, title);
      await onSaved(selectedProject);
      setFeedback("Task created successfully.", "success");
    } catch (error) {
      console.error("Task could not be created.", error);
      setFeedback("Task could not be created. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  });

  return { openForCreate };
}
