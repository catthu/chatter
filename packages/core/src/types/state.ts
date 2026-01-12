import type {
  BaseMessage,
  ContentBlock,
  TimelineItem,
} from './message';
import type { Unsubscribe } from './transport';

/**
 * Streaming state for real-time message updates
 */
export interface StreamingState {
  /** Whether a message is currently being streamed */
  isStreaming: boolean;
  /** Partial content blocks received so far */
  partialContent: ContentBlock[] | null;
  /** Session ID of the streaming message */
  sessionId: string | null;
}

/**
 * Rule for deduplicating messages
 */
export interface DeduplicationRule {
  /** Field to use for deduplication (e.g., 'id', 'sequence') */
  field: keyof BaseMessage;
  /** Strategy: 'first' keeps first occurrence, 'last' keeps last */
  strategy: 'first' | 'last';
}

/**
 * Rule for sorting timeline items
 */
export interface SortingRule {
  /** Field to sort by */
  field: string;
  /** Sort direction */
  direction: 'asc' | 'desc';
  /** Priority (lower = higher priority) */
  priority: number;
}

/**
 * Listener callback for message store changes
 */
export type MessageStoreListener<TMessage extends BaseMessage> = (
  messages: TMessage[]
) => void;

/**
 * Message store for managing chat messages.
 * Handles message storage, updates, and change notifications.
 */
export interface MessageStore<TMessage extends BaseMessage> {
  /**
   * Get all messages in the store
   */
  getMessages(): TMessage[];

  /**
   * Get a single message by ID
   */
  getMessage(id: string): TMessage | undefined;

  /**
   * Add a new message to the store
   */
  addMessage(message: TMessage): void;

  /**
   * Add multiple messages to the store
   */
  addMessages(messages: TMessage[]): void;

  /**
   * Update an existing message
   */
  updateMessage(id: string, updates: Partial<TMessage>): void;

  /**
   * Remove a message from the store
   */
  removeMessage(id: string): void;

  /**
   * Clear all messages from the store
   */
  clear(): void;

  /**
   * Subscribe to message changes
   */
  subscribe(listener: MessageStoreListener<TMessage>): Unsubscribe;
}

/**
 * Parameters for building a timeline
 */
export interface TimelineBuildParams {
  /** Messages to include in timeline */
  messages: BaseMessage[];
  /** System events to include */
  events?: Array<{ id: string; type: string; createdAt: string; data?: unknown }>;
  /** Whether streaming is active */
  isStreaming?: boolean;
  /** Partial content from streaming */
  partialContent?: ContentBlock[] | null;
  /** Rules for deduplicating items */
  deduplicationRules?: DeduplicationRule[];
  /** Rules for sorting items */
  sortingRules?: SortingRule[];
}

/**
 * Timeline builder for constructing ordered chat timelines.
 * Handles deduplication, sorting, and merging of messages and events.
 */
export interface TimelineBuilder {
  /**
   * Build a timeline from messages and events
   */
  build(params: TimelineBuildParams): TimelineItem[];
}

/**
 * Listener for streaming state changes
 */
export type StreamingStateListener = (state: StreamingState) => void;

/**
 * Streaming state machine for managing real-time updates.
 * Tracks streaming status and partial content.
 */
export interface StreamingStateMachine {
  /**
   * Get current streaming state
   */
  getState(): StreamingState;

  /**
   * Handle incoming partial content
   */
  onPartialContent(sessionId: string, content: ContentBlock[]): void;

  /**
   * Handle stream completion
   */
  onComplete(sessionId: string): void;

  /**
   * Reset streaming state
   */
  reset(): void;

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StreamingStateListener): Unsubscribe;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Number of messages per page */
  pageSize: number;
  /** Cursor field for pagination */
  cursorField?: 'createdAt' | 'sequence' | 'id';
}

/**
 * Session state
 */
export interface SessionState {
  /** Session ID */
  id: string;
  /** Session status */
  status: 'active' | 'ended' | 'error';
  /** When the session was created */
  createdAt: string;
  /** When the session was last updated */
  updatedAt: string;
  /** Optional session metadata */
  metadata?: Record<string, unknown>;
}
