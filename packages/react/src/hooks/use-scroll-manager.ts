import { useState, useEffect, useCallback, useRef, RefObject } from 'react';

export interface UseScrollManagerOptions {
  /** Distance from bottom (in pixels) to be considered "at bottom" */
  bottomThreshold?: number;
  /** Distance from top (in pixels) to trigger onNearTop */
  topThreshold?: number;
  /** Callback when scrolled near top (useful for loading more) */
  onNearTop?: () => void;
}

export interface UseScrollManagerResult {
  /** Whether user is at or near the bottom of the container */
  isAtBottom: boolean;
  /** Whether there are new messages below the current scroll position */
  hasNewMessages: boolean;
  /** Scroll to the bottom of the container */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  /** Clear the new messages indicator */
  clearNewMessages: () => void;
  /** Mark that new messages have arrived */
  markNewMessages: () => void;
}

/**
 * Hook for managing scroll behavior in chat containers.
 * Tracks scroll position and provides utilities for auto-scrolling.
 */
export function useScrollManager(
  containerRef: RefObject<HTMLElement>,
  options: UseScrollManagerOptions = {}
): UseScrollManagerResult {
  const { bottomThreshold = 100, topThreshold = 100, onNearTop } = options;

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Track whether we should auto-scroll on new messages
  const shouldAutoScrollRef = useRef(true);

  // Check if scrolled to bottom
  const checkIsAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom <= bottomThreshold;
  }, [containerRef, bottomThreshold]);

  // Check if scrolled near top
  const checkIsNearTop = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    return container.scrollTop <= topThreshold;
  }, [containerRef, topThreshold]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIsAtBottom();
      setIsAtBottom(atBottom);
      shouldAutoScrollRef.current = atBottom;

      // Clear new messages indicator when scrolled to bottom
      if (atBottom) {
        setHasNewMessages(false);
      }

      // Check for near top (for loading more)
      if (checkIsNearTop()) {
        onNearTop?.();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, checkIsAtBottom, checkIsNearTop, onNearTop]);

  // Scroll to bottom
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });

      setHasNewMessages(false);
      shouldAutoScrollRef.current = true;
    },
    [containerRef]
  );

  // Clear new messages indicator
  const clearNewMessages = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  // Mark that new messages have arrived
  const markNewMessages = useCallback(() => {
    if (!shouldAutoScrollRef.current) {
      setHasNewMessages(true);
    }
  }, []);

  return {
    isAtBottom,
    hasNewMessages,
    scrollToBottom,
    clearNewMessages,
    markNewMessages,
  };
}
