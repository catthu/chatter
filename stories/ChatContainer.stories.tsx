import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChatContainer,
  ChatBubble,
  RichContent,
  CollapsibleSection,
  type CollapsibleItem,
} from "@chatter/react";
import type { ContentBlock } from "@chatter/core";

const meta: Meta<typeof ChatContainer> = {
  title: "Components/ChatContainer",
  component: ChatContainer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChatContainer>;

export const Empty: Story = {
  args: {
    children: (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          color: "#737373",
        }}
      >
        No messages yet. Start a conversation!
      </div>
    ),
  },
};

export const WithMessages: Story = {
  args: {
    children: (
      <>
        <ChatBubble
          sender="user"
          content="Hi, I need help with my account"
          timestamp={new Date().toISOString()}
          showAvatar
        />
        <ChatBubble
          sender="bot"
          content="Hello! I'd be happy to help. What seems to be the issue?"
          timestamp={new Date().toISOString()}
          showAvatar
        />
      </>
    ),
    style: { maxWidth: "600px", height: "300px" },
  },
};

// Customer Support Chat Example
function SupportChatExample() {
  const orderDetails: CollapsibleItem[] = [
    {
      key: "order",
      header: "Order #98765",
      body: (
        <div style={{ fontSize: "14px" }}>
          <p><strong>Status:</strong> Processing</p>
          <p><strong>Items:</strong> 2 items</p>
          <p><strong>Total:</strong> $59.99</p>
        </div>
      ),
      badge: "Found",
    },
  ];

  return (
    <ChatContainer style={{ maxWidth: "700px", height: "500px" }}>
      <ChatBubble
        sender="user"
        content="Hi, I placed an order yesterday but haven't received a confirmation email. Order #98765"
        timestamp={new Date(Date.now() - 120000).toISOString()}
        showAvatar
        deliveryStatus="delivered"
      />

      <div className="chatter-bubble-container bot">
        <div className="chatter-avatar">
          <div className="chatter-avatar-placeholder">S</div>
        </div>
        <div className="chatter-bubble bot" style={{ flex: 1, maxWidth: "85%" }}>
          <p style={{ margin: "0 0 12px 0" }}>
            I found your order! It looks like there was a delay in sending the confirmation.
            I've resent it to your email address.
          </p>
          <CollapsibleSection
            title="Order Details"
            items={orderDetails}
            defaultExpanded={true}
          />
          <div className="chatter-bubble-footer">
            <span className="chatter-timestamp">
              {new Date(Date.now() - 60000).toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <ChatBubble
        sender="user"
        content="Great, thank you! When will it ship?"
        timestamp={new Date().toISOString()}
        showAvatar
        deliveryStatus="pending"
      />
    </ChatContainer>
  );
}

export const SupportChat: Story = {
  render: () => <SupportChatExample />,
};

// Documentation Chat Example
function DocsChatExample() {
  const codeBlocks: ContentBlock[] = [
    {
      type: "text",
      content: "To install the package, run:",
    },
    {
      type: "code",
      language: "bash",
      content: "npm install @example/sdk",
    },
    {
      type: "text",
      content: "Then import it in your project:",
    },
    {
      type: "code",
      language: "javascript",
      content: `import { Client } from '@example/sdk';

const client = new Client({
  apiKey: process.env.API_KEY
});`,
    },
  ];

  return (
    <ChatContainer style={{ maxWidth: "700px", height: "500px" }}>
      <ChatBubble
        sender="user"
        content="How do I get started with the SDK?"
        timestamp={new Date(Date.now() - 60000).toISOString()}
        showAvatar
        deliveryStatus="delivered"
      />

      <div className="chatter-bubble-container bot">
        <div className="chatter-avatar">
          <div className="chatter-avatar-placeholder">D</div>
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
  );
}

export const DocsChat: Story = {
  render: () => <DocsChatExample />,
};

// Streaming Example
function StreamingExample() {
  const partialContent: ContentBlock[] = [
    {
      type: "text",
      content: "Looking up your information",
    },
  ];

  return (
    <ChatContainer style={{ maxWidth: "600px", height: "300px" }}>
      <ChatBubble
        sender="user"
        content="What's the status of my refund?"
        timestamp={new Date().toISOString()}
        showAvatar
        deliveryStatus="delivered"
      />
      <div className="chatter-bubble-container bot">
        <div className="chatter-avatar">
          <div className="chatter-avatar-placeholder">B</div>
        </div>
        <div className="chatter-bubble bot">
          <RichContent blocks={partialContent} isStreaming />
        </div>
      </div>
    </ChatContainer>
  );
}

export const Streaming: Story = {
  render: () => <StreamingExample />,
};

// Multi-turn Conversation
function ConversationExample() {
  return (
    <ChatContainer style={{ maxWidth: "600px", height: "450px" }}>
      <ChatBubble
        sender="user"
        content="Do you have the blue version in stock?"
        timestamp={new Date(Date.now() - 300000).toISOString()}
        showAvatar
      />
      <ChatBubble
        sender="bot"
        content="Yes! The blue version is available in sizes S, M, and L. Would you like me to check availability for a specific size?"
        timestamp={new Date(Date.now() - 240000).toISOString()}
        showAvatar
      />
      <ChatBubble
        sender="user"
        content="Medium please"
        timestamp={new Date(Date.now() - 180000).toISOString()}
        showAvatar
      />
      <ChatBubble
        sender="bot"
        content="Great news! We have 5 units of the blue version in Medium. Would you like me to add it to your cart?"
        timestamp={new Date(Date.now() - 120000).toISOString()}
        showAvatar
      />
      <ChatBubble
        sender="user"
        content="Yes, add it please"
        timestamp={new Date(Date.now() - 60000).toISOString()}
        showAvatar
        deliveryStatus="delivered"
      />
      <ChatBubble
        sender="bot"
        content="Done! I've added the Blue Widget (Medium) to your cart. Your cart total is now $34.99. Ready to checkout?"
        timestamp={new Date().toISOString()}
        showAvatar
      />
    </ChatContainer>
  );
}

export const Conversation: Story = {
  render: () => <ConversationExample />,
};
