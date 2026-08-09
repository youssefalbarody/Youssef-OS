import { createProject, updateProject } from "./projects.service.js";

const dialog = document.querySelector("#project-dialog");
const form = document.querySelector("#project-form");
const openButton = document.querySelector("#new-project-button");
const closeButton = document.querySelector("#close-project-dialog");
const cancelButton = document.querySelector("#cancel-project-button");
const submitButton = document.querySelector("#create-project-button");
const feedback = document.querySelector("#project-form-feedback");
const nameInput = document.querySelector("#project-name");
const dialogTitle = document.querySelector("#project-dialog-title");

let editingProject = null;

function setFeedback(message, state = "") {
  if (feedback) {
    feedback.dataset.state = state;
    feedback.textContent = message;
  }
}

function setFormMode(project = null) {
  editingProject = project;

  if (dialogTitle && submitButton) {
    dialogTitle.textContent = project ? "Edit Project" : "New Project";
    submitButton.textContent = project ? "Save Changes" : "Create Project";
  }
}

function setSubmitting(isSubmitting) {
  if (submitButton) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? editingProject
        ? "Saving..."
        : "Creating..."
      : editingProject
        ? "Save Changes"
        : "Create Project";
  }
}

function closeDialog() {
  if (dialog?.open) {
    dialog.close();
  }
}

function setFormValues(project) {
  form.elements.name.value = project.name || "";
  form.elements.description.value = project.description || "";
  form.elements.color.value = project.color || "";
  form.elements.icon.value = project.icon || "";
  form.elements.namedItem("status").value = project.status || "Active";
}

function getProjectFromForm() {
  const formData = new FormData(form);

  return {
    name: formData.get("name").trim(),
    description: formData.get("description").trim(),
    color: formData.get("color").trim(),
    icon: formData.get("icon").trim(),
    status: formData.get("status").trim(),
  };
}

export function initializeProjectForm(onSaved) {
  function openForCreate() {
    form?.reset();
    setFormMode();
    setFeedback();
    dialog?.showModal();
    nameInput?.focus();
  }

  function openForEdit(project) {
    setFormMode(project);
    setFormValues(project);
    setFeedback();
    dialog?.showModal();
    nameInput?.focus();
  }

  openButton?.addEventListener("click", openForCreate);
  closeButton?.addEventListener("click", closeDialog);
  cancelButton?.addEventListener("click", closeDialog);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const project = getProjectFromForm();

    if (!project.name) {
      setFeedback("Project name is required.", "error");
      nameInput?.focus();
      return;
    }

    const isEditing = Boolean(editingProject);
    setSubmitting(true);
    setFeedback(isEditing ? "Saving project..." : "Creating project...", "loading");

    try {
      let createdProject = null;

      if (isEditing) {
        await updateProject(
          editingProject.id,
          project,
          project.name !== editingProject.name,
        );
      } else {
        createdProject = await createProject(project);
      }

      await onSaved(createdProject);
      setFeedback(
        isEditing ? "Project updated successfully." : "Project created successfully.",
        "success",
      );

      if (!isEditing) {
        form.reset();
        closeDialog();
      }
    } catch (error) {
      console.error("Project could not be saved.", error);
      setFeedback("Project could not be saved. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  });

  return { openForCreate, openForEdit };
}
