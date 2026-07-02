import type { ReactElement } from 'react';
import { InteractiveBoundary } from './InteractiveBoundary';
import { Quiz } from './Quiz';
import { Flashcards } from './Flashcards';
import { Walkthrough } from './Walkthrough';
import { CodeTabs } from './CodeTabs';

const REGISTRY: Record<string, (raw: string) => ReactElement> = {
  quiz: (raw) => <Quiz raw={raw} />,
  flashcards: (raw) => <Flashcards raw={raw} />,
  walkthrough: (raw) => <Walkthrough raw={raw} />,
  tabs: (raw) => <CodeTabs raw={raw} />,
};

export const INTERACTIVE_LANGS = Object.keys(REGISTRY);

/**
 * If `lang` is an interactive fence (```quiz / ```flashcards / ```walkthrough /
 * ```tabs), render the matching component wrapped in an error boundary.
 * Returns null otherwise so the caller can fall back to normal rendering.
 */
export function renderInteractive(lang: string | undefined, raw: string): ReactElement | null {
  if (!lang) return null;
  const factory = REGISTRY[lang];
  if (!factory) return null;
  return (
    <InteractiveBoundary kind={lang} raw={raw}>
      {factory(raw)}
    </InteractiveBoundary>
  );
}
