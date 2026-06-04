const STORAGE_KEY = "clipboard-workspace-cards";

function generateId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function showStatus(message, type = "success") {
  const el = document.getElementById("status");
  el.textContent = message;
  el.className = `status ${type}`;
  setTimeout(() => {
    el.className = "status hidden";
  }, 2500);
}

function updateItemCount() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const cards = result[STORAGE_KEY] || [];
    document.getElementById("item-count").textContent = cards.length;
  });
}

function saveCard(card) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const cards = result[STORAGE_KEY] || [];
    cards.unshift(card);
    chrome.storage.local.set({ [STORAGE_KEY]: cards }, () => {
      showStatus("✓ Saved to Inbox!", "success");
      updateItemCount();
      renderRecentCaptures();
    });
  });
}

// ──────────────────────────────────
// Recent Captures
// ──────────────────────────────────

const TYPE_ICONS = {
  link: "🔗",
  text: "📝",
  image: "🖼️",
  audio: "🎵",
};

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function renderRecentCaptures() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const cards = result[STORAGE_KEY] || [];
    const container = document.getElementById("recent-captures");

    if (cards.length === 0) {
      container.innerHTML = '<div class="recent-empty">No captures yet</div>';
      return;
    }

    // Show last 5
    const recent = cards.slice(0, 5);
    container.innerHTML = recent
      .map(
        (card) => `
      <div class="recent-item">
        <span class="recent-icon">${TYPE_ICONS[card.type] || "📄"}</span>
        <div class="recent-content">
          <span class="recent-title">${escapeHtml(card.title || card.content.slice(0, 40))}</span>
          <span class="recent-time">${formatTimeAgo(card.createdAt)}</span>
        </div>
      </div>
    `
      )
      .join("");
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ──────────────────────────────────
// Toggle
// ──────────────────────────────────

function initToggle() {
  const checkbox = document.getElementById("toggle-capture");
  const statusText = document.getElementById("status-text");

  // Get current state from background
  chrome.runtime.sendMessage({ action: "get-toggle" }, (response) => {
    if (chrome.runtime.lastError) return;
    const enabled = response?.enabled !== false;
    checkbox.checked = enabled;
    updateToggleUI(enabled);
  });

  // Handle toggle change
  checkbox.addEventListener("change", () => {
    const enabled = checkbox.checked;
    chrome.runtime.sendMessage({ action: "set-toggle", enabled }, () => {
      updateToggleUI(enabled);
    });
  });

  function updateToggleUI(enabled) {
    statusText.textContent = enabled ? "active" : "paused";
    statusText.className = enabled ? "status-on" : "status-off";
  }
}

// ──────────────────────────────────
// Init
// ──────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  updateItemCount();
  renderRecentCaptures();
  initToggle();

  // Save Link button
  document.getElementById("save-link").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        showStatus("No active tab found", "error");
        return;
      }

      const card = {
        id: generateId(),
        type: "link",
        content: tab.url,
        title: tab.title || tab.url,
        section: "inbox",
        createdAt: Date.now(),
      };

      saveCard(card);
    });
  });
});
