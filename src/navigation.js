const navigation = [
  { id: "dashboard", label: "Dashboard", group: "Main", mobileLabel: "Home", icon: "home" },
  { id: "tasks", label: "Tasks", group: "Work", mobileLabel: "Tasks", icon: "check" },
  { id: "projects", label: "Projects", group: "Work", icon: "layers" },
  { id: "goals", label: "Goals", group: "Life", mobileLabel: "Goals", icon: "target" },
  { id: "habits", label: "Habits", group: "Life", icon: "repeat" },
  { id: "calendar", label: "Calendar", group: "Life", icon: "calendar" },
  { id: "analytics", label: "Analytics", group: "Insights", icon: "chart" },
];

const workspaceSections = document.querySelectorAll("[data-workspace]");
const workspaceLabel = document.querySelector("#workspace-label");
const desktopNavigation = document.querySelector("#desktop-navigation");
const mobileNavigation = document.querySelector("#mobile-navigation");

function activeWorkspace() {
  const id = window.location.hash.replace("#", "");
  return navigation.some((item) => item.id === id) ? id : "dashboard";
}

function iconMarkup(name) {
  const paths = {
    home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/>',
    check: '<path d="M9 11.5 11.5 14 16 8.5"/><rect width="18" height="18" x="3" y="3" rx="4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    chart: '<path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

function createButton(item, className) {
  const button = document.createElement("button");
  const icon = document.createElement("span");
  const label = document.createElement("span");

  button.className = className;
  button.type = "button";
  button.dataset.workspaceTarget = item.id;
  icon.className = "navigation-icon";
  icon.innerHTML = iconMarkup(item.icon);
  label.textContent = item.mobileLabel || item.label;
  button.append(icon, label);
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

function createMobileOverflow(onQuickAdd) {
  const menu = document.createElement("div");
  const quickAddLabel = document.createElement("p");
  const destinationsLabel = document.createElement("p");

  menu.className = "more-menu";
  menu.hidden = true;
  quickAddLabel.className = "more-menu__label";
  quickAddLabel.textContent = "Create";
  menu.append(quickAddLabel);
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
  destinationsLabel.className = "more-menu__label";
  destinationsLabel.textContent = "Explore";
  menu.append(destinationsLabel);
  navigation
    .filter((item) => ["calendar", "analytics"].includes(item.id))
    .forEach((item) => menu.append(createButton(item, "more-menu__item")));
  document.body.append(menu);
  return menu;
}

function renderMobileNavigation(onQuickAdd) {
  if (!mobileNavigation) return;
  const moreMenu = createMobileOverflow(onQuickAdd);
  const primary = ["dashboard", "tasks", "habits", "goals", "projects"]
    .map((id) => navigation.find((item) => item.id === id));
  primary.push({ id: "more", label: "More", mobileLabel: "More", icon: "more" });
  const buttons = primary.map((item) => {
    const button = createButton(item, "mobile-navigation__item");
    if (item.id === "more") {
      delete button.dataset.workspaceTarget;
      button.dataset.mobileAction = item.id;
    }
    return button;
  });
  mobileNavigation.replaceChildren(...buttons);
  mobileNavigation.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.mobileAction === "more") {
      moreMenu.hidden = !moreMenu.hidden;
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
