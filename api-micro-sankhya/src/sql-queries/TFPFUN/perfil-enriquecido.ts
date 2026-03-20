/**
 * Query para buscar perfil enriquecido do funcionário.
 * Pode retornar múltiplas rows se o parceiro tiver múltiplos vínculos TFPFUN.
 * O service (pickBestVinculo) seleciona o vínculo correto: ativo primeiro, senão mais recente.
 *
 * NOTE: API Mother não suporta subqueries correlacionadas (EXISTS, COUNT no SELECT).
 */
export const perfilEnriquecido = `
SELECT
  P.CODPARC AS codparc,
  P.NOMEPARC AS nomeparc,
  P.CGC_CPF AS cgcCpf,
  P.TELEFONE AS telefone,
  P.EMAIL AS email,
  P.NUMEND AS numend,
  P.COMPLEMENTO AS complemento,
  P.CEP AS cep,
  P.CLIENTE AS cliente,
  P.FORNECEDOR AS fornecedor,
  CONVERT(VARCHAR(10), P.DTNASC, 120) AS dtNascimento,
  U.CODUSU AS codusu,
  U.NOMEUSU AS nomeusu,
  U.EMAIL AS emailUsuario,
  CONVERT(VARCHAR(19), U.DTLIMACESSO, 120) AS dtLimAcesso,
  F.CODEMP AS codemp,
  F.CODFUNC AS codfunc,
  F.SITUACAO AS situacao,
  CONVERT(VARCHAR(10), F.DTADM, 120) AS dtadm,
  CONVERT(VARCHAR(10), F.DTDEM, 120) AS dtdem,
  F.SALBASE AS salario,
  F.CODDEP AS coddep,
  F.CODCARGO AS codcargo,
  F.CODFUNCAO AS codfuncao,
  (SELECT TOP 1 fho.CODCARGAHOR FROM TFPFHO fho
    WHERE fho.CODEMP = F.CODEMP AND fho.CODFUNC = F.CODFUNC
    ORDER BY fho.DTINIESCALA DESC) AS codcargahor,
  CAR.DESCRCARGO AS cargo,
  FCO.DESCRFUNCAO AS funcao,
  DEP.DESCRDEP AS departamento,
  EMP.NOMEFANTASIA AS empresa
FROM TGFPAR P
LEFT JOIN TSIUSU U ON U.CODPARC = P.CODPARC
LEFT JOIN TFPFUN F ON F.CODPARC = P.CODPARC
LEFT JOIN TFPCAR CAR ON CAR.CODCARGO = F.CODCARGO
LEFT JOIN TFPFCO FCO ON FCO.CODFUNCAO = F.CODFUNCAO
LEFT JOIN TFPDEP DEP ON DEP.CODDEP = F.CODDEP
LEFT JOIN TSIEMP EMP ON EMP.CODEMP = F.CODEMP
WHERE P.CODPARC = @codparc
`;

/**
 * Query para buscar todos os vínculos de um parceiro (histórico)
 * Ordenado por data admissão DESC (mais recente primeiro)
 */
export const vinculosHistorico = `
SELECT
  F.CODEMP AS codemp,
  F.CODFUNC AS codfunc,
  F.SITUACAO AS situacao,
  CONVERT(VARCHAR(10), F.DTADM, 120) AS dtadm,
  CONVERT(VARCHAR(10), F.DTDEM, 120) AS dtdem,
  CAR.DESCRCARGO AS cargo,
  EMP.NOMEFANTASIA AS empresa
FROM TFPFUN F
LEFT JOIN TFPCAR CAR ON F.CODCARGO = CAR.CODCARGO
LEFT JOIN TSIEMP EMP ON F.CODEMP = EMP.CODEMP
WHERE F.CODPARC = @codparc
ORDER BY F.DTADM DESC
`;
