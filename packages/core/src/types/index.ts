// Message types
export type {
  BaseMessage,
  TextMessage,
  RichMessage,
  ContentBlock,
  Attachment,
  DeliveryStatus,
  SystemEvent,
  TimelineItem,
  TimelineMessage,
  TimelineEvent,
  TimelineItemType,
} from './message';

export {
  isTimelineMessage,
  isTimelineEvent,
  isTextMessage,
  isRichMessage,
} from './message';

// Transport types
export type {
  ConnectionStatus,
  Unsubscribe,
  NormalizedEvent,
  EventCallback,
  StatusCallback,
  OutgoingMessage,
  Transport,
  EventNormalizer,
  WebSocketTransportConfig,
  SSETransportConfig,
  TransportConfig,
} from './transport';

// State types
export type {
  StreamingState,
  DeduplicationRule,
  SortingRule,
  MessageStoreListener,
  MessageStore,
  TimelineBuildParams,
  TimelineBuilder,
  StreamingStateListener,
  StreamingStateMachine,
  PaginationConfig,
  SessionState,
} from './state';
