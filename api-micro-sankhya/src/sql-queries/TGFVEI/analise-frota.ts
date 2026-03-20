/**
 * Análise de frota — ranking de risco para decisão de gestão
 * Agrega: TGFVEI + TCFOSCAB + TGFCAB
 * Score: combina idade + custo/mês + % tempo parado
 */

export const analiseFlota = `
SELECT
  v.CODVEICULO as codveiculo,
  v.PLACA as placa,
  RTRIM(v.MARCAMODELO) as marcamodelo,
  v.AD_TAG as tag,
  RTRIM(v.AD_TIPOEQPTO) as tipoEqpto,
  CASE WHEN CHARINDEX(' ', RTRIM(v.AD_TIPOEQPTO)) > 0
    THEN SUBSTRING(RTRIM(v.AD_TIPOEQPTO), 1, CHARINDEX(' ', RTRIM(v.AD_TIPOEQPTO)) - 1)
    ELSE RTRIM(v.AD_TIPOEQPTO) END as tipoGrupo,
  v.CATEGORIA as categoria,
  v.ANOFABRIC as anoFabric,
  v.ANOMOD as anoMod,

  -- Idade
  DATEDIFF(YEAR, CAST(CAST(v.ANOFABRIC AS VARCHAR) + '-01-01' AS DATE), GETDATE()) as idadeAnos,

  -- OS totais (filtradas por periodo se informado)
  (SELECT COUNT(*) FROM TCFOSCAB o WHERE o.CODVEICULO = v.CODVEICULO ) as totalOS,
  (SELECT COUNT(*) FROM TCFOSCAB o WHERE o.CODVEICULO = v.CODVEICULO AND o.STATUS = 'F' ) as osFechadas,
  (SELECT COUNT(*) FROM TCFOSCAB o WHERE o.CODVEICULO = v.CODVEICULO AND o.STATUS IN ('A','E')) as osAbertas,

  -- Dias em manutenção: media dias por OS (excluindo outliers > 1 ano)
  ISNULL((SELECT AVG(CAST(DATEDIFF(DAY, o2.DTABERTURA, ISNULL(o2.DATAFIN, GETDATE())) AS FLOAT))
    FROM TCFOSCAB o2 WHERE o2.CODVEICULO = v.CODVEICULO AND o2.DTABERTURA IS NOT NULL
    AND DATEDIFF(DAY, o2.DTABERTURA, ISNULL(o2.DATAFIN, GETDATE())) <= 365 ), 0) as mediaDiasOS,

  -- Custo total manutenção (notas de saída liberadas vinculadas ao veículo)
  ISNULL((SELECT SUM(cab.VLRNOTA) FROM TGFCAB cab
    WHERE cab.CODVEICULO = v.CODVEICULO AND cab.TIPMOV = 'O' AND cab.STATUSNOTA = 'L'), 0) as custoTotal,

  -- Custo últimos 6 meses
  ISNULL((SELECT SUM(cab.VLRNOTA) FROM TGFCAB cab
    WHERE cab.CODVEICULO = v.CODVEICULO AND cab.TIPMOV = 'O' AND cab.STATUSNOTA = 'L'
    AND cab.DTNEG >= DATEADD(MONTH, -6, GETDATE())), 0) as custo6m,

  -- Custo 6 meses anteriores (para tendência)
  ISNULL((SELECT SUM(cab.VLRNOTA) FROM TGFCAB cab
    WHERE cab.CODVEICULO = v.CODVEICULO AND cab.TIPMOV = 'O' AND cab.STATUSNOTA = 'L'
    AND cab.DTNEG >= DATEADD(MONTH, -12, GETDATE()) AND cab.DTNEG < DATEADD(MONTH, -6, GETDATE())), 0) as custo6mAnterior,

  -- Primeira e última OS
  (SELECT TOP 1 CONVERT(VARCHAR(10), o6.DTABERTURA, 120) FROM TCFOSCAB o6
    WHERE o6.CODVEICULO = v.CODVEICULO ORDER BY o6.DTABERTURA ASC) as primeiraOS,
  (SELECT TOP 1 CONVERT(VARCHAR(10), o3.DTABERTURA, 120) FROM TCFOSCAB o3
    WHERE o3.CODVEICULO = v.CODVEICULO ORDER BY o3.DTABERTURA DESC) as ultimaOS,

  -- Dias desde última OS
  ISNULL(DATEDIFF(DAY, (SELECT TOP 1 o4.DTABERTURA FROM TCFOSCAB o4
    WHERE o4.CODVEICULO = v.CODVEICULO ORDER BY o4.DTABERTURA DESC), GETDATE()), 999) as diasDesdeUltimaOS

FROM TGFVEI v
WHERE v.ATIVO = 'S'
  AND v.AD_TIPOEQPTO IS NOT NULL
  AND v.ANOFABRIC IS NOT NULL
ORDER BY totalOS DESC
`;

/** Detalhe: histórico de OS de um veículo — enriquecido */
export const analiseVeiculoOS = `
SELECT
  o.NUOS as nuos,
  o.STATUS as status,
  CASE o.STATUS WHEN 'A' THEN 'Aberta' WHEN 'E' THEN 'Em execucao' WHEN 'F' THEN 'Finalizada' WHEN 'C' THEN 'Cancelada' ELSE o.STATUS END as statusLabel,
  o.TIPO as tipo,
  CASE o.TIPO WHEN 'I' THEN 'Interna' WHEN 'E' THEN 'Externa' ELSE o.TIPO END as tipoLabel,
  o.MANUTENCAO as manutencao,
  CASE o.MANUTENCAO WHEN 'C' THEN 'Corretiva' WHEN 'P' THEN 'Preventiva' ELSE o.MANUTENCAO END as manutencaoLabel,
  o.AD_LOCALMANUTENCAO as localManut,
  CASE o.AD_LOCALMANUTENCAO WHEN '1' THEN 'Oficina' WHEN '2' THEN 'Campo' WHEN '3' THEN 'Terceiro' ELSE o.AD_LOCALMANUTENCAO END as localLabel,
  o.AD_FINALIZACAO as finalizacao,
  CASE o.AD_FINALIZACAO WHEN 'LF' THEN 'Lib. Funcionamento' WHEN 'LT' THEN 'Lib. c/ Restricao' WHEN 'LD' THEN 'Lib. c/ Defeito' ELSE o.AD_FINALIZACAO END as finalizacaoLabel,
  CONVERT(VARCHAR(10), o.DTABERTURA, 120) as dtAbertura,
  CONVERT(VARCHAR(10), o.DATAFIN, 120) as dtFim,
  DATEDIFF(DAY, o.DTABERTURA, ISNULL(o.DATAFIN, GETDATE())) as dias,
  (SELECT COUNT(*) FROM TCFSERVOS s WHERE s.NUOS = o.NUOS) as qtdServicos,
  (SELECT TOP 1 RTRIM(p.DESCRPROD) FROM TCFSERVOS s2 INNER JOIN TGFPRO p ON s2.CODPROD = p.CODPROD WHERE s2.NUOS = o.NUOS ORDER BY s2.SEQUENCIA) as primeiroServico,
  uinc.NOMEUSU as abrPor,
  uinc.CODPARC as abrCodparc,
  ISNULL((SELECT SUM(cab.VLRNOTA) FROM TGFCAB cab
    WHERE cab.CODVEICULO = o.CODVEICULO AND cab.TIPMOV = 'O' AND cab.STATUSNOTA = 'L'
    AND cab.DTNEG BETWEEN o.DTABERTURA AND ISNULL(o.DATAFIN, GETDATE())), 0) as custoOS
FROM TCFOSCAB o
LEFT JOIN TSIUSU uinc ON o.CODUSUINC = uinc.CODUSU
WHERE o.CODVEICULO = @CODVEICULO
ORDER BY o.DTABERTURA DESC
`;

/** Notas comerciais (saidas) vinculadas ao veiculo */
export const notasComerciais = `
SELECT
  cab.NUNOTA as nunota,
  cab.NUMNOTA as numnota,
  cab.CODTIPOPER as codTipOper,
  top2.DESCROPER as tipoOperacao,
  cab.TIPMOV as tipoMov,
  CONVERT(VARCHAR(10), cab.DTNEG, 120) as dtNeg,
  cab.VLRNOTA as vlrNota,
  cab.STATUSNOTA as statusNota,
  CASE cab.STATUSNOTA WHEN 'L' THEN 'Liberada' WHEN 'A' THEN 'Aberta' WHEN 'P' THEN 'Pendente' ELSE cab.STATUSNOTA END as statusLabel,
  RTRIM(par.NOMEPARC) as parceiro,
  uinc.NOMEUSU as usuInclusao,
  uinc.CODPARC as codparcUsu
FROM TGFCAB cab
LEFT JOIN TGFTOP top2 ON cab.CODTIPOPER = top2.CODTIPOPER AND cab.DHTIPOPER = top2.DHALTER
LEFT JOIN TGFPAR par ON cab.CODPARC = par.CODPARC
LEFT JOIN TSIUSU uinc ON cab.CODUSU = uinc.CODUSU
WHERE cab.CODVEICULO = @CODVEICULO
  AND cab.STATUSNOTA IN ('L', 'A')
ORDER BY cab.DTNEG DESC
`;
