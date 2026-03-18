'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GlobalSearch } from './GlobalSearch';

const GlobalSearchContext = createContext<{
  openSearch: () => void;
  closeSearch: () => void;
} | null>(null);

export function useGlobalSearch() {
  const ctx = useContext(GlobalSearchContext);
  if (!ctx) return null;
  return ctx;
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <GlobalSearchContext.Provider value={{ openSearch, closeSearch }}>
      {children}
      <GlobalSearch open={open} onClose={closeSearch} />
    </GlobalSearchContext.Provider>
  );
}
