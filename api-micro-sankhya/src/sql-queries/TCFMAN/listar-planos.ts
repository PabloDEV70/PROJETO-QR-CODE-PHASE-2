/**
 * Lista todos os planos de manutenção preventiva
 * TCFMANVEI = relacionamento plano↔veículo (TCFMAN não tem CODVEICULO)
 */
export const listarPlanos = `
SELECT
  man.NUPLANO AS nuplano,
  man.CODPROD AS codprod,
  man.DESCRICAO AS descricao,
  man.TIPO AS tipo,
  man.TEMPO AS tempo,
  man.KMHORIMETRO AS kmhorimetro,
  man.PERCTOLERANCIA AS perctolerancia,
  man.REPETIR AS repetir,
  man.PRIOPLANO AS prioplano,
  man.EMAILNOTIFICACAO AS emailnotificacao,
  man.AD_NUMCONTRATO AS adNumcontrato,
  man.AD_AGRUPADOR AS adAgrupador,
  man.ATIVO AS ativo
FROM TCFMAN man
ORDER BY man.DESCRICAO
`;
