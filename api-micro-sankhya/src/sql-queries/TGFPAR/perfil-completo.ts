export const perfilCompleto = `
SELECT TOP 1
  P.CODPARC AS codparc,
  P.NOMEPARC AS nomeparc,
  P.CGC_CPF AS cgc_cpf,
  CASE P.TIPPESSOA
    WHEN 'F' THEN
      SUBSTRING(P.CGC_CPF, 1, 3) + '.' +
      SUBSTRING(P.CGC_CPF, 4, 3) + '.' +
      SUBSTRING(P.CGC_CPF, 7, 3) + '-' +
      SUBSTRING(P.CGC_CPF, 10, 2)
    WHEN 'J' THEN
      SUBSTRING(P.CGC_CPF, 1, 2) + '.' +
      SUBSTRING(P.CGC_CPF, 3, 3) + '.' +
      SUBSTRING(P.CGC_CPF, 6, 3) + '/' +
      SUBSTRING(P.CGC_CPF, 9, 4) + '-' +
      SUBSTRING(P.CGC_CPF, 13, 2)
    ELSE P.CGC_CPF
  END AS cgc_cpf_formatted,
  P.TIPPESSOA AS tippessoa,
  P.ATIVO AS ativo,
  P.RAZAOSOCIAL AS razaosocial,
  P.CLIENTE AS cliente,
  P.FORNECEDOR AS fornecedor,
  P.MOTORISTA AS motorista,
  P.VENDEDOR AS vendedor,
  P.TRANSPORTADORA AS transportadora,
  P.CODEND AS codend,
  ENDER.NOMEEND AS nomeend,
  P.NUMEND AS numend,
  P.COMPLEMENTO AS complemento,
  P.CODBAI AS codbai,
  BAI.NOMEBAI AS nomebai,
  P.CODCID AS codcid,
  CID.NOMECID AS nomecid,
  CID.UF AS uf,
  P.CEP AS cep,
  P.EMAIL AS emailParceiro,
  P.TELEFONE AS telefoneParceiro,
  P.FAX AS fax,
  CONVERT(VARCHAR(19), P.DTCAD, 120) AS dtcad,
  CONVERT(VARCHAR(19), P.DTALTER, 120) AS dtalter,
  P.LIMCRED AS limcred,
  P.BLOQUEAR AS bloquear,
  CASE
    WHEN EXISTS (SELECT 1 FROM TSIUSU U WHERE U.CODPARC = P.CODPARC)
    THEN 'S' ELSE 'N'
  END AS usuario,
  CASE
    WHEN EXISTS (SELECT 1 FROM TFPFUN F WHERE F.CODPARC = P.CODPARC)
    THEN 'S' ELSE 'N'
  END AS funcionario,
  (SELECT COUNT(*) FROM TFPFUN F WHERE F.CODPARC = P.CODPARC) AS vinculosCount,
  U.CODUSU AS codusu,
  U.NOMEUSU AS nomeusu,
  U.EMAIL AS emailUsuario,
  U.AD_TELEFONECORP AS telefoneUsuario
FROM TGFPAR P
LEFT JOIN TSIEND ENDER ON P.CODEND = ENDER.CODEND
LEFT JOIN TSIBAI BAI ON P.CODBAI = BAI.CODBAI
LEFT JOIN TSICID CID ON P.CODCID = CID.CODCID
LEFT JOIN TSIUSU U ON P.CODPARC = U.CODPARC
WHERE P.CODPARC = @codparc
`;
