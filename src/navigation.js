const navigation = [
  { id: "dashboard", label: "Dashboard", group: "Main", mobileLabel: "Home", icon: "⌂" },
  { id: "tasks", label: "Tasks", group: "Work", mobileLabel: "Tasks", icon: "✓" },
  { id: "projects", label: "Projects", group: "Work", icon: "▣" },
  { id: "goals", label: "Goals", group: "Life", mobileLabel: "Goals", icon: "◎" },
  { id: "habits", label: "Habits", group: "Life", icon: "◌" },
  { id: "calendar", label: "Calendar", group: "Life", icon: "□" },
  { id: "analytics", label: "Analytics", group: "Insights", icon: "↗" },
];

const workspaceSections = document.querySelectorAll("[data-workspace]");
const workspaceLabel = document.querySelector("#workspace-label");
const desktopNavigation = document.querySelector("#desktop-navigation");
const mobileNavigation = document.querySelector("#mobile-navigation");

function activeWorkspace() {
  const id = window.location.hash.replace("#", "");
  return navigation.some((item) => item.id === id) ? id : "dashboard";
}

function createButton(item, className) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  button.dataset.workspaceTarget = item.id;
  button.innerHTML = `<span aria-hidden="true">${item.icon}</span><span>${item.mobileLabel || item.label}</span>`;
  button.setAttribute("aria-label", item.label);
  return button;
}

function renderDesktopNavigation() {
  if (!desktopNavigation) return;
  const groups = new Map();
  navigation.forEach((item) => {
    if (!groups.has(item.group)) groups.set(item.group, []);
    groups.get(item.group).push(item);
  });
  const content = document.createDocumentFragment();
  groups.forEach((items, group) => {
    const section = document.createElement("section");
    const heading = document.createElement("p");
    const list = document.createElement("div");
    heading.className = "app-navigation__group";
    heading.textContent = group;
    list.className = "app-navigation__list";
    items.forEach((item) => list.append(createButton(item, "app-navigation__item")));
    section.append(heading, list);
    content.append(section);
  });
  desktopNavigation.replaceChildren(content);
}

function createQuickAdd(onQuickAdd) {
  const menu = document.createElement("div");
  menu.className = "quick-add-menu";
  menu.hidden = true;
  ["task", "project", "goal", "habit"].forEach((type) => {
    const button = document.createElement("button");
    button.className = "quick-add-menu__item";
    button.type = "button";
    button.textContent = `New ${type[0].toUpperCase()}${type.slice(1)}`;
    button.addEventListener("click", () => {
      menu.hidden = true;
      onQuickAdd(type);
    });
    menu.append(button);
  });
  document.body.append(menu);
  return menu;
}

function renderMobileNavigation(onQuickAdd) {
  if (!mobileNavigation) return;
  const quickAddMenu = createQuickAdd(onQuickAdd);
  const moreItems = navigation.filter((item) => ["projects", "habits", "calendar", "analytics"].includes(item.id));
  const primary = navigation.filter((item) => ["dashboard", "tasks", "goals"].includes(item.id));
  primary.splice(2, 0, { id: "quick-add", label: "Quick Add", mobileLabel: "Quick Add", icon: "+" });
  primary.push({ id: "more", label: "More", mobileLabel: "More", icon: "•••" });
  const moreMenu = document.createElement("div");
  moreMenu.className = "more-menu";
  moreMenu.hidden = true;
  moreItems.forEach((item) => moreMenu.append(createButton(item, "more-menu__item")));
  document.body.append(moreMenu);
  const buttons = primary.map((item) => {
    const button = createButton(item, "mobile-navigation__item");
    if (item.id === "quick-add" || item.id === "more") {
      delete button.dataset.workspaceTarget;
      button.dataset.mobileAction = item.id;
    }
    return button;
  });
  mobileNavigation.replaceChildren(...buttons);
  mobileNavigation.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.mobileAction === "quick-add") {
      quickAddMenu.hidden = !quickAddMenu.hidden;
      moreMenu.hidden = true;
    }
    if (button.dataset.mobileAction === "more") {
      moreMenu.hidden = !moreMenu.hidden;
      quickAddMenu.hidden = true;
    }
  });
}

function updateWorkspace() {
  const current = activeWorkspace();
  const item = navigation.find((entry) => entry.id === current);
  workspaceSections.forEach((section) => { section.hidden = section.dataset.workspace !== current; });
  document.querySelectorAll("[data-workspace-target]").forEach((button) => {
    const isActive = button.dataset.workspaceTarget === current;
    button.dataset.active = String(isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });
  if (workspaceLabel) workspaceLabel.textContent = item.label;
}

export function initializeNavigation({ onQuickAdd }) {
  renderDesktopNavigation();
  renderMobileNavigation(onQuickAdd);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-workspace-target]");
    if (button?.dataset.workspaceTarget) window.location.hash = button.dataset.workspaceTarget;
  });
  window.addEventListener("hashchange", updateWorkspace);
  updateWorkspace();
}
