import { useState, useEffect, useCallback, useRef } from "react";
import Board from "./components/Board";
import LandingScreen from "./components/LandingScreen";
import AnimatedBackground from "./components/AnimatedBackground";
import { loadItems, saveItems, loadWorkspaces, saveWorkspaces, loadActiveWorkspace, saveActiveWorkspace, generateWorkspaceId } from "./utils/storage";
import { dummyData } from "./data/dummyData";
import "./index.css";

export default function App() {
  const [cards, setCards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("default");
  
  const [loaded, setLoaded] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeout = useRef(null);

  // Load cards and workspaces on mount
  useEffect(() => {
    async function init() {
      // Load workspaces
      const storedWorkspaces = await loadWorkspaces();
      if (storedWorkspaces && storedWorkspaces.length > 0) {
        setWorkspaces(storedWorkspaces);
      } else {
        const defaultWorkspaces = [{ id: "default", name: "Default Workspace" }];
        setWorkspaces(defaultWorkspaces);
        await saveWorkspaces(defaultWorkspaces);
      }

      // Load active workspace
      const storedWorkspaceId = await loadActiveWorkspace();
      setActiveWorkspaceId(storedWorkspaceId);

      // Load cards
      const stored = await loadItems();
      if (Array.isArray(stored)) {
        // Ensure all stored cards have a workspaceId
        const migratedCards = stored.map(c => ({
          ...c,
          workspaceId: c.workspaceId || "default"
        }));
        setCards(migratedCards);
      } else {
        setCards(dummyData);
        await saveItems(dummyData);
      }
      setLoaded(true);
    }
    init();
  }, []);

  // Persist cards whenever they change (after initial load)
  useEffect(() => {
    if (loaded) {
      saveItems(cards);
    }
  }, [cards, loaded]);

  // Persist workspaces whenever they change
  useEffect(() => {
    if (loaded) {
      saveWorkspaces(workspaces);
    }
  }, [workspaces, loaded]);

  // Persist active workspace whenever it changes
  useEffect(() => {
    if (loaded) {
      saveActiveWorkspace(activeWorkspaceId);
    }
  }, [activeWorkspaceId, loaded]);

  // Live Sync: Listen for items added by the background script so they appear instantly
  useEffect(() => {
    if (loaded && typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      const handleStorageChange = (changes, area) => {
        if (area === "local" && changes["clipboard-workspace-cards"]) {
          const newCards = changes["clipboard-workspace-cards"].newValue || [];
          
          setCards(prev => {
            // Only update if there's an actual difference to avoid infinite loops with saveItems
            if (JSON.stringify(prev) !== JSON.stringify(newCards)) {
              return newCards;
            }
            return prev;
          });
        }
      };
      
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [loaded]);

  const showToast = useCallback((message, type = "info") => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ message, type });
    toastTimeout.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const handleDelete = useCallback(
    (id) => {
      setCards((prev) => prev.filter((c) => c.id !== id));
      showToast("Card deleted", "delete");
    },
    [showToast]
  );

  const handleCopy = useCallback(
    () => {
      showToast("Copied to clipboard", "copy");
    },
    [showToast]
  );

  const activeWorkspaceCards = cards.filter(c => c.workspaceId === activeWorkspaceId);

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-blue)] flex items-center justify-center text-lg animate-pulse">
            📋
          </div>
          <p className="text-sm text-[var(--color-text-muted)]">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative overflow-hidden text-[var(--color-text-primary)]">
      <AnimatedBackground />
      
      {!isVisualizing ? (
        <LandingScreen onVisualize={() => setIsVisualizing(true)} />
      ) : (
        <div className="h-full w-full animate-[fadeIn_0.8s_ease-out]">
          <Board
            cards={activeWorkspaceCards}
            setCards={setCards}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            setActiveWorkspaceId={setActiveWorkspaceId}
            setWorkspaces={setWorkspaces}
            onDeleteCard={handleDelete}
            onCopyCard={handleCopy}
          />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            px-4 py-2.5 rounded-xl text-sm font-medium
            border backdrop-blur-md shadow-xl
            animate-[fadeIn_0.2s_ease-out]
            ${
              toast.type === "delete"
                ? "bg-[var(--color-accent-rose)]/10 border-[var(--color-accent-rose)]/20 text-[var(--color-accent-rose)]"
                : toast.type === "copy"
                ? "bg-[var(--color-accent-emerald)]/10 border-[var(--color-accent-emerald)]/20 text-[var(--color-accent-emerald)]"
                : "bg-[var(--color-bg-card)] border-[var(--color-border-medium)] text-[var(--color-text-primary)]"
            }
          `}
        >
          {toast.type === "delete" && "🗑 "}
          {toast.type === "copy" && "📋 "}
          {toast.message}
        </div>
      )}
    </div>
  );
}
