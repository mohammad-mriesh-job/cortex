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

export const oopTrack: Track = defineTrack(
  {
    id: 'oop',
    slug: 'oop',
    name: 'Object-Oriented Programming',
    tagline: 'Encapsulation, inheritance, polymorphism, and the principles behind clean designs.',
    color: '#6f9fc8',
  },
  content,
  questions,
);
