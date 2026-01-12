import type {
  BaseMessage,
  MessageStore,
  MessageStoreListener,
  Unsubscribe,
} from '../types';

/**
 * In-memory message store implementation.
 * Manages messages with change notifications.
 */
export class InMemoryMessageStore<TMessage extends BaseMessage>
  implements MessageStore<TMessage>
{
  private messages: Map<string, TMessage> = new Map();
  private listeners = new Set<MessageStoreListener<TMessage>>();

  getMessages(): TMessage[] {
    return Array.from(this.messages.values());
  }

  getMessage(id: string): TMessage | undefined {
    return this.messages.get(id);
  }

  addMessage(message: TMessage): void {
    this.messages.set(message.id, message);
    this.notifyListeners();
  }

  addMessages(messages: TMessage[]): void {
    for (const message of messages) {
      this.messages.set(message.id, message);
    }
    this.notifyListeners();
  }

  updateMessage(id: string, updates: Partial<TMessage>): void {
    const existing = this.messages.get(id);
    if (existing) {
      this.messages.set(id, { ...existing, ...updates });
      this.notifyListeners();
    }
  }

  removeMessage(id: string): void {
    if (this.messages.delete(id)) {
      this.notifyListeners();
    }
  }

  clear(): void {
    this.messages.clear();
    this.notifyListeners();
  }

  subscribe(listener: MessageStoreListener<TMessage>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const messages = this.getMessages();
    this.listeners.forEach((listener) => listener(messages));
  }
}

/**
 * Create a new in-memory message store
 */
export function createMessageStore<TMessage extends BaseMessage>(): MessageStore<TMessage> {
  return new InMemoryMessageStore<TMessage>();
}
