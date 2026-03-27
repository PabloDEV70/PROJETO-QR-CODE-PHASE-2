import { useState, useMemo } from 'react';
import { useDebounce } from '../useDebounce/useDebounce';

export function useSearch(delay = 300) {
  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery } = useDebounce({ value: query, delay });

  const clear = () => setQuery('');
  const hasQuery = debouncedQuery.length > 0;

  return {
    query,
    setQuery,
    debouncedQuery,
    clear,
    hasQuery,
  };
}

export function useSearchFilter<T>(
  items: T[],
  query: string,
  filterFn: (item: T, lower: string) => boolean,
) {
  return useMemo(() => {
    if (!query) return items;
    const lower = query.toLowerCase();
    return items.filter((item) => filterFn(item, lower));
  }, [items, query, filterFn]);
}
