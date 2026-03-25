/**
 * Query para configuracao completa da TOP (TGFTOP) versionada pela data da nota
 * Inclui campos de layout da TOP
 * @param @nunota - NUNOTA da nota (usado para pegar CODTIPOPER e DTNEG)
 */
export const notaDetalheTop = `
SELECT
    TOPV.CODTIPOPER,
    TOPV.DESCROPER,
    TOPV.DHALTER,
    TOPV.TIPMOV,
    CASE TOPV.TIPMOV
        WHEN 'C' THEN 'Compra'
        WHEN 'D' THEN 'Devolucao'
        WHEN 'O' THEN 'Outros'
        WHEN 'P' THEN 'Pedido'
        WHEN 'V' THEN 'Venda'
        WHEN 'T' THEN 'Transferencia'
        ELSE ISNULL(TOPV.TIPMOV, '-')
    END AS TIPMOV_DESCRICAO,

    TOPV.ATUALEST,
    CASE TOPV.ATUALEST
        WHEN 'B' THEN 'Baixar estoque'
        WHEN 'E' THEN 'Entrar no estoque'
        WHEN 'N' THEN 'Nao movimenta estoque'
        WHEN 'R' THEN 'Reservar estoque'
        ELSE 'Indefinido'
    END AS ATUALEST_DESCRICAO,

    TOPV.ATUALFIN,
    CASE TOPV.ATUALFIN
        WHEN 'S' THEN 'Sim'
        WHEN 'N' THEN 'Nao'
        ELSE ISNULL(TOPV.ATUALFIN, '-')
    END AS ATUALFIN_DESCRICAO,

    TOPV.ATIVO,
    TOPV.GOLNEG,
    TOPV.BONIFICACAO,
    TOPV.LANCDEDUTIVEL,
    TOPV.GERADUPLICATA,
    TOPV.CONTROLEEST,
    TOPV.TIPFRETE,
    CASE TOPV.TIPFRETE
        WHEN 'C' THEN 'CIF'
        WHEN 'F' THEN 'FOB'
        WHEN 'T' THEN 'Terceiros'
        WHEN 'S' THEN 'Sem Frete'
        ELSE ISNULL(TOPV.TIPFRETE, '-')
    END AS TIPFRETE_DESCRICAO,

    TOPV.EMITENTE,
    CASE TOPV.EMITENTE
        WHEN 'E' THEN 'Empresa'
        WHEN 'T' THEN 'Terceiros'
        ELSE ISNULL(TOPV.EMITENTE, '-')
    END AS EMITENTE_DESCRICAO,

    TOPV.HABILITANFE,
    TOPV.MODELO,

    TOPV.AD_LAYOUTCAB,
    TOPV.AD_LAYOUTITE,
    TOPV.AD_LAYOUTFIN

FROM TGFTOP TOPV

WHERE TOPV.CODTIPOPER = (SELECT CAB.CODTIPOPER FROM TGFCAB CAB WHERE CAB.NUNOTA = @nunota)
  AND TOPV.DHALTER = (
      SELECT MAX(TOP2.DHALTER)
      FROM TGFTOP TOP2
      WHERE TOP2.CODTIPOPER = TOPV.CODTIPOPER
        AND TOP2.DHALTER <= (SELECT CAB2.DTNEG FROM TGFCAB CAB2 WHERE CAB2.NUNOTA = @nunota)
  )
`;

/**
 * Query para variacoes/historico da nota (TGFVAR)
 * @param @nunota - NUNOTA da nota
 */
export const notaDetalheVar = `
SELECT
    VAR.NUNOTA,
    VAR.SEQUENCIA,
    VAR.NUNOTAORIG       AS NUNOTA_ORIGEM,
    VAR.SEQUENCIAORIG    AS SEQUENCIA_ORIGEM

FROM TGFVAR VAR

WHERE VAR.NUNOTA = @nunota

ORDER BY VAR.SEQUENCIA DESC
`;
