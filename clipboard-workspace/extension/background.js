/**
 * Background Service Worker — Clipboard Workspace Extension
 *
 * Handles:
 * - Messages from the content script (auto-captured copies)
 * - Context menu for saving images
 * - Badge flash notifications
 * - Auto-capture toggle state
 */

const STORAGE_KEY = "clipboard-workspace-cards";
const TOGGLE_KEY = "clipboard-workspace-enabled";

function generateId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save a card to chrome.storage.local.
 */
function saveCard(card) {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const cards = result[STORAGE_KEY] || [];
      cards.unshift(card);
      chrome.storage.local.set({ [STORAGE_KEY]: cards }, () => {
        resolve(cards.length);
      });
    });
  });
}

/**
 * Flash a badge on the extension icon for visual feedback.
 */
async function flashBadge(text = "✓", color = "#10b981") {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });

  setTimeout(async () => {
    await chrome.action.setBadgeText({ text: "" });
  }, 1500);
}

/**
 * Check if auto-capture is enabled.
 */
function isEnabled() {
  return new Promise((resolve) => {
    chrome.storage.local.get([TOGGLE_KEY], (result) => {
      // Default to enabled
      resolve(result[TOGGLE_KEY] !== false);
    });
  });
}

// ──────────────────────────────────
// Context Menu — "Save Image to Workspace"
// ──────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-image-to-workspace",
    title: "Save Image to Workspace",
    contexts: ["image"],
  });

  chrome.contextMenus.create({
    id: "save-link-to-workspace",
    title: "Save Link to Workspace",
    contexts: ["link"],
  });

  // Initialize toggle state (enabled by default)
  chrome.storage.local.get([TOGGLE_KEY], (result) => {
    if (result[TOGGLE_KEY] === undefined) {
      chrome.storage.local.set({ [TOGGLE_KEY]: true });
    }
  });

  console.log("Clipboard Workspace extension installed.");
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const enabled = await isEnabled();
  if (!enabled) return;

  let card = null;

  if (info.menuItemId === "save-image-to-workspace" && info.srcUrl) {
    const data = await chrome.storage.local.get(["clipboard-active-workspace"]);
    const activeWorkspaceId = data["clipboard-active-workspace"] || "default";

    card = {
      id: generateId(),
      type: "image",
      content: info.srcUrl,
      title: info.srcUrl.split("/").pop().split("?")[0] || "Image",
      section: "inbox",
      workspaceId: activeWorkspaceId,
      createdAt: Date.now(),
    };
  }

  if (info.menuItemId === "save-link-to-workspace" && info.linkUrl) {
    const data = await chrome.storage.local.get(["clipboard-active-workspace"]);
    const activeWorkspaceId = data["clipboard-active-workspace"] || "default";

    card = {
      id: generateId(),
      type: "link",
      content: info.linkUrl,
      title: info.selectionText || info.linkUrl,
      section: "inbox",
      workspaceId: activeWorkspaceId,
      createdAt: Date.now(),
    };
  }

  if (card) {
    await saveCard(card);
    flashBadge();
  }
});

// ──────────────────────────────────
// Message Handler — Content Script
// ──────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "save-card") {
    (async () => {
      const enabled = await isEnabled();
      if (!enabled) {
        sendResponse({ success: false, reason: "disabled" });
        return;
      }

      const data = await chrome.storage.local.get(["clipboard-active-workspace"]);
      const activeWorkspaceId = data["clipboard-active-workspace"] || "default";

      const card = {
        id: generateId(),
        type: message.type || "text",
        content: message.content,
        title: message.title || message.content.slice(0, 60),
        section: "inbox",
        workspaceId: activeWorkspaceId,
        createdAt: Date.now(),
      };

      const count = await saveCard(card);
      flashBadge();
      sendResponse({ success: true, count });
    })();

    // Return true to indicate async response
    return true;
  }

  if (message.action === "get-toggle") {
    isEnabled().then((enabled) => {
      sendResponse({ enabled });
    });
    return true;
  }

  if (message.action === "set-toggle") {
    chrome.storage.local.set({ [TOGGLE_KEY]: message.enabled }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
