import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const STORAGE_KEY = 'java-mastery-progress';

interface ProgressContextValue {
  done: Set<string>;
  count: number;
  toggle: (slug: string) => void;
  isDone: (slug: string) => boolean;
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function loadInitial(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.filter((x): x is string => typeof x === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<string>>(loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  }, [done]);

  const toggle = useCallback((slug: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }, []);

  const isDone = useCallback((slug: string) => done.has(slug), [done]);
  const reset = useCallback(() => setDone(new Set()), []);

  const value = useMemo<ProgressContextValue>(
    () => ({ done, count: done.size, toggle, isDone, reset }),
    [done, toggle, isDone, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider');
  return ctx;
}
