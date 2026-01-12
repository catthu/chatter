import type {
  ContentBlock,
  StreamingState,
  StreamingStateMachine,
  StreamingStateListener,
  Unsubscribe,
} from '../types';

/**
 * Initial streaming state
 */
const INITIAL_STATE: StreamingState = {
  isStreaming: false,
  partialContent: null,
  sessionId: null,
};

/**
 * Streaming state machine implementation.
 * Tracks real-time streaming updates for chat messages.
 */
export class DefaultStreamingStateMachine implements StreamingStateMachine {
  private state: StreamingState = { ...INITIAL_STATE };
  private listeners = new Set<StreamingStateListener>();

  getState(): StreamingState {
    return { ...this.state };
  }

  onPartialContent(sessionId: string, content: ContentBlock[]): void {
    this.setState({
      isStreaming: true,
      partialContent: content,
      sessionId,
    });
  }

  onComplete(sessionId: string): void {
    // Only clear if this is for the currently streaming session
    if (this.state.sessionId === sessionId || this.state.sessionId === null) {
      this.setState({
        isStreaming: false,
        partialContent: null,
        sessionId: null,
      });
    }
  }

  reset(): void {
    this.setState({ ...INITIAL_STATE });
  }

  subscribe(listener: StreamingStateListener): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(newState: StreamingState): void {
    const hasChanged =
      this.state.isStreaming !== newState.isStreaming ||
      this.state.sessionId !== newState.sessionId ||
      !contentBlocksEqual(this.state.partialContent, newState.partialContent);

    if (hasChanged) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}

/**
 * Check if two content block arrays are equal
 */
function contentBlocksEqual(
  a: ContentBlock[] | null,
  b: ContentBlock[] | null
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i].type !== b[i].type || a[i].content !== b[i].content) {
      return false;
    }
  }

  return true;
}

/**
 * Create a new streaming state machine
 */
export function createStreamingStateMachine(): StreamingStateMachine {
  return new DefaultStreamingStateMachine();
}
