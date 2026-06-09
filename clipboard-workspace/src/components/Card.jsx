import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const typeConfig = {
  link: {
    icon: "🔗",
    label: "Link",
    gradient: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-400",
  },
  text: {
    icon: "📝",
    label: "Text",
    gradient: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    badge: "bg-amber-500/15 text-amber-400",
  },
  image: {
    icon: "🖼️",
    label: "Image",
    gradient: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  audio: {
    icon: "🎵",
    label: "Audio",
    gradient: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-500/20",
    badge: "bg-rose-500/15 text-rose-400",
  },
};

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatExactDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function CardContent({ card }) {
  const { type, content, title } = card;

  switch (type) {
    case "link":
      return (
        <div className="space-y-3 pointer-events-none">
          <p className="text-lg font-medium text-[var(--color-text-primary)] truncate">
            {title || content}
          </p>
          <p className="text-sm text-[var(--color-accent-blue)] truncate">
            {content}
          </p>
        </div>
      );

    case "text":
      return (
        <div className="space-y-3 pointer-events-none">
          {title && (
            <p className="text-lg font-medium text-[var(--color-text-primary)] truncate">
              {title}
            </p>
          )}
          <p className="text-base text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-4 pointer-events-none">
          <div className="w-full h-36 rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] relative">
            <img
              src={content}
              alt={title || "Image"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center text-2xl opacity-40">🖼️</div>';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          </div>
          {title && (
            <p className="text-sm text-[var(--color-text-secondary)] truncate">
              {title}
            </p>
          )}
        </div>
      );

    case "audio":
      return (
        <div className="space-y-4 pointer-events-none">
          <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)]">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-1 items-end h-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-rose-400/40 rounded-full"
                    style={{
                      height: `${20 + (i * 37) % 80}%`,
                      minHeight: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          {title && (
            <p className="text-sm text-[var(--color-text-secondary)] truncate">
              {title}
            </p>
          )}
        </div>
      );

    default:
      return (
        <p className="text-base text-[var(--color-text-secondary)] pointer-events-none">{content}</p>
      );
  }
}

export default function Card({ card, onDelete, onCopy, isSpread = true, index = 0, total = 1, isOverlay = false }) {
  const config = typeConfig[card.type] || typeConfig.text;
  const innerRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  useGSAP(() => {
    if (isOverlay) return;

    if (!isSpread) {
      // Stacked pile animation
      gsap.to(innerRef.current, {
        y: index * 12,
        scale: Math.max(0.8, 1 - (index * 0.05)),
        opacity: Math.max(0, 1 - (index * 0.15)),
        duration: 0.6,
        ease: "power3.out",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8)",
        delay: index * 0.02
      });
    } else {
      // Spread out into vertical list
      gsap.to(innerRef.current, {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: "back.out(1.2)",
        boxShadow: "0 4px 24px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.08)",
        delay: index * 0.03
      });
    }
  }, [isSpread, index]);

  // Entrance animation for newly mounted cards when spread
  useGSAP(() => {
    if (isOverlay) return;
    if (isSpread) {
      gsap.from(innerRef.current, {
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "back.out(1.5)",
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (isDragging || !isSpread) return;
    gsap.to(innerRef.current, {
      scale: 1.01,
      y: -8,
      boxShadow: "0 15px 35px -5px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.15)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    if (isDragging || !isSpread) return;
    gsap.to(innerRef.current, {
      scale: 1,
      y: 0,
      boxShadow: "0 4px 24px -2px rgba(0,0,0,0.4), inset 0 1px 0 0 rgba(255,255,255,0.08)",
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handlePointerDown = () => {
    if (!isSpread) return;
    gsap.to(innerRef.current, {
      scale: 0.98,
      duration: 0.1,
      ease: "power1.inOut"
    });
  };

  const handlePointerUp = () => {
    if (!isSpread) return;
    gsap.to(innerRef.current, {
      scale: isDragging ? 1 : 1.01,
      duration: 0.2,
      ease: "back.out(2)"
    });
  };

  // When stacked, we position absolutely to form a pile.
  const outerStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isOverlay ? 50 : (total - index),
    position: !isSpread ? "absolute" : "relative",
    top: 0,
    left: 0,
    width: "100%",
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    const copyText = `${card.content}\n\n[Captured: ${formatExactDate(card.createdAt)}]`;
    try {
      await navigator.clipboard.writeText(copyText);
      if (onCopy) onCopy(card.id);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = copyText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      if (onCopy) onCopy(card.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(card.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={outerStyle}
      {...(isSpread ? attributes : {})}
      {...(isSpread ? listeners : {})}
      className={`w-full outline-none ${isSpread ? "cursor-grab active:cursor-grabbing mb-6" : ""}`}
      onPointerDown={(e) => {
        handlePointerDown();
        if (isSpread && listeners && listeners.onPointerDown) listeners.onPointerDown(e);
      }}
      onPointerUp={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={innerRef}
        className={`
          group relative rounded-[2rem] p-10
          liquid-glass-card
          bg-gradient-to-br ${config.gradient}
          border ${config.border}
          w-full
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pointer-events-none">
          <span
            className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-base font-extrabold tracking-widest shadow-md border border-[rgba(255,255,255,0.1)] uppercase ${config.badge}`}
          >
            <span className="text-xl">{config.icon}</span>
            {config.label}
          </span>
          <span className="text-sm font-bold tracking-wider text-[var(--color-text-muted)]">
            {formatTime(card.createdAt)}
          </span>
        </div>

        {/* Content */}
        <CardContent card={card} />

        {/* Timestamp Footer */}
        <div className="mt-8 space-y-1 pointer-events-none">
          <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide">Captured:</p>
          <p className="text-sm font-mono text-[var(--color-text-secondary)]">
            {formatExactDate(card.createdAt)}
          </p>
        </div>

        {/* Actions — visible on hover */}
        {isSpread && (
          <div className="absolute top-10 right-10 flex gap-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleCopy}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-4 rounded-2xl bg-[#1a1a27]/90 border border-[var(--color-border-subtle)] 
                        hover:bg-[var(--color-accent-blue)]/20 hover:border-[var(--color-accent-blue)]/30
                        transition-all duration-150 backdrop-blur-md shadow-xl hover:shadow-2xl hover:-translate-y-1"
              title="Copy to clipboard"
            >
              <svg className="w-6 h-6 text-[var(--color-text-secondary)] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-4 rounded-2xl bg-[#1a1a27]/90 border border-[var(--color-border-subtle)]
                        hover:bg-[var(--color-accent-rose)]/20 hover:border-[var(--color-accent-rose)]/30
                        transition-all duration-150 backdrop-blur-md shadow-xl hover:shadow-2xl hover:-translate-y-1"
              title="Delete card"
            >
              <svg className="w-6 h-6 text-[var(--color-text-secondary)] hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
