// Background service worker for Clipboard Workspace extension
// Currently minimal — can be extended for context menus, keyboard shortcuts, etc.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Clipboard Workspace extension installed.");
});
