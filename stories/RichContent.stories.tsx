import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { RichContent } from "@chatter/react";
import type { ContentBlock } from "@chatter/core";

const meta: Meta<typeof RichContent> = {
  title: "Components/RichContent",
  component: RichContent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RichContent>;

const textBlocks: ContentBlock[] = [
  {
    type: "text",
    content: "Here's a simple text response with some helpful information.",
  },
];

const codeBlocks: ContentBlock[] = [
  {
    type: "text",
    content: "Here's an example configuration:",
  },
  {
    type: "code",
    language: "json",
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`,
  },
  {
    type: "text",
    content: "Save this as package.json in your project root.",
  },
];

const mixedBlocks: ContentBlock[] = [
  {
    type: "text",
    content: "There are two ways to configure this:",
  },
  {
    type: "code",
    language: "yaml",
    content: `# Option 1: Using environment variables
DATABASE_URL: postgres://localhost:5432/mydb
REDIS_URL: redis://localhost:6379`,
  },
  {
    type: "text",
    content: "Or using a config file:",
  },
  {
    type: "code",
    language: "json",
    content: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb"
  }
}`,
  },
];

const longCodeBlock: ContentBlock[] = [
  {
    type: "text",
    content: "Here's a complete example:",
  },
  {
    type: "code",
    language: "typescript",
    content: `interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserService {
  getUser(id: string): Promise<User | null>;
  createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

class UserServiceImpl implements UserService {
  private users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }
}`,
  },
];

export const TextOnly: Story = {
  args: {
    blocks: textBlocks,
  },
};

export const WithCode: Story = {
  args: {
    blocks: codeBlocks,
  },
};

export const MixedContent: Story = {
  args: {
    blocks: mixedBlocks,
  },
};

export const LongCode: Story = {
  args: {
    blocks: longCodeBlock,
  },
};

export const Streaming: Story = {
  args: {
    blocks: [
      {
        type: "text",
        content: "Generating response",
      },
    ],
    isStreaming: true,
  },
};

export const WithImage: Story = {
  args: {
    blocks: [
      {
        type: "text",
        content: "Here's the image you requested:",
      },
      {
        type: "image",
        url: "https://via.placeholder.com/400x200",
        alt: "Placeholder image",
      },
      {
        type: "text",
        content: "Let me know if you need a different size.",
      },
    ],
  },
};

export const MultipleTextBlocks: Story = {
  args: {
    blocks: [
      {
        type: "text",
        content: "First, make sure you have the prerequisites installed.",
      },
      {
        type: "text",
        content: "Next, clone the repository and install dependencies.",
      },
      {
        type: "text",
        content: "Finally, run the development server to get started.",
      },
    ],
  },
};
