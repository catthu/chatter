# @chatter

A general-purpose chat SDK with hooks for easily implementing chat UIs.

## Packages

- **@chatter/core** - Headless core with framework-agnostic state management, transport, and streaming
- **@chatter/react** - React hooks and components for building chat UIs
- **@chatter/themes** - CSS themes for styling chat components

## Quick Start

```bash
npm install @chatter/react @chatter/themes
```

```tsx
import { useChatSession, ChatBubble, ChatContainer } from '@chatter/react';
import '@chatter/themes/default.css';

function Chat() {
  const { timeline, sendMessage, isStreaming } = useChatSession({
    sessionId: 'my-session',
    transport: {
      type: 'websocket',
      url: 'wss://your-server.com/ws',
    },
  });

  return (
    <ChatContainer>
      {timeline.map((item) => (
        <ChatBubble
          key={item.id}
          sender={item.sender}
          content={item.content}
          timestamp={item.createdAt}
        />
      ))}
    </ChatContainer>
  );
}
```

## Features

- **Transport agnostic** - WebSocket, SSE, or custom transport implementations
- **Streaming support** - Real-time message streaming with partial content updates
- **Virtual scrolling ready** - Works with virtualization libraries
- **Multi-level collapsibles** - Controlled or uncontrolled collapsible sections
- **Theming** - CSS custom properties for easy customization
- **TypeScript** - Full type safety

## Packages

### @chatter/core

Core types and utilities:

- `BaseMessage`, `TextMessage`, `RichMessage` - Message types
- `ContentBlock` - Rich content blocks (text, code, images)
- `Transport` interface - For custom transport implementations
- `WebSocketTransport` - Built-in WebSocket transport
- `MessageStore` - In-memory message storage
- `TimelineBuilder` - Timeline construction with deduplication
- `StreamingStateMachine` - Streaming state management

### @chatter/react

React bindings:

**Hooks:**
- `useChatSession` - Main orchestrating hook
- `useScrollManager` - Auto-scroll and scroll position tracking
- `useCollapsible` - Multi-level collapsible state management

**Components:**
- `ChatContainer` - Container with accessibility attributes
- `ChatBubble` - Message bubble with sender styling
- `RichContent` - Renders content blocks
- `CollapsibleSection` - Multi-level collapsible sections

### @chatter/themes

CSS themes:
- `default.css` - Light theme
- `dark.css` - Dark theme (supports auto dark mode)

## Custom Transport

```typescript
import type { Transport } from '@chatter/core';

class MyTransport implements Transport {
  connect() { /* ... */ }
  disconnect() { /* ... */ }
  subscribe(sessionId, callback) { /* ... */ }
  subscribeAll(callback) { /* ... */ }
  send(message) { /* ... */ }
  getStatus() { /* ... */ }
  onStatusChange(callback) { /* ... */ }
}

// Use with useChatSession
useChatSession({
  sessionId: 'my-session',
  transport: { type: 'custom', transport: new MyTransport() },
});
```

## Custom Block Renderers

```tsx
import { RichContent } from '@chatter/react';

function ChartBlock({ block }) {
  return <MyChartComponent data={block.metadata.data} />;
}

<RichContent
  blocks={content}
  blockRenderers={{
    chart: ChartBlock,
  }}
/>
```

## Theming

Override CSS custom properties:

```css
:root {
  --chatter-primary: #8b5cf6;
  --chatter-user-bg: var(--chatter-primary);
  --chatter-bubble-radius: 0.5rem;
}
```

## License

MIT
