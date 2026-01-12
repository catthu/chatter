import type {
  BaseMessage,
  TimelineItem,
  TimelineBuilder,
  TimelineBuildParams,
  DeduplicationRule,
  SortingRule,
} from '../types';

/**
 * Default sorting rules: sequence first, then createdAt, then id
 */
const DEFAULT_SORTING_RULES: SortingRule[] = [
  { field: 'sequence', direction: 'asc', priority: 1 },
  { field: 'createdAt', direction: 'asc', priority: 2 },
  { field: 'id', direction: 'asc', priority: 3 },
];

/**
 * Default deduplication rule: by id, keep last
 */
const DEFAULT_DEDUP_RULES: DeduplicationRule[] = [
  { field: 'id', strategy: 'last' },
];

/**
 * Compare function for sorting timeline items
 */
function createCompareFunction(rules: SortingRule[]) {
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (a: TimelineItem, b: TimelineItem): number => {
    for (const rule of sortedRules) {
      const aVal = getFieldValue(a, rule.field);
      const bVal = getFieldValue(b, rule.field);

      // Handle null/undefined - push to end
      if (aVal == null && bVal == null) continue;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      if (comparison !== 0) {
        return rule.direction === 'desc' ? -comparison : comparison;
      }
    }

    return 0;
  };
}

/**
 * Get a nested field value using dot notation
 */
function getFieldValue(obj: unknown, field: string): unknown {
  const parts = field.split('.');
  let value: unknown = obj;

  for (const part of parts) {
    if (value == null || typeof value !== 'object') {
      return undefined;
    }
    value = (value as Record<string, unknown>)[part];
  }

  return value;
}

/**
 * Deduplicate items based on rules
 */
function deduplicateItems<T extends { id: string }>(
  items: T[],
  rules: DeduplicationRule[]
): T[] {
  const seen = new Map<string, T>();

  for (const item of items) {
    for (const rule of rules) {
      const key = String(getFieldValue(item, rule.field as string));

      if (rule.strategy === 'first') {
        if (!seen.has(key)) {
          seen.set(key, item);
        }
      } else {
        // 'last' strategy
        seen.set(key, item);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Default timeline builder implementation
 */
export class DefaultTimelineBuilder implements TimelineBuilder {
  build(params: TimelineBuildParams): TimelineItem[] {
    const {
      messages,
      events = [],
      deduplicationRules = DEFAULT_DEDUP_RULES,
      sortingRules = DEFAULT_SORTING_RULES,
    } = params;

    // Convert messages to timeline items
    const messageItems: TimelineItem[] = messages.map((msg) => ({
      ...msg,
      itemType: 'message' as const,
    }));

    // Convert events to timeline items
    const eventItems: TimelineItem[] = events.map((evt) => ({
      ...evt,
      itemType: 'event' as const,
    }));

    // Combine all items
    const allItems = [...messageItems, ...eventItems];

    // Deduplicate
    const dedupedItems = deduplicateItems(allItems, deduplicationRules);

    // Sort
    const compareFunction = createCompareFunction(sortingRules);
    dedupedItems.sort(compareFunction);

    return dedupedItems;
  }
}

/**
 * Create a new timeline builder
 */
export function createTimelineBuilder(): TimelineBuilder {
  return new DefaultTimelineBuilder();
}

/**
 * Utility to get messages sorted by sequence/timestamp
 */
export function sortMessages<T extends BaseMessage>(messages: T[]): T[] {
  return [...messages].sort((a, b) => {
    // Sequence takes priority
    if (a.sequence != null && b.sequence != null) {
      return a.sequence - b.sequence;
    }
    if (a.sequence != null) return -1;
    if (b.sequence != null) return 1;

    // Fall back to timestamp
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Utility to deduplicate messages by ID
 */
export function deduplicateMessages<T extends BaseMessage>(messages: T[]): T[] {
  const seen = new Map<string, T>();

  for (const msg of messages) {
    // Keep the last occurrence (most recent)
    seen.set(msg.id, msg);
  }

  return Array.from(seen.values());
}
