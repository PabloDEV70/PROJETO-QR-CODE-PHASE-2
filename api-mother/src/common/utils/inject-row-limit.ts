const DEFAULT_MAX_ROWS = 5000;

/**
 * Injeta TOP {maxRows} na query SQL se ela ainda não tiver TOP, OFFSET ou FETCH NEXT.
 * Trata CTEs (WITH ... AS (...) SELECT ...) injetando no SELECT final.
 * Não modifica subqueries — apenas o SELECT mais externo.
 */
export function injectRowLimit(sql: string, maxRows: number = DEFAULT_MAX_ROWS): string {
  if (!sql || typeof sql !== 'string') return sql;

  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // Se já tem TOP, OFFSET ou FETCH NEXT, não modificar
  if (hasExistingLimit(upper)) {
    return trimmed;
  }

  // Encontrar a posição do SELECT externo (após CTE se houver)
  const selectIndex = findOutermostSelectIndex(trimmed, upper);

  if (selectIndex === -1) {
    return trimmed;
  }

  // Injetar TOP após o SELECT keyword
  const selectEnd = selectIndex + 'SELECT'.length;
  const afterSelect = trimmed.substring(selectEnd);

  // Verificar se já tem DISTINCT ou ALL logo após SELECT
  const afterSelectTrimmed = afterSelect.trimStart();
  const afterSelectUpper = afterSelectTrimmed.toUpperCase();

  if (afterSelectUpper.startsWith('DISTINCT') || afterSelectUpper.startsWith('ALL')) {
    const keyword = afterSelectUpper.startsWith('DISTINCT') ? 'DISTINCT' : 'ALL';
    const keywordEnd = afterSelect.indexOf(afterSelectTrimmed) + keyword.length;
    return (
      trimmed.substring(0, selectEnd) +
      afterSelect.substring(0, afterSelect.indexOf(afterSelectTrimmed) + keyword.length) +
      ` TOP ${maxRows}` +
      afterSelect.substring(afterSelect.indexOf(afterSelectTrimmed) + keyword.length)
    );
  }

  return trimmed.substring(0, selectEnd) + ` TOP ${maxRows}` + afterSelect;
}

function hasExistingLimit(upperSql: string): boolean {
  // Verificar TOP no nivel externo (não em subqueries)
  // Precisamos checar se existe TOP logo após um SELECT externo
  if (/\bSELECT\s+(DISTINCT\s+|ALL\s+)?TOP\s+\d/i.test(upperSql)) {
    return true;
  }
  if (/\bOFFSET\b/i.test(upperSql)) {
    return true;
  }
  if (/\bFETCH\s+NEXT\b/i.test(upperSql)) {
    return true;
  }
  return false;
}

/**
 * Encontra o índice do SELECT mais externo na query.
 * Se a query começa com WITH (CTE), pula a CTE e encontra o SELECT final.
 */
function findOutermostSelectIndex(sql: string, upper: string): number {
  // Se começa com WITH (CTE), precisamos encontrar o SELECT após a CTE
  if (upper.startsWith('WITH')) {
    return findSelectAfterCte(sql, upper);
  }

  // Caso simples: query começa com SELECT
  if (upper.startsWith('SELECT')) {
    return 0;
  }

  return -1;
}

/**
 * Para CTEs (WITH ... AS (...) SELECT ...),
 * encontra o SELECT final que vem depois de todas as definições de CTE.
 */
function findSelectAfterCte(sql: string, upper: string): number {
  let depth = 0;
  let i = 0;
  let lastSelectOutsideParens = -1;

  while (i < sql.length) {
    const char = sql[i];

    // Pular strings entre aspas simples
    if (char === "'") {
      i++;
      while (i < sql.length && sql[i] !== "'") {
        if (sql[i] === "'" && i + 1 < sql.length && sql[i + 1] === "'") {
          i += 2;
          continue;
        }
        i++;
      }
      i++;
      continue;
    }

    if (char === '(') {
      depth++;
      i++;
      continue;
    }

    if (char === ')') {
      depth--;
      i++;
      continue;
    }

    // Só considerar SELECT fora de parênteses
    if (depth === 0 && upper.substring(i, i + 6) === 'SELECT') {
      // Verificar se é uma palavra completa (não parte de outra palavra)
      const charBefore = i > 0 ? upper[i - 1] : ' ';
      const charAfter = i + 6 < upper.length ? upper[i + 6] : ' ';
      if (/\s/.test(charBefore) || i === 0) {
        if (/\s/.test(charAfter) || i + 6 === upper.length) {
          lastSelectOutsideParens = i;
        }
      }
    }

    i++;
  }

  return lastSelectOutsideParens;
}
