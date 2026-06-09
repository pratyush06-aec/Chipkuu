import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import Column from "./Column";
import Card from "./Card";
import WorkspaceSelector from "./WorkspaceSelector";

const SIDEBAR_SECTIONS = [
  { key: "links", label: "Links", icon: "🔗", color: "var(--color-col-links)" },
  { key: "images", label: "Images", icon: "🖼️", color: "var(--color-col-images)" },
  { key: "text", label: "Text", icon: "📝", color: "var(--color-col-text)" },
  { key: "audio", label: "Audio", icon: "🎵", color: "var(--color-col-audio)" },
];

export default function Board({ 
  cards, 
  setCards, 
  workspaces,
  activeWorkspaceId,
  setActiveWorkspaceId,
  setWorkspaces,
  onDeleteCard, 
  onCopyCard 
}) {
  const [activeId, setActiveId] = useState(null);
  const [openSection, setOpenSection] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const cardsBySection = useMemo(() => {
    const grouped = { inbox: [], links: [], images: [], text: [], audio: [] };
    cards.forEach((c) => {
      if (grouped[c.section]) grouped[c.section].push(c);
    });
    return grouped;
  }, [cards]);

  const activeCard = activeId ? cards.find((c) => c.id === activeId) : null;

  function findSection(id) {
    if (["inbox", "links", "images", "text", "audio"].includes(id)) return id;
    const card = cards.find((c) => c.id === id);
    return card?.section;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeSection = findSection(active.id);
    const overSection = findSection(over.id);

    if (!activeSection || !overSection || activeSection === overSection) return;

    setCards((prev) =>
      prev.map((card) =>
        card.id === active.id ? { ...card, section: overSection } : card
      )
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const overSection = findSection(over.id);
    if (!overSection) return;

    setCards((prev) =>
      prev.map((card) =>
        card.id === active.id ? { ...card, section: overSection } : card
      )
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Bar */}
      <header className="flex-shrink-0 px-10 md:px-16 py-6 border-b border-[var(--color-border-subtle)] liquid-glass z-50 relative">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-6">
            <WorkspaceSelector 
              workspaces={workspaces}
              activeWorkspaceId={activeWorkspaceId}
              setActiveWorkspaceId={setActiveWorkspaceId}
              setWorkspaces={setWorkspaces}
            />
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Navigation */}
        <div className="w-48 md:w-56 flex-shrink-0 border-r border-[var(--color-border-subtle)] liquid-glass-panel flex flex-col items-center py-12 gap-6 z-10 relative overflow-y-auto custom-scrollbar">
          {SIDEBAR_SECTIONS.map((sec) => (
            <button
              key={sec.key}
              onClick={() => setOpenSection(openSection === sec.key ? null : sec.key)}
              className={`
                group relative flex flex-col items-center justify-center gap-3 px-4 py-4 rounded-3xl w-[85%]
                transition-all duration-300
                ${openSection === sec.key 
                  ? "bg-[rgba(255,255,255,0.1)] shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.2)]" 
                  : "hover:bg-[rgba(255,255,255,0.05)] border border-transparent"}
              `}
              title={sec.label}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">{sec.icon}</span>
              <span className="text-sm font-bold tracking-widest uppercase">{sec.label}</span>
              
              {/* Count badge */}
              {cardsBySection[sec.key].length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center text-xs font-bold bg-[#1a1a27] border border-[var(--color-border-subtle)] rounded-full shadow-md">
                  {cardsBySection[sec.key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Boards Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-10 flex justify-start lg:justify-center">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-8 h-full max-w-5xl w-full">
              {/* Inbox is ALWAYS visible */}
              <Column
                id="inbox"
                cards={cardsBySection["inbox"]}
                onDeleteCard={onDeleteCard}
                onCopyCard={onCopyCard}
              />
              
              {/* Dynamically visible section */}
              {openSection && (
                <Column
                  key={openSection}
                  id={openSection}
                  cards={cardsBySection[openSection]}
                  onDeleteCard={onDeleteCard}
                  onCopyCard={onCopyCard}
                />
              )}
            </div>

            <DragOverlay>
              {activeCard ? (
                <div className="drag-overlay w-[300px]">
                  <Card card={activeCard} isOverlay={true} index={0} isSpread={true} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
