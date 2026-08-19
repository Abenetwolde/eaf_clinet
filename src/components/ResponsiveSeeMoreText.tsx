import React, { useState } from 'react';

interface ResponsiveSeeMoreTextProps {
  text: string;
  maxLength?: number;
  lines?: number;
  className?: string;
  style?: React.CSSProperties;
  buttonClassName?: string;
  buttonStyle?: React.CSSProperties;
}

const LINE_CLAMP_CLASSES = [
  'line-clamp-1',
  'line-clamp-2',
  'line-clamp-3',
  'line-clamp-4',
  'line-clamp-5',
  'line-clamp-6',
];

export function ResponsiveSeeMoreText({
  text,
  maxLength = 160,
  lines = 3,
  className = '',
  style = {},
  buttonClassName = '',
  buttonStyle = {},
}: ResponsiveSeeMoreTextProps) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  // Text fits comfortably: show the full content without any toggle.
  if (text.length <= maxLength) {
    return <p className={className} style={style}>{text}</p>;
  }

  const clampClass = LINE_CLAMP_CLASSES[Math.max(0, Math.min(lines - 1, LINE_CLAMP_CLASSES.length - 1))];

  return (
    <div className={className} style={style}>
      {/* Desktop & wide screens (> 1185px): display full text without toggle */}
      <span className="hidden min-[1186px]:inline">{text}</span>

      {/* Small & tablet screens (<= 1185px): clamp overflowing text with See more / See less */}
      <span className="inline min-[1186px]:hidden">
        <span className={expanded ? 'line-clamp-none' : clampClass}>{text}</span>{' '}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`text-primary font-bold text-xs underline cursor-pointer ml-1 inline-block bg-transparent border-0 p-0 ${buttonClassName}`}
          style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'underline', ...buttonStyle }}
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      </span>
    </div>
  );
}

export default ResponsiveSeeMoreText;