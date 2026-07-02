import type { Difficulty, Level } from '../types';

export type MuiColor = 'success' | 'info' | 'warning' | 'secondary' | 'error' | 'primary';

export function levelColor(level: Level): MuiColor {
  switch (level) {
    case 'Beginner':
      return 'success';
    case 'Intermediate':
      return 'info';
    case 'Advanced':
      return 'warning';
    case 'Expert':
      return 'secondary';
    default:
      return 'primary';
  }
}

export function difficultyColor(difficulty: Difficulty): MuiColor {
  switch (difficulty) {
    case 'Easy':
      return 'success';
    case 'Medium':
      return 'warning';
    case 'Hard':
      return 'error';
    default:
      return 'primary';
  }
}
