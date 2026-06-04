/**
 * Content Script — Auto-Capture on Copy
 *
 * Injected into every page. Listens for native `copy` events and
 * sends the copied content to the background service worker.
 * Includes deduplication to prevent double-saves.
 */

const DEDUPE_WINDOW_MS = 2000;
let lastCaptured = { content: "", timestamp: 0 };

/**
 * Check if the selected text contains a URL.
 */
function extractUrl(text) {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}

/**
 * Try to find the anchor element the selection is inside.
 */
function getSelectedLink() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  let node = range.startContainer;

  // Walk up the DOM to find an anchor
  while (node && node !== document.body) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "A") {
      return { url: node.href, title: node.textContent.trim() };
    }
    node = node.parentNode;
  }

  return null;
}

/**
 * Check if this is a duplicate of the last capture.
 */
function isDuplicate(content) {
  const now = Date.now();
  if (
    content === lastCaptured.content &&
    now - lastCaptured.timestamp < DEDUPE_WINDOW_MS
  ) {
    return true;
  }
  lastCaptured = { content, timestamp: now };
  return false;
}

/**
 * Handle the copy event.
 */
document.addEventListener("copy", () => {
  // Use a small delay so the clipboard data is ready
  setTimeout(() => {
    const selection = window.getSelection();
    const selectedText = selection ? selection.toString().trim() : "";

    if (!selectedText) return;
    if (isDuplicate(selectedText)) return;

    // Determine card type: link or text
    const linkInfo = getSelectedLink();
    const extractedUrl = extractUrl(selectedText);

    let message;

    if (linkInfo) {
      // User copied text inside an <a> tag
      message = {
        action: "save-card",
        type: "link",
        content: linkInfo.url,
        title: linkInfo.title || linkInfo.url,
      };
    } else if (extractedUrl && selectedText === extractedUrl) {
      // The entire selection is a URL
      message = {
        action: "save-card",
        type: "link",
        content: extractedUrl,
        title: extractedUrl,
      };
    } else {
      // Plain text
      message = {
        action: "save-card",
        type: "text",
        content: selectedText,
        title:
          selectedText.slice(0, 60) + (selectedText.length > 60 ? "..." : ""),
      };
    }

    // Send to background service worker
    chrome.runtime.sendMessage(message).catch(() => {
      // Extension context may be invalidated — silently ignore
    });
  }, 50);
});
