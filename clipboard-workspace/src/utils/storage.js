const STORAGE_KEY = "clipboard-workspace-cards";
const WORKSPACE_STORAGE_KEY = "clipboard-workspaces";

/**
 * Detects whether we're running inside a Chrome extension context.
 */
function isExtensionContext() {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined"
  );
}

/**
 * Load cards from storage.
 * Returns a promise that resolves to the cards array.
 */
export async function loadItems() {
  if (isExtensionContext()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || null);
      });
    });
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Save cards to storage.
 * Returns a promise that resolves when save completes.
 */
export async function saveItems(cards) {
  if (isExtensionContext()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: cards }, resolve);
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

/**
 * Load workspaces from storage.
 */
export async function loadWorkspaces() {
  if (isExtensionContext()) {
    return new Promise((resolve) => {
      chrome.storage.local.get([WORKSPACE_STORAGE_KEY], (result) => {
        resolve(result[WORKSPACE_STORAGE_KEY] || null);
      });
    });
  }

  const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/**
 * Save workspaces to storage.
 */
export async function saveWorkspaces(workspaces) {
  if (isExtensionContext()) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [WORKSPACE_STORAGE_KEY]: workspaces }, resolve);
    });
  }

  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaces));
}

/**
 * Generate a unique card ID.
 */
export function generateId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateWorkspaceId() {
  return `workspace-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
