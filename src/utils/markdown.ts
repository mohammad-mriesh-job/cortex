import type { TocItem } from '../types';
import { slugify } from './slug';

export interface ParsedMarkdown {
  data: Record<string, string>;
  content: string;
}

/**
 * Minimal frontmatter parser (flat `key: value` pairs between `---` fences).
 * Browser-safe — avoids gray-matter's Node Buffer dependency.
 */
export function parseFrontmatter(raw: string): ParsedMarkdown {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, content: raw };

  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }
  return { data, content: match[2] };
}

/** Extract `##`/`###` headings into a TOC, ignoring fenced code blocks. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (!heading) continue;

    const depth = heading[1].length;
    const text = heading[2].replace(/[#*`]/g, '').trim();
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    items.push({ id, text, depth });
  }
  return items;
}

/** Rough reading-time estimate (~200 wpm). */
export function estimateReadMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
