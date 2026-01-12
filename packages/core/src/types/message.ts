/**
 * Base message interface that all message types extend from.
 * Generic over content type to support both simple text and rich content.
 */
export interface BaseMessage<TContent = unknown> {
  /** Unique identifier for the message */
  id: string;
  /** Who sent this message (e.g., 'user', 'bot', or custom sender) */
  sender: string;
  /** The message content - varies by message type */
  content: TContent;
  /** ISO timestamp of when the message was created */
  createdAt: string;
  /** Optional sequence number for ordering (assigned by server) */
  sequence?: number | null;
  /** Optional metadata for custom fields */
  metadata?: Record<string, unknown>;
}

/**
 * Attachment that can be included with messages (images, files, etc.)
 */
export interface Attachment {
  /** Unique identifier for the attachment */
  id: string;
  /** MIME type of the attachment */
  type: string;
  /** Display name of the attachment */
  name: string;
  /** URL to the attachment content */
  url: string;
  /** Optional size in bytes */
  size?: number;
  /** Optional thumbnail URL for images/videos */
  thumbnailUrl?: string;
}

/**
 * Delivery status for outgoing messages
 */
export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

/**
 * Simple text message with optional attachments.
 * Used for basic user-to-bot communication.
 */
export interface TextMessage extends BaseMessage<string> {
  /** Optional file attachments */
  attachments?: Attachment[];
  /** Delivery status for outbound messages */
  deliveryStatus?: DeliveryStatus;
}

/**
 * A single block of content within a rich message.
 * Extensible to support custom block types.
 */
export interface ContentBlock {
  /** Block type (text, code, image, or custom) */
  type: string;
  /** Text or code content */
  content?: string;
  /** Language hint for code blocks */
  language?: string;
  /** URL for images/media */
  url?: string;
  /** Alt text for images */
  alt?: string;
  /** Optional block-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Rich message containing multiple content blocks.
 * Used for complex responses with mixed content types.
 */
export interface RichMessage extends BaseMessage<ContentBlock[]> {
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
}

/**
 * System event that appears in the timeline (joins, status changes, etc.)
 */
export interface SystemEvent {
  /** Unique identifier */
  id: string;
  /** Event type (e.g., 'join', 'leave', 'status') */
  type: string;
  /** ISO timestamp */
  createdAt: string;
  /** Event-specific data */
  data?: Record<string, unknown>;
  /** Optional sequence number */
  sequence?: number | null;
}

/**
 * Item type discriminator for timeline items
 */
export type TimelineItemType = 'message' | 'event';

/**
 * A message that can appear in the timeline
 */
export type TimelineMessage =
  | (TextMessage & { itemType: 'message' })
  | (RichMessage & { itemType: 'message' });

/**
 * An event that can appear in the timeline
 */
export type TimelineEvent = SystemEvent & { itemType: 'event' };

/**
 * Union type for all items that can appear in a chat timeline
 */
export type TimelineItem = TimelineMessage | TimelineEvent;

/**
 * Type guard to check if a timeline item is a message
 */
export function isTimelineMessage(item: TimelineItem): item is TimelineMessage {
  return item.itemType === 'message';
}

/**
 * Type guard to check if a timeline item is an event
 */
export function isTimelineEvent(item: TimelineItem): item is TimelineEvent {
  return item.itemType === 'event';
}

/**
 * Type guard to check if a message is a text message
 */
export function isTextMessage(message: BaseMessage): message is TextMessage {
  return typeof message.content === 'string';
}

/**
 * Type guard to check if a message is a rich message
 */
export function isRichMessage(message: BaseMessage): message is RichMessage {
  return Array.isArray(message.content);
}
