const form = document.querySelector("#form");
const input = document.querySelector("#text");
const list = document.querySelector("#list");
const count = document.querySelector("#count");
const feedback = document.querySelector("#feedback");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const clearCompletedBtn = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

function load() {
  try {
    const raw = localStorage.getItem("tasks");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "number" &&
        typeof item.text === "string" &&
        typeof item.done === "boolean"
    );
  } catch (e) {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (e) {
    // Safely handle private browsing or storage quota limits
  }
}

let tasks = load();
let currentFilter = "all";

function showFeedback(message) {
  if (!feedback) return;
  if (!message) {
    feedback.textContent = "";
    feedback.classList.remove("visible");
    return;
  }
  feedback.textContent = message;
  feedback.classList.add("visible");
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((t) => !t.done);
  }
  if (currentFilter === "done") {
    return tasks.filter((t) => t.done);
  }
  return tasks;
}

function render() {
  list.innerHTML = "";

  const filtered = getFilteredTasks();

  filtered.forEach((t) => {
    const li = document.createElement("li");
    li.dataset.id = String(t.id);
    li.className = t.done ? "done" : "";

    const leftDiv = document.createElement("div");
    leftDiv.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = t.done;
    checkbox.dataset.action = "toggle";
    checkbox.setAttribute("aria-label", `Mark "${t.text}" as ${t.done ? "incomplete" : "complete"}`);

    const label = document.createElement("span");
    label.className = "task-label";
    label.dataset.action = "toggle";
    // Always use textContent so user-supplied text is never parsed as HTML
    label.textContent = t.text;

    leftDiv.append(checkbox, label);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "task-actions";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "action-btn btn-toggle";
    toggle.dataset.action = "toggle";
    toggle.textContent = t.done ? "Undo" : "Done";

    const del = document.createElement("button");
    del.type = "button";
    del.className = "action-btn btn-delete";
    del.dataset.action = "delete";
    del.textContent = "Delete";

    actionsDiv.append(toggle, del);
    li.append(leftDiv, actionsDiv);
    list.appendChild(li);
  });

  const remainingCount = tasks.filter((t) => !t.done).length;
  count.textContent = `${remainingCount} left`;

  const completedCount = tasks.length - remainingCount;
  if (clearCompletedBtn) {
    clearCompletedBtn.disabled = completedCount === 0;
    clearCompletedBtn.textContent =
      completedCount > 0 ? `Clear completed (${completedCount})` : "Clear completed";
  }

  if (emptyState && emptyMessage) {
    if (tasks.length === 0) {
      emptyState.style.display = "block";
      emptyMessage.textContent =
        "No tasks yet. Add your first task above and press Enter or click Add Task.";
    } else if (filtered.length === 0) {
      emptyState.style.display = "block";
      emptyMessage.textContent =
        currentFilter === "active"
          ? "No active tasks remaining — everything is marked done!"
          : "No completed tasks yet.";
    } else {
      emptyState.style.display = "none";
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showFeedback("Please enter a non-empty task description before adding.");
    input.focus();
    return;
  }
  showFeedback("");
  tasks.push({ id: Date.now(), text, done: false });
  input.value = "";
  save();
  render();
  input.focus();
});

input.addEventListener("input", () => {
  if (feedback && feedback.classList.contains("visible") && input.value.trim()) {
    showFeedback("");
  }
});

list.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  const li = actionEl.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);
  const action = actionEl.dataset.action;

  if (action === "toggle") {
    const t = tasks.find((x) => x.id === id);
    if (t) {
      t.done = !t.done;
    }
  } else if (action === "delete") {
    tasks = tasks.filter((x) => x.id !== id);
  }

  save();
  render();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter || "all";
    filterButtons.forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

if (clearCompletedBtn) {
  clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.done);
    save();
    render();
  });
}

render();
