import React, { forwardRef } from 'react';

export interface ChatContainerProps {
  /** Child elements (messages, etc.) */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Container role for accessibility */
  role?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Container component for chat messages.
 * Provides consistent styling and accessibility attributes.
 */
export const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  (
    {
      children,
      className = '',
      style,
      role = 'log',
      ariaLabel = 'Chat messages',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`chatter-container ${className}`}
        style={style}
        role={role}
        aria-label={ariaLabel}
        aria-live="polite"
      >
        {children}
      </div>
    );
  }
);

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
