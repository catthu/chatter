import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CollapsibleSection, type CollapsibleItem } from "@chatter/react";

const meta: Meta<typeof CollapsibleSection> = {
  title: "Components/CollapsibleSection",
  component: CollapsibleSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CollapsibleSection>;

const orderItems: CollapsibleItem[] = [
  {
    key: "item-1",
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
  {
    key: "item-2",
    header: "Order #12344",
    body: (
      <div style={{ fontSize: "14px" }}>
        <p><strong>Status:</strong> Delivered</p>
        <p><strong>Items:</strong> 1 item</p>
        <p><strong>Total:</strong> $24.99</p>
      </div>
    ),
    badge: "Delivered",
  },
  {
    key: "item-3",
    header: "Order #12343",
    body: (
      <div style={{ fontSize: "14px" }}>
        <p><strong>Status:</strong> Delivered</p>
        <p><strong>Items:</strong> 2 items</p>
        <p><strong>Total:</strong> $149.99</p>
      </div>
    ),
    badge: "Delivered",
  },
];

const faqItems: CollapsibleItem[] = [
  {
    key: "faq-1",
    header: "How do I track my order?",
    body: (
      <p style={{ margin: 0, fontSize: "14px" }}>
        You can track your order by clicking on the tracking link in your shipping confirmation email,
        or by visiting the Orders section in your account.
      </p>
    ),
  },
  {
    key: "faq-2",
    header: "What is your return policy?",
    body: (
      <p style={{ margin: 0, fontSize: "14px" }}>
        We accept returns within 30 days of purchase. Items must be unused and in original packaging.
        Refunds are processed within 5-7 business days.
      </p>
    ),
  },
  {
    key: "faq-3",
    header: "Do you ship internationally?",
    body: (
      <p style={{ margin: 0, fontSize: "14px" }}>
        Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times
        vary by location.
      </p>
    ),
  },
];

const attachmentItems: CollapsibleItem[] = [
  {
    key: "file-1",
    header: "invoice_2024.pdf",
    body: (
      <div style={{ fontSize: "14px", color: "#666" }}>
        <p>PDF Document • 245 KB</p>
        <p>Uploaded: Jan 15, 2024</p>
      </div>
    ),
    badge: "PDF",
  },
  {
    key: "file-2",
    header: "product_photo.jpg",
    body: (
      <div style={{ fontSize: "14px", color: "#666" }}>
        <p>Image • 1.2 MB</p>
        <p>Uploaded: Jan 15, 2024</p>
      </div>
    ),
    badge: "Image",
  },
];

export const Default: Story = {
  args: {
    title: "Recent Orders",
    items: orderItems,
    defaultExpanded: true,
  },
};

export const Collapsed: Story = {
  args: {
    title: "Recent Orders",
    items: orderItems,
    defaultExpanded: false,
  },
};

export const WithExpandControls: Story = {
  args: {
    title: "Recent Orders",
    items: orderItems,
    defaultExpanded: true,
    showExpandAllControls: true,
  },
};

export const FAQ: Story = {
  args: {
    title: "Frequently Asked Questions",
    items: faqItems,
    defaultExpanded: true,
    defaultIndividualExpanded: false,
  },
};

export const Attachments: Story = {
  args: {
    title: "Attachments",
    items: attachmentItems,
    defaultExpanded: true,
  },
};

export const NoTitle: Story = {
  args: {
    items: faqItems,
    defaultExpanded: true,
  },
};

export const SingleItem: Story = {
  args: {
    title: "Shipping Details",
    items: [
      {
        key: "shipping",
        header: "Standard Shipping",
        body: (
          <div style={{ fontSize: "14px" }}>
            <p>Estimated delivery: 3-5 business days</p>
            <p>Tracking number: 1Z999AA10123456784</p>
          </div>
        ),
        badge: "In Transit",
      },
    ],
  },
};

export const ManyItems: Story = {
  args: {
    title: "Notification Settings",
    items: [
      { key: "email", header: "Email Notifications", body: <p>Receive updates via email</p> },
      { key: "sms", header: "SMS Notifications", body: <p>Receive updates via text</p> },
      { key: "push", header: "Push Notifications", body: <p>Receive updates on your device</p> },
      { key: "marketing", header: "Marketing Updates", body: <p>Receive promotional offers</p> },
      { key: "newsletter", header: "Newsletter", body: <p>Weekly digest of new products</p> },
      { key: "security", header: "Security Alerts", body: <p>Important account security updates</p> },
    ],
    showExpandAllControls: true,
  },
};

// Controlled example
function ControlledExample() {
  const [expanded, setExpanded] = useState(true);
  const [itemState, setItemState] = useState<Record<string, boolean>>({});

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? "Collapse Section" : "Expand Section"}
        </button>
      </div>
      <CollapsibleSection
        title="Controlled Section"
        items={faqItems}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        individualExpandedState={itemState}
        onToggleIndividual={(key) =>
          setItemState((prev) => ({ ...prev, [key]: !prev[key] }))
        }
        showExpandAllControls
      />
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledExample />,
};
