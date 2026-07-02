import type { Category, InterviewQuestion, Level, Topic, Track, TrackMeta } from '../types';
import { estimateReadMinutes, parseFrontmatter } from '../utils/markdown';
import { slugify } from '../utils/slug';

/** Raw markdown files keyed by their (track-relative) path. */
export type RawFiles = Record<string, string>;
/** Default exports of question-bank modules. */
export type QuestionModules = Record<string, InterviewQuestion[]>;

function buildTopics(rawFiles: RawFiles): Topic[] {
  const topics: Topic[] = [];

  for (const [path, raw] of Object.entries(rawFiles)) {
    const { data, content } = parseFrontmatter(raw);

    const rel = path.replace(/^\.\//, '');
    const segments = rel.split('/');
    // path looks like 'content/02-fundamentals/01-variables.md'
    const folder = segments.length > 1 ? segments[segments.length - 2] : 'misc';
    const fileName = segments[segments.length - 1]
      .replace(/\.md$/, '')
      .replace(/^\d+[-_]?/, '');

    const categorySlug = slugify(folder.replace(/^\d+[-_]?/, ''));
    const topicSlug = slugify(fileName);

    topics.push({
      slug: `${categorySlug}/${topicSlug}`,
      title: data.title || fileName,
      category: data.category || folder,
      categorySlug,
      categoryOrder: Number(data.categoryOrder ?? 999),
      order: Number(data.order ?? 999),
      level: (data.level as Level) || 'Beginner',
      summary: data.summary || '',
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      content: content.trim(),
      readMinutes: estimateReadMinutes(content),
    });
  }

  return topics.sort(
    (a, b) => a.categoryOrder - b.categoryOrder || a.order - b.order || a.title.localeCompare(b.title),
  );
}

function buildCategories(topics: Topic[]): Category[] {
  const map = new Map<string, Category>();
  for (const topic of topics) {
    let category = map.get(topic.categorySlug);
    if (!category) {
      category = { name: topic.category, slug: topic.categorySlug, order: topic.categoryOrder, topics: [] };
      map.set(topic.categorySlug, category);
    }
    category.topics.push(topic);
  }
  return [...map.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function buildQuestions(modules: QuestionModules): InterviewQuestion[] {
  return Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([, arr]) => arr ?? []);
}

/**
 * Assemble a Track from its metadata, its globbed markdown content, and its
 * globbed question banks. Empty globs simply yield an empty (coming-soon) track.
 */
export function defineTrack(
  meta: TrackMeta,
  rawFiles: RawFiles,
  questionModules: QuestionModules,
): Track {
  const allTopics = buildTopics(rawFiles);
  const categories = buildCategories(allTopics);
  const topicBySlug = new Map(allTopics.map((t) => [t.slug, t]));
  const questions = buildQuestions(questionModules);
  return { ...meta, categories, allTopics, topicBySlug, questions };
}

/** True when a track has any content (used to show "coming soon"). */
export function isTrackAvailable(track: Track): boolean {
  return track.allTopics.length > 0;
}
