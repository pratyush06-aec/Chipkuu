import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

function CardContent({ card }) {
  const { type, content, title } = card;

  switch (type) {
    case "link":
      return (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {title || content}
          </p>
          <p className="text-xs text-[var(--color-accent-blue)] truncate hover:underline">
            {content}
          </p>
        </div>
      );

    case "text":
      return (
        <div className="space-y-1.5">
          {title && (
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {title}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-1.5">
          <div className="w-full h-24 rounded-lg overflow-hidden bg-[var(--color-bg-secondary)]">
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
          </div>
          {title && (
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {title}
            </p>
          )}
        </div>
      );

    case "audio":
      return (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-bg-secondary)]">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex gap-0.5 items-end h-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-rose-400/40 rounded-full"
                    style={{
                      height: `${Math.random() * 100}%`,
                      minHeight: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          {title && (
            <p className="text-xs text-[var(--color-text-secondary)] truncate">
              {title}
            </p>
          )}
        </div>
      );

    default:
      return (
        <p className="text-sm text-[var(--color-text-secondary)]">{content}</p>
      );
  }
}

export default function Card({ card, onDelete, onCopy }) {
  const config = typeConfig[card.type] || typeConfig.text;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(card.content);
      if (onCopy) onCopy(card.id);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = card.content;
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
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative rounded-xl p-3.5
        bg-gradient-to-br ${config.gradient}
        border ${config.border}
        backdrop-blur-sm
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:border-[var(--color-border-medium)]
        hover:shadow-lg hover:shadow-black/20
        hover:-translate-y-0.5
        card-enter
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.badge}`}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {formatTime(card.createdAt)}
        </span>
      </div>

      {/* Content */}
      <CardContent card={card} />

      {/* Actions — visible on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={handleCopy}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border-subtle)] 
                     hover:bg-[var(--color-accent-blue)]/20 hover:border-[var(--color-accent-blue)]/30
                     transition-colors duration-150"
          title="Copy to clipboard"
        >
          <svg className="w-3 h-3 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-[var(--color-bg-secondary)]/80 border border-[var(--color-border-subtle)]
                     hover:bg-[var(--color-accent-rose)]/20 hover:border-[var(--color-accent-rose)]/30
                     transition-colors duration-150"
          title="Delete card"
        >
          <svg className="w-3 h-3 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
