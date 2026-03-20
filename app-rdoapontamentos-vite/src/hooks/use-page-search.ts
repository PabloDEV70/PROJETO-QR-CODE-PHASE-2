import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { pagesConfig, type PageConfig } from '@/components/layout/pages-config';
import { useAuthStore } from '@/stores/auth-store';

function matchScore(page: PageConfig, query: string): number {
  const lower = query.toLowerCase();
  if (page.label.toLowerCase() === lower) return 100;
  if (page.label.toLowerCase().startsWith(lower)) return 80;
  if (page.label.toLowerCase().includes(lower)) return 60;
  if (page.description?.toLowerCase().includes(lower)) return 40;
  return 0;
}

export function usePageSearch() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const searchablePages = useMemo(
    () => pagesConfig.filter((p) => !p.path.includes(':') && (!p.adminOnly || isAdmin)),
    [isAdmin],
  );

  const filteredOptions = useMemo(() => {
    if (!inputValue || inputValue.length < 1) return searchablePages;
    const lower = inputValue.toLowerCase();
    return searchablePages
      .filter(
        (p) =>
          p.label.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower),
      )
      .sort((a, b) => matchScore(b, inputValue) - matchScore(a, inputValue));
  }, [inputValue, searchablePages]);

  const handleSelect = useCallback((_: unknown, value: PageConfig | null) => {
    if (value) {
      navigate(value.path);
      setInputValue('');
      setOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('page-search-input');
        if (input) {
          input.focus();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { pathname, inputValue, setInputValue, open, setOpen, filteredOptions, handleSelect };
}
