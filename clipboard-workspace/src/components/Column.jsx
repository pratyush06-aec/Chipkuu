import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Card from "./Card";

const columnConfig = {
  inbox: {
    label: "Inbox",
    icon: "📥",
    color: "var(--color-col-inbox)",
    emptyText: "Drop items here or save from the extension",
  },
  links: {
    label: "Links",
    icon: "🔗",
    color: "var(--color-col-links)",
    emptyText: "Drag links here to organize",
  },
  images: {
    label: "Images",
    icon: "🖼️",
    color: "var(--color-col-images)",
    emptyText: "Drag images here to organize",
  },
  text: {
    label: "Text",
    icon: "📝",
    color: "var(--color-col-text)",
    emptyText: "Drag text snippets here",
  },
  audio: {
    label: "Audio",
    icon: "🎵",
    color: "var(--color-col-audio)",
    emptyText: "Drag audio items here",
  },
};

export default function Column({ id, cards, onDeleteCard, onCopyCard }) {
  const config = columnConfig[id];

  const { setNodeRef, isOver } = useDroppable({ id });

  const cardIds = cards.map((c) => c.id);

  return (
    <div
      className={`
        flex flex-col min-w-[260px] max-w-[320px] flex-1
        rounded-2xl overflow-hidden
        bg-[var(--color-bg-glass)]
        border border-[var(--color-border-subtle)]
        transition-all duration-300
        ${isOver ? "border-[var(--color-border-accent)] shadow-lg shadow-purple-500/5" : ""}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] tracking-wide">
            {config.icon} {config.label}
          </h2>
        </div>
        <span className="text-xs text-[var(--color-text-muted)] font-medium tabular-nums bg-[var(--color-bg-secondary)] px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 overflow-y-auto p-2.5 space-y-2.5
          transition-colors duration-200
          ${isOver ? "bg-[var(--color-bg-glass-hover)]" : ""}
        `}
        style={{ minHeight: "120px" }}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-center px-4">
              <span className="text-2xl mb-2 opacity-30">{config.icon}</span>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {config.emptyText}
              </p>
            </div>
          ) : (
            cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onDelete={onDeleteCard}
                onCopy={onCopyCard}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
