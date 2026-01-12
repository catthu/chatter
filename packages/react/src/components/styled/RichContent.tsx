import React from 'react';
import type { ContentBlock } from '@chatter/core';

export interface RichContentProps {
  /** Content blocks to render */
  blocks: ContentBlock[];
  /** Whether content is currently streaming */
  isStreaming?: boolean;
  /** Expanded state for collapsible blocks (controlled) */
  expandedState?: Record<string, boolean>;
  /** Toggle callback for collapsible blocks */
  onToggle?: (key: string) => void;
  /** Custom class name */
  className?: string;
  /** Custom block renderer registry */
  blockRenderers?: Record<string, React.ComponentType<BlockRendererProps>>;
}

export interface BlockRendererProps {
  block: ContentBlock;
  index: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

/**
 * Default text block renderer
 */
function TextBlock({ block }: BlockRendererProps) {
  return (
    <div className="chatter-block text">
      <p>{block.content}</p>
    </div>
  );
}

/**
 * Default code block renderer
 */
function CodeBlock({ block, isExpanded, onToggle }: BlockRendererProps) {
  const lines = block.content?.split('\n') || [];
  const isLong = lines.length > 10;

  return (
    <div className="chatter-block code">
      {block.language && (
        <div className="chatter-code-header">
          <span className="chatter-code-language">{block.language}</span>
          {isLong && (
            <button
              className="chatter-code-toggle"
              onClick={onToggle}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>
      )}
      <pre className={isLong && !isExpanded ? 'collapsed' : ''}>
        <code>{block.content}</code>
      </pre>
    </div>
  );
}

/**
 * Default image block renderer
 */
function ImageBlock({ block }: BlockRendererProps) {
  return (
    <div className="chatter-block image">
      <img
        src={block.url}
        alt={block.alt || 'Image'}
        loading="lazy"
      />
      {block.alt && <span className="chatter-image-caption">{block.alt}</span>}
    </div>
  );
}

/**
 * Streaming indicator for in-progress content
 */
function StreamingIndicator() {
  return (
    <div className="chatter-streaming-indicator">
      <span className="chatter-streaming-dot" />
      <span className="chatter-streaming-dot" />
      <span className="chatter-streaming-dot" />
    </div>
  );
}

/**
 * Default block renderers by type
 */
const DEFAULT_RENDERERS: Record<string, React.ComponentType<BlockRendererProps>> = {
  text: TextBlock,
  code: CodeBlock,
  image: ImageBlock,
};

/**
 * Rich content component for rendering multiple content blocks.
 * Supports text, code, images, and custom block types.
 */
export function RichContent({
  blocks,
  isStreaming = false,
  expandedState,
  onToggle,
  className = '',
  blockRenderers = {},
}: RichContentProps) {
  const renderers = { ...DEFAULT_RENDERERS, ...blockRenderers };

  return (
    <div className={`chatter-rich-content ${className}`}>
      {blocks.map((block, index) => {
        const Renderer = renderers[block.type] || TextBlock;
        const key = `block-${index}-${block.type}`;
        const isExpanded = expandedState?.[key] ?? true;

        return (
          <Renderer
            key={key}
            block={block}
            index={index}
            isExpanded={isExpanded}
            onToggle={() => onToggle?.(key)}
          />
        );
      })}

      {isStreaming && <StreamingIndicator />}
    </div>
  );
}

export default RichContent;
