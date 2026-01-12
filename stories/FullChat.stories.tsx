import React, { useRef, useState, useEffect, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChatContainer,
  ChatBubble,
  RichContent,
  CollapsibleSection,
  useScrollManager,
  type CollapsibleItem,
} from "@chatter/react";
import type { ContentBlock } from "@chatter/core";

const meta: Meta = {
  title: "Full Chat/Interactive",
  tags: ["autodocs"],
};

export default meta;

// Generate sample messages for scroll testing
function generateMessages(count: number) {
  const messages = [];
  const sampleConversations = [
    { sender: "user", content: "Hi, I need help with my order" },
    { sender: "bot", content: "Hello! I'd be happy to help you with your order. Could you please provide your order number?" },
    { sender: "user", content: "It's #12345" },
    { sender: "bot", content: "Thank you! I found your order. It was placed on January 10th and contains 3 items. Is there a specific issue you're experiencing?" },
    { sender: "user", content: "Yes, one of the items arrived damaged" },
    { sender: "bot", content: "I'm sorry to hear that. We'll arrange a replacement for you right away. Can you describe which item was damaged?" },
    { sender: "user", content: "The blue ceramic mug has a crack on the handle" },
    { sender: "bot", content: "I've noted that down. I'll process a replacement for the blue ceramic mug. You should receive a shipping confirmation within 24 hours. Would you like us to send a return label for the damaged item?" },
    { sender: "user", content: "Yes please" },
    { sender: "bot", content: "Done! I've sent a prepaid return label to your email. You can drop the damaged item at any post office. Is there anything else I can help you with?" },
  ];

  for (let i = 0; i < count; i++) {
    const template = sampleConversations[i % sampleConversations.length];
    messages.push({
      id: `msg-${i}`,
      ...template,
      timestamp: new Date(Date.now() - (count - i) * 60000).toISOString(),
    });
  }

  return messages;
}

// Scroll Behavior Test Component
function ScrollBehaviorTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(() => generateMessages(15));
  const [inputValue, setInputValue] = useState("");
  const [autoScrollOnNew, setAutoScrollOnNew] = useState(true);
  const [scrollLog, setScrollLog] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setScrollLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  const scroll = useScrollManager(containerRef, {
    bottomThreshold: 100,
    onNearTop: () => {
      addLog("Near top - could load older messages");
    },
  });

  // Track scroll position changes
  useEffect(() => {
    if (scroll.isAtBottom) {
      addLog("Scrolled to bottom");
    }
  }, [scroll.isAtBottom, addLog]);

  // Track new messages indicator
  useEffect(() => {
    if (scroll.hasNewMessages) {
      addLog("New messages indicator shown");
    }
  }, [scroll.hasNewMessages, addLog]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: `msg-${messages.length}`,
      sender: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
      deliveryStatus: "pending" as const,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    addLog("User sent message");

    // Always scroll to bottom when user sends a message
    setTimeout(() => {
      scroll.scrollToBottom("smooth");
      addLog("Auto-scrolled after user message");
    }, 50);

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === userMessage.id ? { ...m, deliveryStatus: "delivered" as const } : m
        )
      );

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${prev.length}`,
            sender: "bot",
            content: "Thanks for your message! This is an automated response.",
            timestamp: new Date().toISOString(),
          },
        ]);
        addLog("Bot message received");

        // Only auto-scroll if enabled and at bottom
        if (autoScrollOnNew && scroll.isAtBottom) {
          setTimeout(() => {
            scroll.scrollToBottom("smooth");
            addLog("Auto-scrolled for new bot message");
          }, 50);
        }
      }, 500);
    }, 1000);
  };

  const simulateIncomingMessage = () => {
    const wasAtBottom = scroll.isAtBottom;

    setMessages(prev => [
      ...prev,
      {
        id: `msg-${prev.length}`,
        sender: "bot",
        content: `New message #${prev.length + 1} - This simulates an incoming message while you're scrolled up.`,
        timestamp: new Date().toISOString(),
      },
    ]);
    addLog("Simulated incoming message");

    // Mark new messages if not at bottom
    if (!wasAtBottom) {
      scroll.markNewMessages();
      addLog("Marked as new messages (not at bottom)");
    } else if (autoScrollOnNew) {
      setTimeout(() => scroll.scrollToBottom("smooth"), 50);
    }
  };

  const simulateBulkMessages = () => {
    const wasAtBottom = scroll.isAtBottom;
    const newMessages = [];
    for (let i = 0; i < 5; i++) {
      newMessages.push({
        id: `msg-${messages.length + i}`,
        sender: i % 2 === 0 ? "bot" : "user",
        content: `Bulk message ${i + 1} of 5`,
        timestamp: new Date().toISOString(),
      });
    }
    setMessages(prev => [...prev, ...newMessages]);
    addLog("Added 5 bulk messages");

    if (!wasAtBottom) {
      scroll.markNewMessages();
      addLog("Marked as new messages (not at bottom)");
    } else if (autoScrollOnNew) {
      setTimeout(() => scroll.scrollToBottom("smooth"), 50);
    }
  };

  return (
    <div style={{ display: "flex", gap: "16px", width: "900px" }}>
      {/* Chat Area */}
      <div style={{ flex: 1, height: "600px", border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden", display: "grid", gridTemplateRows: "auto 1fr auto" }}>
        {/* Header with status */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--chatter-border)", background: "var(--chatter-bg-secondary)" }}>
          <div style={{ fontWeight: 600, color: "var(--chatter-text)" }}>Scroll Behavior Test</div>
          <div style={{ fontSize: "12px", color: "var(--chatter-text-muted)", display: "flex", gap: "16px", marginTop: "4px" }}>
            <span>Position: {scroll.isAtBottom ? "At bottom" : "Scrolled up"}</span>
            <span>New messages: {scroll.hasNewMessages ? "Yes" : "No"}</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <ChatContainer ref={containerRef} style={{ position: "absolute", inset: 0, overflowY: "auto" }}>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                content={msg.content}
                timestamp={msg.timestamp}
                showAvatar
                deliveryStatus={(msg as any).deliveryStatus}
              />
            ))}
          </ChatContainer>

          {/* New messages indicator */}
          {!scroll.isAtBottom && scroll.hasNewMessages && (
            <button
              onClick={() => {
                scroll.scrollToBottom("smooth");
                scroll.clearNewMessages();
                addLog("Clicked new messages button");
              }}
              style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "8px 16px",
                background: "var(--chatter-primary)",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                zIndex: 10,
              }}
            >
              New messages ↓
            </button>
          )}

          {/* Scroll to bottom button (always visible when scrolled up) */}
          {!scroll.isAtBottom && !scroll.hasNewMessages && (
            <button
              onClick={() => {
                scroll.scrollToBottom("smooth");
                addLog("Clicked scroll to bottom");
              }}
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                padding: "8px",
                background: "var(--chatter-bg-secondary)",
                color: "var(--chatter-text)",
                border: "1px solid var(--chatter-border)",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "16px",
                width: "36px",
                height: "36px",
                zIndex: 10,
              }}
            >
              ↓
            </button>
          )}
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid var(--chatter-border)", background: "var(--chatter-bg-secondary)" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--chatter-border)", borderRadius: "6px", fontSize: "14px", background: "var(--chatter-bg)", color: "var(--chatter-text)" }}
          />
          <button
            onClick={handleSend}
            style={{ padding: "8px 16px", background: "var(--chatter-primary)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div style={{ width: "280px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Test Actions */}
        <div style={{ padding: "12px", background: "var(--chatter-bg-secondary)", borderRadius: "8px", border: "1px solid var(--chatter-border)" }}>
          <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--chatter-text)" }}>Test Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={simulateIncomingMessage}
              style={{ padding: "8px", background: "var(--chatter-primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
            >
              Simulate Incoming Message
            </button>
            <button
              onClick={simulateBulkMessages}
              style={{ padding: "8px", background: "var(--chatter-primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
            >
              Add 5 Messages at Once
            </button>
            <button
              onClick={() => {
                scroll.scrollToBottom("smooth");
                addLog("Manual scroll to bottom");
              }}
              style={{ padding: "8px", background: "var(--chatter-bg)", color: "var(--chatter-text)", border: "1px solid var(--chatter-border)", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
            >
              Scroll to Bottom
            </button>
            <button
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTop = 0;
                  addLog("Scrolled to top");
                }
              }}
              style={{ padding: "8px", background: "var(--chatter-bg)", color: "var(--chatter-text)", border: "1px solid var(--chatter-border)", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
            >
              Scroll to Top
            </button>
          </div>
        </div>

        {/* Settings */}
        <div style={{ padding: "12px", background: "var(--chatter-bg-secondary)", borderRadius: "8px", border: "1px solid var(--chatter-border)" }}>
          <div style={{ fontWeight: 600, marginBottom: "12px", color: "var(--chatter-text)" }}>Settings</div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--chatter-text)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoScrollOnNew}
              onChange={(e) => {
                setAutoScrollOnNew(e.target.checked);
                addLog(`Auto-scroll ${e.target.checked ? "enabled" : "disabled"}`);
              }}
            />
            Auto-scroll on new messages (when at bottom)
          </label>
        </div>

        {/* Behavior Guide */}
        <div style={{ padding: "12px", background: "var(--chatter-bg-secondary)", borderRadius: "8px", border: "1px solid var(--chatter-border)" }}>
          <div style={{ fontWeight: 600, marginBottom: "8px", color: "var(--chatter-text)" }}>Expected Behaviors</div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", fontSize: "12px", color: "var(--chatter-text-muted)", lineHeight: 1.6 }}>
            <li>Scroll up → position is kept</li>
            <li>New message while scrolled up → indicator shown</li>
            <li>At bottom + new message → auto-scroll</li>
            <li>User sends message → always scroll to bottom</li>
            <li>Click indicator → scroll to bottom</li>
          </ul>
        </div>

        {/* Event Log */}
        <div style={{ padding: "12px", background: "var(--chatter-bg-secondary)", borderRadius: "8px", border: "1px solid var(--chatter-border)", flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 600, marginBottom: "8px", color: "var(--chatter-text)" }}>Event Log</div>
          <div style={{ fontSize: "11px", fontFamily: "monospace", color: "var(--chatter-text-muted)", maxHeight: "150px", overflow: "auto" }}>
            {scrollLog.length === 0 ? (
              <div style={{ color: "var(--chatter-text-muted)" }}>Events will appear here...</div>
            ) : (
              scrollLog.map((log, i) => (
                <div key={i} style={{ padding: "2px 0", borderBottom: "1px solid var(--chatter-border)" }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ScrollBehavior: StoryObj = {
  render: () => <ScrollBehaviorTest />,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story: `
**Test scroll behaviors:**

1. **Position keeping**: Scroll up, then add messages - your position should be preserved
2. **New message indicator**: Scroll up, click "Simulate Incoming Message" - see the indicator
3. **Auto-scroll when at bottom**: Stay at bottom, add messages - should auto-scroll
4. **User message scroll**: Send a message - always scrolls to bottom regardless of position

The event log shows what's happening in real-time.
        `,
      },
    },
  },
};

// Long conversation for scroll testing
function LongConversation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messages = generateMessages(50);

  return (
    <div style={{ height: "500px", maxWidth: "700px", border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--chatter-border)", background: "var(--chatter-bg-secondary)", fontWeight: 600, color: "var(--chatter-text)" }}>
        50 Messages - Scroll Performance Test
      </div>
      <ChatContainer ref={containerRef} style={{ height: "calc(100% - 48px)" }}>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            timestamp={msg.timestamp}
            showAvatar
          />
        ))}
      </ChatContainer>
    </div>
  );
}

export const LongConversationScroll: StoryObj = {
  render: () => <LongConversation />,
  parameters: {
    docs: {
      description: {
        story: "A long conversation with 50 messages to test scroll performance.",
      },
    },
  },
};

// Chat with rich content and collapsibles
function RichContentChat() {
  const orderItems: CollapsibleItem[] = [
    {
      key: "order-1",
      header: "Order #98765",
      body: (
        <div style={{ fontSize: "14px" }}>
          <p><strong>Status:</strong> Shipped</p>
          <p><strong>Tracking:</strong> 1Z999AA10123456784</p>
          <p><strong>Items:</strong> 2 items</p>
          <p><strong>Total:</strong> $89.99</p>
        </div>
      ),
      badge: "Shipped",
    },
  ];

  const codeBlocks: ContentBlock[] = [
    {
      type: "text",
      content: "Here's how to track your order via our API:",
    },
    {
      type: "code",
      language: "bash",
      content: "curl -X GET https://api.example.com/orders/98765",
    },
    {
      type: "text",
      content: "Response:",
    },
    {
      type: "code",
      language: "json",
      content: `{
  "orderId": "98765",
  "status": "shipped",
  "carrier": "UPS",
  "estimatedDelivery": "2024-01-20"
}`,
    },
  ];

  return (
    <div style={{ height: "600px", maxWidth: "700px", border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--chatter-border)", background: "var(--chatter-bg-secondary)", fontWeight: 600, color: "var(--chatter-text)" }}>
        Rich Content Chat
      </div>
      <ChatContainer style={{ height: "calc(100% - 48px)" }}>
        <ChatBubble
          sender="user"
          content="Where's my order #98765?"
          timestamp={new Date(Date.now() - 180000).toISOString()}
          showAvatar
          deliveryStatus="delivered"
        />

        <div className="chatter-bubble-container bot">
          <div className="chatter-avatar">
            <div className="chatter-avatar-placeholder">S</div>
          </div>
          <div className="chatter-bubble bot" style={{ flex: 1, maxWidth: "85%" }}>
            <p style={{ margin: "0 0 12px 0" }}>
              I found your order! It's been shipped and is on its way.
            </p>
            <CollapsibleSection
              title="Order Details"
              items={orderItems}
              defaultExpanded={true}
            />
            <div className="chatter-bubble-footer">
              <span className="chatter-timestamp">
                {new Date(Date.now() - 120000).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <ChatBubble
          sender="user"
          content="Can I track it programmatically?"
          timestamp={new Date(Date.now() - 60000).toISOString()}
          showAvatar
          deliveryStatus="delivered"
        />

        <div className="chatter-bubble-container bot">
          <div className="chatter-avatar">
            <div className="chatter-avatar-placeholder">S</div>
          </div>
          <div className="chatter-bubble bot" style={{ flex: 1, maxWidth: "85%" }}>
            <RichContent blocks={codeBlocks} />
            <div className="chatter-bubble-footer">
              <span className="chatter-timestamp">
                {new Date().toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      </ChatContainer>
    </div>
  );
}

export const RichContentChatStory: StoryObj = {
  render: () => <RichContentChat />,
  parameters: {
    docs: {
      description: {
        story: "Chat with rich content including collapsible sections and code blocks.",
      },
    },
  },
};

// Streaming simulation
function StreamingChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "user",
      content: "Tell me about your shipping options",
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
  ]);

  const fullResponse = `We offer several shipping options to meet your needs:

**Standard Shipping (5-7 business days)**
- Free for orders over $50
- $5.99 for orders under $50

**Express Shipping (2-3 business days)**
- $12.99 flat rate

**Next Day Delivery**
- $24.99 flat rate
- Order by 2 PM for same-day processing

All orders include tracking and insurance. Let me know if you have any questions!`;

  const simulateStreaming = () => {
    setIsStreaming(true);
    setStreamedContent("");

    let index = 0;
    const interval = setInterval(() => {
      if (index < fullResponse.length) {
        setStreamedContent(fullResponse.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            id: "2",
            sender: "bot",
            content: fullResponse,
            timestamp: new Date().toISOString(),
          },
        ]);
        setStreamedContent("");
      }
    }, 20);
  };

  return (
    <div style={{ height: "500px", maxWidth: "700px", border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--chatter-border)", background: "var(--chatter-bg-secondary)" }}>
        <span style={{ fontWeight: 600, color: "var(--chatter-text)" }}>Streaming Demo</span>
        <button
          onClick={simulateStreaming}
          disabled={isStreaming}
          style={{
            padding: "6px 12px",
            background: isStreaming ? "var(--chatter-text-muted)" : "var(--chatter-primary)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isStreaming ? "not-allowed" : "pointer",
            fontSize: "12px",
          }}
        >
          {isStreaming ? "Streaming..." : "Simulate Response"}
        </button>
      </div>
      <ChatContainer style={{ height: "calc(100% - 48px)" }}>
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            timestamp={msg.timestamp}
            showAvatar
          />
        ))}

        {isStreaming && (
          <div className="chatter-bubble-container bot">
            <div className="chatter-avatar">
              <div className="chatter-avatar-placeholder">B</div>
            </div>
            <div className="chatter-bubble bot">
              <RichContent
                blocks={[{ type: "text", content: streamedContent }]}
                isStreaming
              />
            </div>
          </div>
        )}
      </ChatContainer>
    </div>
  );
}

export const StreamingDemo: StoryObj = {
  render: () => <StreamingChat />,
  parameters: {
    docs: {
      description: {
        story: 'Click "Simulate Response" to see streaming text animation.',
      },
    },
  },
};

// Multiple chat windows
function MultipleChatWindows() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px" }}>
      <div style={{ border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: "var(--chatter-bg-secondary)", borderBottom: "1px solid var(--chatter-border)", fontSize: "14px", fontWeight: 600, color: "var(--chatter-text)" }}>
          Sales Chat
        </div>
        <ChatContainer style={{ height: "300px" }}>
          <ChatBubble sender="user" content="What's on sale?" timestamp={new Date().toISOString()} showAvatar />
          <ChatBubble sender="bot" content="We have 20% off all winter items!" timestamp={new Date().toISOString()} showAvatar />
        </ChatContainer>
      </div>

      <div style={{ border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "8px 12px", background: "var(--chatter-bg-secondary)", borderBottom: "1px solid var(--chatter-border)", fontSize: "14px", fontWeight: 600, color: "var(--chatter-text)" }}>
          Support Chat
        </div>
        <ChatContainer style={{ height: "300px" }}>
          <ChatBubble sender="user" content="My order is late" timestamp={new Date().toISOString()} showAvatar />
          <ChatBubble sender="bot" content="I'm sorry to hear that. Let me check the status." timestamp={new Date().toISOString()} showAvatar />
        </ChatContainer>
      </div>
    </div>
  );
}

export const MultipleChatDemo: StoryObj = {
  render: () => <MultipleChatWindows />,
  parameters: {
    docs: {
      description: {
        story: "Multiple chat windows side by side.",
      },
    },
  },
};
