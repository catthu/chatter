import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type {
  BaseMessage,
  ContentBlock,
  TimelineItem,
  ConnectionStatus,
  TransportConfig,
  Transport,
  Attachment,
  PaginationConfig,
  NormalizedEvent,
} from '@chatter/core';
import {
  createWebSocketTransport,
  createMessageStore,
  createTimelineBuilder,
  createStreamingStateMachine,
} from '@chatter/core';

export interface UseChatSessionConfig {
  /** Session ID to connect to */
  sessionId: string;
  /** Transport configuration */
  transport: TransportConfig;
  /** Initial messages to populate the chat */
  initialMessages?: BaseMessage[];
  /** Pagination configuration */
  pagination?: PaginationConfig;
  /** Callback when new message arrives */
  onMessage?: (message: BaseMessage) => void;
  /** Callback when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
}

export interface UseChatSessionResult {
  /** Current connection status */
  status: ConnectionStatus;
  /** All messages in the session */
  messages: BaseMessage[];
  /** Timeline items (messages + events) sorted */
  timeline: TimelineItem[];
  /** Whether a message is currently streaming */
  isStreaming: boolean;
  /** Partial content from streaming message */
  partialContent: ContentBlock[] | null;
  /** Send a message */
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  /** Load more historical messages */
  loadMore: () => Promise<void>;
  /** Whether there are more messages to load */
  hasMore: boolean;
  /** Connect to the session */
  connect: () => Promise<void>;
  /** Disconnect from the session */
  disconnect: () => void;
}

/**
 * Main orchestrating hook for chat sessions.
 * Manages connection, messages, streaming, and timeline construction.
 */
export function useChatSession(config: UseChatSessionConfig): UseChatSessionResult {
  const {
    sessionId,
    transport: transportConfig,
    initialMessages = [],
    onMessage,
    onStatusChange,
  } = config;

  // Refs for stable instances
  const transportRef = useRef<Transport | null>(null);
  const messageStoreRef = useRef(createMessageStore<BaseMessage>());
  const timelineBuilderRef = useRef(createTimelineBuilder());
  const streamingStateMachineRef = useRef(createStreamingStateMachine());

  // State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [messages, setMessages] = useState<BaseMessage[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [partialContent, setPartialContent] = useState<ContentBlock[] | null>(null);
  const [hasMore] = useState(false);

  // Initialize messages in store
  useEffect(() => {
    if (initialMessages.length > 0) {
      messageStoreRef.current.addMessages(initialMessages);
    }
  }, []);

  // Create transport
  useEffect(() => {
    if (transportConfig.type === 'websocket') {
      transportRef.current = createWebSocketTransport(transportConfig);
    } else if (transportConfig.type === 'custom') {
      transportRef.current = transportConfig.transport;
    }

    return () => {
      transportRef.current?.disconnect();
    };
  }, [transportConfig]);

  // Subscribe to message store changes
  useEffect(() => {
    const unsubscribe = messageStoreRef.current.subscribe((msgs) => {
      setMessages(msgs);
    });
    return unsubscribe;
  }, []);

  // Subscribe to streaming state changes
  useEffect(() => {
    const unsubscribe = streamingStateMachineRef.current.subscribe((state) => {
      setIsStreaming(state.isStreaming);
      setPartialContent(state.partialContent);
    });
    return unsubscribe;
  }, []);

  // Handle incoming events
  const handleEvent = useCallback(
    (event: NormalizedEvent) => {
      switch (event.type) {
        case 'message':
        case 'Stop': {
          const message = event.payload as BaseMessage;
          messageStoreRef.current.addMessage(message);
          streamingStateMachineRef.current.onComplete(sessionId);
          onMessage?.(message);
          break;
        }
        case 'PartialContent': {
          const content = event.payload as ContentBlock[];
          streamingStateMachineRef.current.onPartialContent(sessionId, content);
          break;
        }
        case 'StreamStart': {
          streamingStateMachineRef.current.onPartialContent(sessionId, []);
          break;
        }
        case 'StreamEnd': {
          streamingStateMachineRef.current.onComplete(sessionId);
          break;
        }
      }
    },
    [sessionId, onMessage]
  );

  // Store cleanup functions for subscriptions
  const cleanupRef = useRef<(() => void) | null>(null);

  // Connect to session
  const connect = useCallback(async (): Promise<void> => {
    const transport = transportRef.current;
    if (!transport) return;

    // Clean up any existing subscriptions
    cleanupRef.current?.();

    // Subscribe to status changes
    const statusUnsub = transport.onStatusChange((newStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    });

    // Subscribe to session events
    const eventUnsub = transport.subscribe(sessionId, handleEvent);

    // Store cleanup
    cleanupRef.current = () => {
      statusUnsub();
      eventUnsub();
    };

    try {
      await transport.connect();
    } catch (error) {
      console.error('[useChatSession] Connection failed:', error);
      setStatus('error');
    }
  }, [sessionId, handleEvent, onStatusChange]);

  // Disconnect from session
  const disconnect = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    transportRef.current?.disconnect();
    setStatus('disconnected');
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Send a message
  const sendMessage = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      const transport = transportRef.current;
      if (!transport || status !== 'connected') {
        throw new Error('Not connected');
      }

      // Create optimistic message
      const message: BaseMessage = {
        id: `temp-${Date.now()}`,
        sender: 'user',
        content,
        createdAt: new Date().toISOString(),
        metadata: { attachments },
      };

      // Add to store optimistically
      messageStoreRef.current.addMessage(message);

      try {
        await transport.send({
          sessionId,
          type: 'user_message',
          content,
          attachments: attachments?.map((a) => ({
            id: a.id,
            type: a.type,
            name: a.name,
            url: a.url,
          })),
        });

        // Update delivery status
        messageStoreRef.current.updateMessage(message.id, {
          metadata: { ...message.metadata, deliveryStatus: 'delivered' },
        } as Partial<BaseMessage>);
      } catch (error) {
        // Mark as failed
        messageStoreRef.current.updateMessage(message.id, {
          metadata: { ...message.metadata, deliveryStatus: 'failed' },
        } as Partial<BaseMessage>);
        throw error;
      }
    },
    [sessionId, status]
  );

  // Load more messages
  const loadMore = useCallback(async () => {
    // TODO: Implement pagination
    console.log('[useChatSession] loadMore not yet implemented');
  }, []);

  // Build timeline
  const timeline = useMemo(() => {
    return timelineBuilderRef.current.build({
      messages,
      isStreaming,
      partialContent,
    });
  }, [messages, isStreaming, partialContent]);

  return {
    status,
    messages,
    timeline,
    isStreaming,
    partialContent,
    sendMessage,
    loadMore,
    hasMore,
    connect,
    disconnect,
  };
}
