import React from 'react';
import type { Attachment, DeliveryStatus } from '@chatter/core';

export interface ChatBubbleProps {
  /** Who sent this message */
  sender: string;
  /** Text content of the message */
  content?: string;
  /** Rich content to render instead of/alongside text */
  richContent?: React.ReactNode;
  /** File attachments */
  attachments?: Attachment[];
  /** ISO timestamp */
  timestamp: string;
  /** Whether to show sender avatar */
  showAvatar?: boolean;
  /** Whether this message is grouped with previous */
  isGrouped?: boolean;
  /** Delivery status for outbound messages */
  deliveryStatus?: DeliveryStatus;
  /** Custom class name */
  className?: string;
  /** Avatar component or URL */
  avatar?: React.ReactNode | string;
  /** Format timestamp for display */
  formatTimestamp?: (timestamp: string) => string;
}

/**
 * Default timestamp formatter
 */
const defaultFormatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Delivery status indicator
 */
function DeliveryIndicator({ status }: { status: DeliveryStatus }) {
  switch (status) {
    case 'pending':
      return <span className="chatter-delivery-indicator pending">○</span>;
    case 'delivered':
      return <span className="chatter-delivery-indicator delivered">✓</span>;
    case 'failed':
      return <span className="chatter-delivery-indicator failed">!</span>;
    default:
      return null;
  }
}

/**
 * Attachment preview component
 */
function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.type.startsWith('image/');

  if (isImage) {
    return (
      <div className="chatter-attachment-preview image">
        <img
          src={attachment.thumbnailUrl || attachment.url}
          alt={attachment.name}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="chatter-attachment-preview file">
      <span className="chatter-attachment-icon">📎</span>
      <span className="chatter-attachment-name">{attachment.name}</span>
      {attachment.size && (
        <span className="chatter-attachment-size">
          {formatFileSize(attachment.size)}
        </span>
      )}
    </div>
  );
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Chat bubble component for displaying messages.
 * Supports both user and bot messages with customizable styling.
 */
export function ChatBubble({
  sender,
  content,
  richContent,
  attachments,
  timestamp,
  showAvatar = true,
  isGrouped = false,
  deliveryStatus,
  className = '',
  avatar,
  formatTimestamp = defaultFormatTimestamp,
}: ChatBubbleProps) {
  const isUser = sender === 'user';
  const senderClass = isUser ? 'user' : 'bot';

  return (
    <div
      className={`chatter-bubble-container ${senderClass} ${
        isGrouped ? 'grouped' : ''
      } ${className}`}
    >
      {/* Avatar */}
      {showAvatar && !isGrouped && (
        <div className="chatter-avatar">
          {typeof avatar === 'string' ? (
            <img src={avatar} alt={sender} />
          ) : avatar ? (
            avatar
          ) : (
            <div className="chatter-avatar-placeholder">
              {sender.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className={`chatter-bubble ${senderClass}`}>
        {/* Text content */}
        {content && <div className="chatter-bubble-text">{content}</div>}

        {/* Rich content */}
        {richContent && (
          <div className="chatter-bubble-rich">{richContent}</div>
        )}

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="chatter-attachments">
            {attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Footer with timestamp and delivery status */}
        <div className="chatter-bubble-footer">
          <span className="chatter-timestamp">
            {formatTimestamp(timestamp)}
          </span>
          {deliveryStatus && <DeliveryIndicator status={deliveryStatus} />}
        </div>
      </div>
    </div>
  );
}

export default ChatBubble;
