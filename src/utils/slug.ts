/**
 * GitHub-style slugifier. Kept in sync with rehype-slug (github-slugger)
 * so on-page Table-of-Contents anchors match the heading ids in rendered markdown.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // drop punctuation (keeps word chars, whitespace, hyphen)
    .replace(/\s+/g, '-') // spaces -> hyphens
    .replace(/-+/g, '-'); // collapse repeats
}
