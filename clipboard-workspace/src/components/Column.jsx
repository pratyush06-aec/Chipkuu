import { useState, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  const [isSpread, setIsSpread] = useState(false);
  const containerRef = useRef(null);
  
  // Only enable dropping when it is spread out or if there are no cards
  const canDrop = isSpread || cards.length === 0;

  const { setNodeRef, isOver } = useDroppable({ 
    id,
    disabled: !canDrop 
  });

  const cardIds = cards.map((c) => c.id);

  // Animate the entrance of the column itself
  useGSAP(() => {
    gsap.from(containerRef.current, {
      x: -40,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    });
  }, [id]);

  const handleToggleSpread = () => {
    if (cards.length > 0) {
      setIsSpread(!isSpread);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col min-w-[420px] max-w-[500px] flex-1
        rounded-[2rem] overflow-hidden
        liquid-glass-panel
        border border-[var(--color-border-subtle)]
        transition-all duration-300
        ${isOver && canDrop ? "border-[var(--color-border-accent)] shadow-[0_0_20px_rgba(139,92,246,0.2)] bg-[rgba(255,255,255,0.05)]" : ""}
      `}
    >
      {/* Column Header */}
      <div 
        className="flex items-center justify-between px-10 py-10 border-b border-[var(--color-border-subtle)] cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
        onClick={handleToggleSpread}
      >
        <div className="flex items-center gap-6">
          <div
            className="w-5 h-5 rounded-full shadow-[0_0_15px_currentColor]"
            style={{ backgroundColor: config.color, color: config.color }}
          />
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-[0.2em] uppercase drop-shadow-lg">
            {config.icon} {config.label}
          </h2>
        </div>
        
        <div className="flex items-center gap-6">
          {cards.length > 0 && (
            <span className="text-base font-bold text-[var(--color-text-muted)] tracking-[0.3em]">
              {isSpread ? "SPREAD" : "STACKED"}
            </span>
          )}
          <div className="bg-[rgba(255,255,255,0.1)] px-5 py-2 rounded-full text-base font-extrabold min-w-[48px] text-center border border-[rgba(255,255,255,0.05)] shadow-inner text-[var(--color-text-primary)]">
            {cards.length}
          </div>
        </div>
      </div>

      {/* Cards Area */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 overflow-y-auto px-10 py-10
          transition-colors duration-200
          relative
          ${isOver && canDrop ? "bg-[var(--color-bg-glass-hover)]" : ""}
          ${!isSpread && cards.length > 0 ? "overflow-hidden" : "space-y-4"}
        `}
      >
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center px-4">
            <span className="text-7xl mb-6 opacity-20 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{config.icon}</span>
            <p className="text-lg font-medium text-[var(--color-text-muted)] leading-relaxed max-w-[280px]">
              {config.emptyText}
            </p>
          </div>
        ) : (
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            <div className={!isSpread ? "relative w-full h-[180px] cursor-pointer" : "relative w-full h-full"} onClick={!isSpread ? handleToggleSpread : undefined}>
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  index={index}
                  total={cards.length}
                  isSpread={isSpread}
                  onDelete={onDeleteCard}
                  onCopy={onCopyCard}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
