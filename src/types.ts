export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export interface Topic {
  /** url slug e.g. "java-fundamentals/variables" */
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  categoryOrder: number;
  order: number;
  level: Level;
  summary: string;
  tags: string[];
  /** markdown body (frontmatter stripped) */
  content: string;
  /** estimated read minutes */
  readMinutes: number;
}

export interface Category {
  name: string;
  slug: string;
  order: number;
  topics: Topic[];
}

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  /** markdown answer */
  answer: string;
  category: string;
  difficulty: Difficulty;
  tags: string[];
}

/** Static metadata describing a top-level subject ("track"). */
export interface TrackMeta {
  /** stable id, also used as the icon key */
  id: string;
  /** url segment, e.g. "java" → /java/... */
  slug: string;
  name: string;
  tagline: string;
  /** accent color (hex) */
  color: string;
}

/** A fully-loaded subject: its metadata plus all of its isolated content. */
export interface Track extends TrackMeta {
  categories: Category[];
  allTopics: Topic[];
  topicBySlug: Map<string, Topic>;
  questions: InterviewQuestion[];
}
