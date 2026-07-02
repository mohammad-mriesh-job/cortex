import { load } from 'js-yaml';

/** Parse a fenced interactive block's YAML body. Throws on invalid input
 * (caught by InteractiveBoundary, which shows a friendly fallback). */
export function parseFence<T = unknown>(raw: string): T {
  const data = load(raw);
  if (data == null || typeof data !== 'object') {
    throw new Error('Interactive block must be a YAML mapping.');
  }
  return data as T;
}

/** Normalize a value that may be a single item or a list into an array. */
export function asArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}
