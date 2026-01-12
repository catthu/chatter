import type {
  Transport,
  ConnectionStatus,
  EventCallback,
  StatusCallback,
  OutgoingMessage,
  NormalizedEvent,
  EventNormalizer,
  WebSocketTransportConfig,
  Unsubscribe,
} from '../types';

/**
 * Default event normalizer that passes through events with minimal transformation
 */
class DefaultNormalizer implements EventNormalizer {
  normalize(rawEvent: unknown): NormalizedEvent | null {
    if (!rawEvent || typeof rawEvent !== 'object') {
      return null;
    }

    const event = rawEvent as Record<string, unknown>;

    return {
      type: String(event.type || 'message'),
      sessionId: String(event.sessionId || event.session_id || ''),
      payload: event.payload ?? event.data ?? event,
      sequence: typeof event.sequence === 'number' ? event.sequence : undefined,
      timestamp: String(event.timestamp || event.createdAt || new Date().toISOString()),
      raw: rawEvent,
    };
  }
}

/**
 * WebSocket-based transport implementation.
 * Handles connection management, reconnection, heartbeats, and message routing.
 */
export class WebSocketTransport implements Transport {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private statusListeners = new Set<StatusCallback>();
  private sessionSubscribers = new Map<string, Set<EventCallback>>();
  private allSubscribers = new Set<EventCallback>();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private normalizer: EventNormalizer;

  private readonly config: Required<WebSocketTransportConfig['reconnect']> & {
    url: string;
    heartbeatInterval: number;
    authToken?: string;
  };

  constructor(config: WebSocketTransportConfig) {
    this.normalizer = config.normalizer || new DefaultNormalizer();
    this.config = {
      url: config.url,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      authToken: config.authToken,
      enabled: config.reconnect?.enabled ?? true,
      maxAttempts: config.reconnect?.maxAttempts ?? 10,
      baseDelay: config.reconnect?.baseDelay ?? 1000,
      maxDelay: config.reconnect?.maxDelay ?? 30000,
    };
  }

  async connect(): Promise<void> {
    if (this.status === 'connected' || this.status === 'connecting') {
      return;
    }

    this.setStatus('connecting');

    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.config.url);
        if (this.config.authToken) {
          url.searchParams.set('token', this.config.authToken);
        }

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.setStatus('connected');
          this.startHeartbeat();
          resolve();
        };

        this.ws.onclose = (event) => {
          this.stopHeartbeat();

          if (event.wasClean) {
            this.setStatus('disconnected');
          } else {
            this.handleDisconnect();
          }
        };

        this.ws.onerror = () => {
          if (this.status === 'connecting') {
            reject(new Error('WebSocket connection failed'));
          }
          this.setStatus('error');
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  subscribe(sessionId: string, callback: EventCallback): Unsubscribe {
    if (!this.sessionSubscribers.has(sessionId)) {
      this.sessionSubscribers.set(sessionId, new Set());
      // Send subscribe message to server
      this.sendRaw({ type: 'subscribe', sessionId });
    }

    this.sessionSubscribers.get(sessionId)!.add(callback);

    return () => {
      const subscribers = this.sessionSubscribers.get(sessionId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.sessionSubscribers.delete(sessionId);
          // Send unsubscribe message to server
          this.sendRaw({ type: 'unsubscribe', sessionId });
        }
      }
    };
  }

  subscribeAll(callback: EventCallback): Unsubscribe {
    this.allSubscribers.add(callback);

    // If this is the first global subscriber, tell the server
    if (this.allSubscribers.size === 1) {
      this.sendRaw({ type: 'subscribe', all: true });
    }

    return () => {
      this.allSubscribers.delete(callback);
      if (this.allSubscribers.size === 0) {
        this.sendRaw({ type: 'unsubscribe', all: true });
      }
    };
  }

  async send(message: OutgoingMessage): Promise<void> {
    if (this.status !== 'connected' || !this.ws) {
      throw new Error('Not connected');
    }

    this.sendRaw({
      type: 'message',
      sessionId: message.sessionId,
      content: message.content,
      messageType: message.type,
      attachments: message.attachments,
      metadata: message.metadata,
    });
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  onStatusChange(callback: StatusCallback): Unsubscribe {
    this.statusListeners.add(callback);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusListeners.forEach((listener) => listener(status));
    }
  }

  private handleMessage(data: string): void {
    try {
      const raw = JSON.parse(data);

      // Handle pong responses
      if (raw.type === 'pong') {
        return;
      }

      const event = this.normalizer.normalize(raw);
      if (!event) {
        return;
      }

      // Notify session-specific subscribers
      const sessionCallbacks = this.sessionSubscribers.get(event.sessionId);
      if (sessionCallbacks) {
        sessionCallbacks.forEach((callback) => callback(event));
      }

      // Notify global subscribers
      this.allSubscribers.forEach((callback) => callback(event));
    } catch (error) {
      console.error('[WebSocketTransport] Failed to parse message:', error);
    }
  }

  private handleDisconnect(): void {
    if (!this.config.enabled) {
      this.setStatus('disconnected');
      return;
    }

    if (this.reconnectAttempts >= this.config.maxAttempts) {
      this.setStatus('error');
      return;
    }

    this.setStatus('reconnecting');
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    const delay = Math.min(
      this.config.baseDelay * Math.pow(2, this.reconnectAttempts),
      this.config.maxDelay
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        // Connection failed, will trigger another reconnect via onclose
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.status === 'connected') {
        this.sendRaw({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendRaw(data: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
}

/**
 * Create a WebSocket transport instance
 */
export function createWebSocketTransport(
  config: WebSocketTransportConfig
): WebSocketTransport {
  return new WebSocketTransport(config);
}
