/**
 * Connection status for transport layer
 */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/**
 * Callback for unsubscribing from events
 */
export type Unsubscribe = () => void;

/**
 * Normalized event from the transport layer
 */
export interface NormalizedEvent {
  /** Event type identifier */
  type: string;
  /** Session this event belongs to */
  sessionId: string;
  /** Event payload */
  payload: unknown;
  /** Optional sequence number */
  sequence?: number;
  /** ISO timestamp */
  timestamp: string;
  /** Original raw event (for debugging) */
  raw?: unknown;
}

/**
 * Callback for receiving events
 */
export type EventCallback = (event: NormalizedEvent) => void;

/**
 * Callback for connection status changes
 */
export type StatusCallback = (status: ConnectionStatus) => void;

/**
 * Outgoing message to send through transport
 */
export interface OutgoingMessage {
  /** Target session ID */
  sessionId: string;
  /** Message type */
  type: string;
  /** Message content */
  content: string;
  /** Optional attachments */
  attachments?: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
  }>;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Transport interface for real-time communication.
 * Implement this to support WebSocket, SSE, polling, etc.
 */
export interface Transport {
  /**
   * Connect to the transport server
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the transport server
   */
  disconnect(): void;

  /**
   * Subscribe to events for a specific session
   * @param sessionId - Session to subscribe to
   * @param callback - Called when events arrive for this session
   * @returns Unsubscribe function
   */
  subscribe(sessionId: string, callback: EventCallback): Unsubscribe;

  /**
   * Subscribe to all events across all sessions
   * @param callback - Called when any event arrives
   * @returns Unsubscribe function
   */
  subscribeAll(callback: EventCallback): Unsubscribe;

  /**
   * Send a message through the transport
   * @param message - Message to send
   */
  send(message: OutgoingMessage): Promise<void>;

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus;

  /**
   * Subscribe to connection status changes
   * @param callback - Called when status changes
   * @returns Unsubscribe function
   */
  onStatusChange(callback: StatusCallback): Unsubscribe;
}

/**
 * Normalizes raw events from different backends into a standard format.
 * Implement this to support custom event formats.
 */
export interface EventNormalizer {
  /**
   * Transform a raw event into normalized format
   * @param rawEvent - Raw event from the transport
   * @returns Normalized event or null if event should be ignored
   */
  normalize(rawEvent: unknown): NormalizedEvent | null;
}

/**
 * Configuration for WebSocket transport
 */
export interface WebSocketTransportConfig {
  /** WebSocket server URL */
  url: string;
  /** Optional event normalizer */
  normalizer?: EventNormalizer;
  /** Reconnection options */
  reconnect?: {
    /** Enable automatic reconnection (default: true) */
    enabled?: boolean;
    /** Maximum reconnection attempts (default: 10) */
    maxAttempts?: number;
    /** Base delay in ms between attempts (default: 1000) */
    baseDelay?: number;
    /** Maximum delay in ms (default: 30000) */
    maxDelay?: number;
  };
  /** Heartbeat/ping interval in ms (default: 30000) */
  heartbeatInterval?: number;
  /** Optional authentication token */
  authToken?: string;
}

/**
 * Configuration for SSE transport
 */
export interface SSETransportConfig {
  /** SSE endpoint URL */
  url: string;
  /** Optional event normalizer */
  normalizer?: EventNormalizer;
  /** URL for sending messages (POST) */
  sendUrl?: string;
  /** Optional authentication token */
  authToken?: string;
}

/**
 * Union of all transport configurations
 */
export type TransportConfig =
  | ({ type: 'websocket' } & WebSocketTransportConfig)
  | ({ type: 'sse' } & SSETransportConfig)
  | ({ type: 'custom'; transport: Transport });
