import React from "react";
import type { Preview } from "@storybook/react";

// Import the auto theme which supports data-theme switching
import "../packages/themes/auto.css";

// Side-by-side theme comparison decorator
const withThemeComparison = (Story: React.ComponentType) => {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        gap: "24px",
        padding: "16px",
        minWidth: "fit-content",
      },
    },
    // Light theme panel
    React.createElement(
      "div",
      {
        style: {
          flex: "1",
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#737373",
            paddingBottom: "8px",
            borderBottom: "1px solid #e5e5e5",
          },
        },
        "Light Mode"
      ),
      React.createElement(
        "div",
        {
          "data-theme": "light",
          style: {
            background: "#ffffff",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid #e5e5e5",
          },
        },
        React.createElement(Story, null)
      )
    ),
    // Dark theme panel
    React.createElement(
      "div",
      {
        style: {
          flex: "1",
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            fontSize: "12px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#a3a3a3",
            paddingBottom: "8px",
            borderBottom: "1px solid #404040",
          },
        },
        "Dark Mode"
      ),
      React.createElement(
        "div",
        {
          "data-theme": "dark",
          style: {
            background: "#171717",
            borderRadius: "8px",
            padding: "16px",
            border: "1px solid #404040",
          },
        },
        React.createElement(Story, null)
      )
    )
  );
};

const preview: Preview = {
  parameters: {
    layout: "centered",
  },
  decorators: [withThemeComparison],
};

export default preview;
