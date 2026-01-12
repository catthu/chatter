import React, { useState, useCallback } from 'react';

export interface CollapsibleItem {
  /** Unique key for the item */
  key: string;
  /** Header/title content */
  header: React.ReactNode;
  /** Body content when expanded */
  body: React.ReactNode;
  /** Optional badge/count to show in header */
  badge?: string | number;
}

export interface CollapsibleSectionProps {
  /** Items to render in the section */
  items: CollapsibleItem[];
  /** Section title */
  title?: React.ReactNode;
  /** Whether the section is expanded (controlled) */
  expanded?: boolean;
  /** Toggle callback for section (controlled) */
  onToggle?: () => void;
  /** Default expanded state (uncontrolled) */
  defaultExpanded?: boolean;
  /** Individual item expanded state (controlled) */
  individualExpandedState?: Record<string, boolean>;
  /** Toggle callback for individual items (controlled) */
  onToggleIndividual?: (key: string) => void;
  /** Default expanded state for individual items (uncontrolled) */
  defaultIndividualExpanded?: boolean;
  /** Custom class name */
  className?: string;
  /** Whether to show expand all/collapse all buttons */
  showExpandAllControls?: boolean;
}

/**
 * Chevron icon component
 */
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`chatter-chevron ${expanded ? 'expanded' : ''}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

/**
 * Collapsible section component for grouping related content.
 * Supports multi-level collapsible control (section level and item level).
 */
export function CollapsibleSection({
  items,
  title,
  expanded: controlledExpanded,
  onToggle: controlledOnToggle,
  defaultExpanded = true,
  individualExpandedState,
  onToggleIndividual,
  defaultIndividualExpanded = false,
  className = '',
  showExpandAllControls = false,
}: CollapsibleSectionProps) {
  // Section-level expanded state (controlled or uncontrolled)
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const sectionExpanded = isControlled ? controlledExpanded : internalExpanded;

  const toggleSection = useCallback(() => {
    if (isControlled) {
      controlledOnToggle?.();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, controlledOnToggle]);

  // Item-level expanded state (controlled or uncontrolled)
  const [internalItemState, setInternalItemState] = useState<
    Record<string, boolean>
  >({});
  const isItemControlled = individualExpandedState !== undefined;

  const getItemExpanded = (key: string): boolean => {
    if (isItemControlled) {
      return individualExpandedState[key] ?? defaultIndividualExpanded;
    }
    return internalItemState[key] ?? defaultIndividualExpanded;
  };

  const toggleItem = (key: string) => {
    if (isItemControlled) {
      onToggleIndividual?.(key);
    } else {
      setInternalItemState((prev) => ({
        ...prev,
        [key]: !getItemExpanded(key),
      }));
    }
  };

  // Expand/collapse all items
  const expandAllItems = () => {
    if (isItemControlled) {
      items.forEach((item) => {
        if (!getItemExpanded(item.key)) {
          onToggleIndividual?.(item.key);
        }
      });
    } else {
      const newState: Record<string, boolean> = {};
      items.forEach((item) => {
        newState[item.key] = true;
      });
      setInternalItemState(newState);
    }
  };

  const collapseAllItems = () => {
    if (isItemControlled) {
      items.forEach((item) => {
        if (getItemExpanded(item.key)) {
          onToggleIndividual?.(item.key);
        }
      });
    } else {
      setInternalItemState({});
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={`chatter-collapsible-section ${className}`}>
      {/* Section header */}
      {title && (
        <button
          className="chatter-section-header"
          onClick={toggleSection}
          aria-expanded={sectionExpanded}
        >
          <ChevronIcon expanded={sectionExpanded} />
          <span className="chatter-section-title">{title}</span>
          <span className="chatter-section-count">{items.length}</span>
        </button>
      )}

      {/* Section content */}
      {sectionExpanded && (
        <div className="chatter-section-content">
          {/* Expand/collapse all controls */}
          {showExpandAllControls && items.length > 1 && (
            <div className="chatter-expand-controls">
              <button onClick={expandAllItems}>Expand all</button>
              <button onClick={collapseAllItems}>Collapse all</button>
            </div>
          )}

          {/* Items */}
          <div className="chatter-section-items">
            {items.map((item) => {
              const itemExpanded = getItemExpanded(item.key);

              return (
                <div key={item.key} className="chatter-collapsible-item">
                  <button
                    className="chatter-item-header"
                    onClick={() => toggleItem(item.key)}
                    aria-expanded={itemExpanded}
                  >
                    <ChevronIcon expanded={itemExpanded} />
                    <span className="chatter-item-title">{item.header}</span>
                    {item.badge !== undefined && (
                      <span className="chatter-item-badge">{item.badge}</span>
                    )}
                  </button>

                  {itemExpanded && (
                    <div className="chatter-item-body">{item.body}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CollapsibleSection;
