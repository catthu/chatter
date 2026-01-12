import { useState, useCallback, useMemo, useEffect } from 'react';

export interface UseCollapsibleOptions {
  /** Default expanded state for new items */
  defaultExpanded?: boolean;
  /** Key for persisting state (localStorage) */
  persistKey?: string;
  /** Initial expanded state map */
  initialState?: Record<string, boolean>;
}

export interface UseCollapsibleResult {
  /** Check if a specific key is expanded */
  isExpanded: (key: string) => boolean;
  /** Toggle a specific key */
  toggle: (key: string) => void;
  /** Expand a specific key */
  expand: (key: string) => void;
  /** Collapse a specific key */
  collapse: (key: string) => void;
  /** Expand all items */
  expandAll: () => void;
  /** Collapse all items */
  collapseAll: () => void;
  /** Current expanded state map */
  expandedState: Record<string, boolean>;
  /** Set the entire expanded state */
  setExpandedState: (state: Record<string, boolean>) => void;
}

/**
 * Hook for managing collapsible/expandable state.
 * Supports multi-level collapsibles with optional persistence.
 */
export function useCollapsible(
  options: UseCollapsibleOptions = {}
): UseCollapsibleResult {
  const { defaultExpanded = false, persistKey, initialState = {} } = options;

  // Load initial state from storage if persistKey is provided
  const getInitialState = (): Record<string, boolean> => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`chatter-collapsible-${persistKey}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        // Ignore storage errors
      }
    }
    return initialState;
  };

  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(
    getInitialState
  );

  // Track all known keys for expandAll/collapseAll
  const [knownKeys, setKnownKeys] = useState<Set<string>>(
    new Set(Object.keys(initialState))
  );

  // Persist state changes
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `chatter-collapsible-${persistKey}`,
          JSON.stringify(expandedState)
        );
      } catch {
        // Ignore storage errors
      }
    }
  }, [expandedState, persistKey]);

  // Check if a key is expanded
  const isExpanded = useCallback(
    (key: string): boolean => {
      // Add to known keys
      if (!knownKeys.has(key)) {
        setKnownKeys((prev) => new Set([...prev, key]));
      }
      return expandedState[key] ?? defaultExpanded;
    },
    [expandedState, defaultExpanded, knownKeys]
  );

  // Toggle a key
  const toggle = useCallback(
    (key: string) => {
      setExpandedState((prev) => ({
        ...prev,
        [key]: !(prev[key] ?? defaultExpanded),
      }));
    },
    [defaultExpanded]
  );

  // Expand a key
  const expand = useCallback((key: string) => {
    setExpandedState((prev) => ({
      ...prev,
      [key]: true,
    }));
  }, []);

  // Collapse a key
  const collapse = useCallback((key: string) => {
    setExpandedState((prev) => ({
      ...prev,
      [key]: false,
    }));
  }, []);

  // Expand all known keys
  const expandAll = useCallback(() => {
    setExpandedState((prev) => {
      const allKeys = new Set([...Object.keys(prev), ...knownKeys]);
      const newState: Record<string, boolean> = {};
      allKeys.forEach((key) => {
        newState[key] = true;
      });
      return newState;
    });
  }, [knownKeys]);

  // Collapse all known keys
  const collapseAll = useCallback(() => {
    setExpandedState((prev) => {
      const allKeys = new Set([...Object.keys(prev), ...knownKeys]);
      const newState: Record<string, boolean> = {};
      allKeys.forEach((key) => {
        newState[key] = false;
      });
      return newState;
    });
  }, [knownKeys]);

  return {
    isExpanded,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    expandedState,
    setExpandedState,
  };
}

/**
 * Hook for managing a single collapsible item (controlled or uncontrolled).
 * If `expanded` prop is provided, operates in controlled mode.
 */
export function useCollapsibleItem(
  expanded?: boolean,
  onToggle?: () => void,
  defaultExpanded = false
): { isExpanded: boolean; toggle: () => void } {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Controlled vs uncontrolled
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;

  const toggle = useCallback(() => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  }, [isControlled, onToggle]);

  return { isExpanded, toggle };
}
