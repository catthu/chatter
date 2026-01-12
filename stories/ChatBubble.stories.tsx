import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChatBubble } from "@chatter/react";

const meta: Meta<typeof ChatBubble> = {
  title: "Components/ChatBubble",
  component: ChatBubble,
  tags: ["autodocs"],
  argTypes: {
    sender: {
      control: "select",
      options: ["user", "bot", "support", "system"],
    },
    deliveryStatus: {
      control: "select",
      options: [undefined, "pending", "delivered", "failed"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChatBubble>;

export const UserMessage: Story = {
  args: {
    sender: "user",
    content: "Hi, I have a question about my order.",
    timestamp: new Date().toISOString(),
    showAvatar: true,
  },
};

export const BotMessage: Story = {
  args: {
    sender: "bot",
    content: "Hello! I'd be happy to help you with your order. Could you provide your order number?",
    timestamp: new Date().toISOString(),
    showAvatar: true,
  },
};

export const LongMessage: Story = {
  args: {
    sender: "bot",
    content: `Thank you for reaching out! Here's what I found about your order:

Your package was shipped on Monday and is currently in transit. The estimated delivery date is Thursday.

You can track your package using the tracking number in your confirmation email. Let me know if you need anything else!`,
    timestamp: new Date().toISOString(),
    showAvatar: true,
  },
};

export const WithDeliveryStatus: Story = {
  args: {
    sender: "user",
    content: "Sending my message...",
    timestamp: new Date().toISOString(),
    showAvatar: true,
    deliveryStatus: "pending",
  },
};

export const DeliveredMessage: Story = {
  args: {
    sender: "user",
    content: "This message was delivered!",
    timestamp: new Date().toISOString(),
    showAvatar: true,
    deliveryStatus: "delivered",
  },
};

export const FailedMessage: Story = {
  args: {
    sender: "user",
    content: "This message failed to send.",
    timestamp: new Date().toISOString(),
    showAvatar: true,
    deliveryStatus: "failed",
  },
};

export const GroupedMessages: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <ChatBubble
        sender="user"
        content="Hey!"
        timestamp={new Date().toISOString()}
        showAvatar={true}
      />
      <ChatBubble
        sender="user"
        content="Quick question"
        timestamp={new Date().toISOString()}
        showAvatar={true}
        isGrouped={true}
      />
      <ChatBubble
        sender="user"
        content="Do you ship internationally?"
        timestamp={new Date().toISOString()}
        showAvatar={true}
        isGrouped={true}
      />
    </div>
  ),
};

export const WithAttachments: Story = {
  args: {
    sender: "user",
    content: "Here's my receipt",
    timestamp: new Date().toISOString(),
    showAvatar: true,
    attachments: [
      {
        id: "1",
        type: "application/pdf",
        name: "receipt.pdf",
        url: "#",
        size: 1024 * 256, // 256 KB
      },
    ],
  },
};

export const Conversation: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: "600px",
      }}
    >
      <ChatBubble
        sender="user"
        content="Hi, I'd like to return an item"
        timestamp={new Date(Date.now() - 120000).toISOString()}
        showAvatar={true}
      />
      <ChatBubble
        sender="bot"
        content="I can help with that! What's the reason for the return?"
        timestamp={new Date(Date.now() - 60000).toISOString()}
        showAvatar={true}
      />
      <ChatBubble
        sender="user"
        content="It doesn't fit properly"
        timestamp={new Date().toISOString()}
        showAvatar={true}
        deliveryStatus="delivered"
      />
    </div>
  ),
};

export const CustomSender: Story = {
  args: {
    sender: "support",
    content: "A support agent will be with you shortly.",
    timestamp: new Date().toISOString(),
    showAvatar: true,
  },
};
