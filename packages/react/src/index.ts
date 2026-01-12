// Re-export core types for convenience
export type {
  BaseMessage,
  TextMessage,
  RichMessage,
  ContentBlock,
  Attachment,
  DeliveryStatus,
  TimelineItem,
  ConnectionStatus,
  Transport,
  TransportConfig,
} from '@chatter/core';

// Hooks
export {
  useChatSession,
  useScrollManager,
  useCollapsible,
  useCollapsibleItem,
  useTheme,
} from './hooks';
export type {
  UseChatSessionConfig,
  UseChatSessionResult,
  UseScrollManagerOptions,
  UseScrollManagerResult,
  UseCollapsibleOptions,
  UseCollapsibleResult,
  Theme,
  ResolvedTheme,
  UseThemeOptions,
  UseThemeResult,
} from './hooks';

// Components
export {
  ChatBubble,
  RichContent,
  CollapsibleSection,
  ChatContainer,
} from './components';
export type {
  ChatBubbleProps,
  RichContentProps,
  BlockRendererProps,
  CollapsibleSectionProps,
  CollapsibleItem,
  ChatContainerProps,
} from './components';
