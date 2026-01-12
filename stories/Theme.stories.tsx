import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ChatContainer,
  ChatBubble,
  RichContent,
  CollapsibleSection,
  useTheme,
  type CollapsibleItem,
} from "@chatter/react";
import type { ContentBlock } from "@chatter/core";

const meta: Meta = {
  title: "Theme/Dark Mode",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
The @chatter SDK supports light and dark themes out of the box.

## Theme Files

- **auto.css** (Recommended) - Automatically switches based on system preference, with manual override via \`data-theme\` attribute
- **default.css** - Light theme only
- **dark.css** - Dark theme only

## Usage

\`\`\`tsx
// Recommended: Auto-switching theme
import '@chatter/themes/auto.css';

// Or import specific themes
import '@chatter/themes/default.css'; // Light only
import '@chatter/themes/dark.css';    // Dark only
\`\`\`

## Manual Theme Control

Set \`data-theme\` attribute on any parent element:

\`\`\`html
<html data-theme="dark">  <!-- Force dark -->
<html data-theme="light"> <!-- Force light -->
<html>                    <!-- Follow system preference -->
\`\`\`

## React Hook

Use the \`useTheme\` hook for programmatic control:

\`\`\`tsx
import { useTheme } from '@chatter/react';

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Toggle ({resolvedTheme})</button>;
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Theme Toggle Demo
function ThemeToggleDemo() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme({
    storageKey: null, // Don't persist in Storybook
  });

  const orderItems: CollapsibleItem[] = [
    {
      key: "order",
      header: "Order #12345",
      body: (
        <div style={{ fontSize: "14px" }}>
          <p><strong>Status:</strong> Shipped</p>
          <p><strong>Items:</strong> 3 items</p>
          <p><strong>Total:</strong> $89.99</p>
        </div>
      ),
      badge: "Shipped",
    },
  ];

  const codeBlocks: ContentBlock[] = [
    {
      type: "text",
      content: "Here's how to install the SDK:",
    },
    {
      type: "code",
      language: "bash",
      content: "npm install @chatter/react @chatter/themes",
    },
  ];

  return (
    <div style={{ width: "700px" }}>
      {/* Theme Controls */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        padding: "12px",
        background: "var(--chatter-bg-secondary)",
        borderRadius: "8px",
      }}>
        <span style={{ color: "var(--chatter-text)", marginRight: "8px" }}>
          Theme: <strong>{resolvedTheme}</strong>
        </span>
        <button
          onClick={() => setTheme("light")}
          style={{
            padding: "4px 12px",
            background: theme === "light" ? "var(--chatter-primary)" : "transparent",
            color: theme === "light" ? "white" : "var(--chatter-text)",
            border: "1px solid var(--chatter-border)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          style={{
            padding: "4px 12px",
            background: theme === "dark" ? "var(--chatter-primary)" : "transparent",
            color: theme === "dark" ? "white" : "var(--chatter-text)",
            border: "1px solid var(--chatter-border)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("system")}
          style={{
            padding: "4px 12px",
            background: theme === "system" ? "var(--chatter-primary)" : "transparent",
            color: theme === "system" ? "white" : "var(--chatter-text)",
            border: "1px solid var(--chatter-border)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          System
        </button>
        <button
          onClick={toggleTheme}
          style={{
            padding: "4px 12px",
            marginLeft: "auto",
            background: "var(--chatter-primary)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Toggle
        </button>
      </div>

      {/* Chat Demo */}
      <div style={{ border: "1px solid var(--chatter-border)", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{
          padding: "12px 16px",
          background: "var(--chatter-bg-secondary)",
          borderBottom: "1px solid var(--chatter-border)",
          fontWeight: 600,
          color: "var(--chatter-text)",
        }}>
          Support Chat
        </div>
        <ChatContainer style={{ height: "400px" }}>
          <ChatBubble
            sender="user"
            content="Hi, where's my order?"
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
                I found your order! Here are the details:
              </p>
              <CollapsibleSection
                title="Order Information"
                items={orderItems}
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
            content="How do I integrate this into my app?"
            timestamp={new Date(Date.now() - 30000).toISOString()}
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
    </div>
  );
}

export const ThemeToggle: StoryObj = {
  render: () => <ThemeToggleDemo />,
  parameters: {
    docs: {
      description: {
        story: "Interactive demo showing theme switching with the useTheme hook. Use the Storybook toolbar to also switch themes globally.",
      },
    },
  },
};

// All Components in Dark Mode
function AllComponentsDemo() {
  const orderItems: CollapsibleItem[] = [
    {
      key: "1",
      header: "Order #11111",
      body: <p>Delivered on Jan 10</p>,
      badge: "Delivered",
    },
    {
      key: "2",
      header: "Order #22222",
      body: <p>In transit</p>,
      badge: "Shipping",
    },
  ];

  const codeContent: ContentBlock[] = [
    { type: "text", content: "Configuration example:" },
    {
      type: "code",
      language: "json",
      content: `{
  "theme": "dark",
  "primaryColor": "#3b82f6"
}`,
    },
  ];

  return (
    <div style={{ width: "600px" }}>
      <ChatContainer style={{ height: "500px" }}>
        <ChatBubble
          sender="user"
          content="Testing all components"
          timestamp={new Date().toISOString()}
          showAvatar
          deliveryStatus="pending"
        />
        <ChatBubble
          sender="user"
          content="Message delivered!"
          timestamp={new Date().toISOString()}
          showAvatar
          deliveryStatus="delivered"
        />
        <ChatBubble
          sender="user"
          content="Message failed"
          timestamp={new Date().toISOString()}
          showAvatar
          deliveryStatus="failed"
        />
        <ChatBubble
          sender="bot"
          content="Here's a bot response with all the components:"
          timestamp={new Date().toISOString()}
          showAvatar
        />
        <div className="chatter-bubble-container bot">
          <div className="chatter-avatar">
            <div className="chatter-avatar-placeholder">B</div>
          </div>
          <div className="chatter-bubble bot" style={{ flex: 1, maxWidth: "85%" }}>
            <CollapsibleSection
              title="Recent Orders"
              items={orderItems}
              defaultExpanded={true}
              showExpandAllControls
            />
          </div>
        </div>
        <div className="chatter-bubble-container bot">
          <div className="chatter-avatar">
            <div className="chatter-avatar-placeholder">B</div>
          </div>
          <div className="chatter-bubble bot" style={{ flex: 1, maxWidth: "85%" }}>
            <RichContent blocks={codeContent} />
          </div>
        </div>
        <div className="chatter-bubble-container bot">
          <div className="chatter-avatar">
            <div className="chatter-avatar-placeholder">B</div>
          </div>
          <div className="chatter-bubble bot">
            <RichContent
              blocks={[{ type: "text", content: "Loading" }]}
              isStreaming
            />
          </div>
        </div>
      </ChatContainer>
    </div>
  );
}

export const AllComponents: StoryObj = {
  render: () => <AllComponentsDemo />,
  parameters: {
    docs: {
      description: {
        story: "All chat components displayed together. Use the Storybook toolbar to switch between light and dark themes.",
      },
    },
  },
};
