import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { pagesConfig } from '@/components/layout/pages-config';

const GROUP_ORDER = ['Principal', 'Operacional', 'Analises', 'Pessoas', 'Dados', 'Sistema'];

export function SitemapPage() {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof pagesConfig>();
    for (const page of pagesConfig) {
      if (page.path === '/sitemap') continue;
      const group = page.group || 'Outros';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(page);
    }
    return GROUP_ORDER
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, pages: map.get(g)! }));
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: 4 }}>Mapa do Site</h1>
      <p style={{ color: '#888', marginBottom: 32 }}>
        Todas as paginas do sistema
      </p>

      {grouped.map(({ group, pages }) => (
        <div key={group} style={{ marginBottom: 28 }}>
          <h3 style={{ marginBottom: 8, borderBottom: '1px solid #ddd', paddingBottom: 4 }}>
            {group}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pages.map((page) => {
              const isDynamic = page.path.includes(':');
              return (
                <li
                  key={page.path}
                  style={{
                    padding: '4px 0',
                    paddingLeft: page.parent ? 24 : 0,
                  }}
                >
                  {isDynamic ? (
                    <span style={{ color: '#999' }}>
                      {page.label}
                      <code style={{ marginLeft: 8, fontSize: '0.8em', color: '#aaa' }}>
                        {page.path}
                      </code>
                      {page.description && (
                        <span style={{ marginLeft: 8, fontSize: '0.85em', color: '#999' }}>
                          — {page.description}
                        </span>
                      )}
                    </span>
                  ) : (
                    <Link to={page.path} style={{ textDecoration: 'none', color: '#1976d2' }}>
                      {page.label}
                      <code style={{ marginLeft: 8, fontSize: '0.8em', color: '#888' }}>
                        {page.path}
                      </code>
                    </Link>
                  )}
                  {!isDynamic && page.description && (
                    <span style={{ marginLeft: 8, fontSize: '0.85em', color: '#888' }}>
                      — {page.description}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
