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
    });
  });
}

// Initialize popup
document.addEventListener("DOMContentLoaded", () => {
  updateItemCount();

  // Show current URL
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      document.getElementById("page-url").textContent = tab.url;
    }
  });

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

  // Save Text button
  document.getElementById("save-text").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) {
        showStatus("No active tab found", "error");
        return;
      }

      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => window.getSelection().toString(),
        },
        (results) => {
          const selectedText = results?.[0]?.result;
          if (!selectedText || selectedText.trim() === "") {
            showStatus("No text selected on the page", "error");
            return;
          }

          const card = {
            id: generateId(),
            type: "text",
            content: selectedText.trim(),
            title: selectedText.trim().slice(0, 50) + (selectedText.length > 50 ? "..." : ""),
            section: "inbox",
            createdAt: Date.now(),
          };

          saveCard(card);
        }
      );
    });
  });
});
