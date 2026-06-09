import { useState, useRef, useEffect } from "react";
import { generateWorkspaceId } from "../utils/storage";

export default function WorkspaceSelector({
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  setWorkspaces,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  const handleCreate = () => {
    const name = window.prompt("Enter new workspace name:");
    if (name && name.trim()) {
      const newId = generateWorkspaceId();
      setWorkspaces((prev) => [...prev, { id: newId, name: name.trim() }]);
      setActiveWorkspaceId(newId);
      setIsOpen(false);
    }
  };

  const handleRename = (e, id) => {
    e.stopPropagation(); // prevent selecting the workspace
    const workspace = workspaces.find((w) => w.id === id);
    if (!workspace) return;
    const newName = window.prompt("Enter new name for workspace:", workspace.name);
    if (newName && newName.trim()) {
      setWorkspaces((prev) =>
        prev.map((w) => (w.id === id ? { ...w, name: newName.trim() } : w))
      );
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // prevent selecting
    if (workspaces.length === 1) {
      alert("Cannot delete the last workspace.");
      return;
    }
    const workspace = workspaces.find((w) => w.id === id);
    if (!workspace) return;
    const confirm = window.confirm(`Are you sure you want to delete workspace "${workspace.name}"?`);
    if (confirm) {
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      if (activeWorkspaceId === id) {
        setActiveWorkspaceId(workspaces.find((w) => w.id !== id).id);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl liquid-glass-panel border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-all shadow-lg"
      >
        <span className="text-xl drop-shadow-md">📁</span>
        <span className="font-bold text-[var(--color-text-primary)] tracking-wide">
          {activeWorkspace?.name || "Workspace"}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 w-72 liquid-glass border border-[var(--color-border-subtle)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]">
          <div className="p-2 flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => {
                  setActiveWorkspaceId(ws.id);
                  setIsOpen(false);
                }}
                className={`
                  group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                  ${activeWorkspaceId === ws.id 
                    ? "bg-[rgba(255,255,255,0.15)] shadow-inner border border-[rgba(255,255,255,0.05)]" 
                    : "hover:bg-[rgba(255,255,255,0.05)] border border-transparent"}
                `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full ${activeWorkspaceId === ws.id ? 'bg-[var(--color-accent-emerald)] shadow-[0_0_10px_var(--color-accent-emerald)]' : 'bg-transparent'}`} />
                  <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[140px]" title={ws.name}>
                    {ws.name}
                  </span>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleRename(e, ws.id)}
                    className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:text-white transition-colors"
                    title="Rename Workspace"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, ws.id)}
                    className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] transition-colors"
                    title="Delete Workspace"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.2)]">
            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--color-accent-purple)]/20 to-[var(--color-accent-blue)]/20 hover:from-[var(--color-accent-purple)]/30 hover:to-[var(--color-accent-blue)]/30 transition-all border border-[var(--color-accent-purple)]/30 font-bold text-white shadow-lg hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              <span className="text-xl leading-none">+</span> 
              <span>Create Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
