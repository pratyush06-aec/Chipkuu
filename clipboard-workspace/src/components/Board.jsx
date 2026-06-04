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

const SECTIONS = ["inbox", "links", "images", "text", "audio"];

const FILTER_OPTIONS = [
  { key: "all", label: "All", icon: "✦" },
  { key: "link", label: "Links", icon: "🔗" },
  { key: "text", label: "Text", icon: "📝" },
  { key: "image", label: "Images", icon: "🖼️" },
  { key: "audio", label: "Audio", icon: "🎵" },
];

export default function Board({ cards, setCards, onDeleteCard, onCopyCard }) {
  const [activeId, setActiveId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Filter & search cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesFilter =
        activeFilter === "all" || card.type === activeFilter;
      const matchesSearch =
        searchQuery === "" ||
        (card.content || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.title || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [cards, activeFilter, searchQuery]);

  // Group cards by section
  const cardsBySection = useMemo(() => {
    const grouped = {};
    for (const section of SECTIONS) {
      grouped[section] = filteredCards.filter((c) => c.section === section);
    }
    return grouped;
  }, [filteredCards]);

  const activeCard = activeId
    ? cards.find((c) => c.id === activeId)
    : null;

  function findSection(id) {
    // Check if id is a section name
    if (SECTIONS.includes(id)) return id;
    // Find which section contains this card
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

  const totalCards = cards.length;
  const filteredCount = filteredCards.length;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-blue)] flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20">
              📋
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[var(--color-text-primary)]">
                Clipboard Workspace
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide">
                {filteredCount === totalCards
                  ? `${totalCards} items`
                  : `${filteredCount} of ${totalCards} items`}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl 
                           bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]
                           text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                           focus:outline-none focus:border-[var(--color-accent-purple)]/50
                           focus:ring-1 focus:ring-[var(--color-accent-purple)]/20
                           transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg
                  transition-all duration-200
                  ${
                    activeFilter === f.key
                      ? "bg-[var(--color-accent-purple)]/15 text-[var(--color-accent-purple)] border border-[var(--color-accent-purple)]/30"
                      : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-glass-hover)] border border-transparent"
                  }
                `}
              >
                <span className="mr-1">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 h-full min-w-max">
            {SECTIONS.map((section) => (
              <Column
                key={section}
                id={section}
                cards={cardsBySection[section]}
                onDeleteCard={onDeleteCard}
                onCopyCard={onCopyCard}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="drag-overlay">
                <Card card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
