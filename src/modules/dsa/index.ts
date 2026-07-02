import { defineTrack, type QuestionModules, type RawFiles } from '../buildTrack';
import type { Track } from '../../types';

const content = import.meta.glob('./content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as RawFiles;

const questions = import.meta.glob('./questions/*.ts', {
  eager: true,
  import: 'default',
}) as QuestionModules;

export const dsaTrack: Track = defineTrack(
  {
    id: 'dsa',
    slug: 'dsa',
    name: 'Data Structures & Algorithms',
    tagline: 'Arrays, trees, graphs, hashing, and the complexity analysis interviewers love.',
    color: '#5dd39e',
  },
  content,
  questions,
);
