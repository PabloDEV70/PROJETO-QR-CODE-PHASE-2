/**
 * Shared SQL fragments for AD_ARMARIO.LOCAL_ARM mapping.
 * LOCAL_ARM is varchar storing numeric codes (1-11).
 * Descriptions come from TDDOPC (Sankhya data dictionary) via JOIN.
 * TAG prefixes are abbreviations used on physical printed labels.
 */

/** NUCAMPO for LOCAL_ARM field in TDDOPC */
export const LOCAL_ARM_NUCAMPO = 9999991115;

/** JOIN to TDDOPC to get LOCAL_ARM description from database */
export const LOCAL_OPC_JOIN = `LEFT JOIN TDDOPC opc_local ON opc_local.NUCAMPO = ${LOCAL_ARM_NUCAMPO} AND opc_local.VALOR = a.LOCAL_ARM`;

/** Column expression for localDescricao (uses the JOIN above) */
export const LOCAL_DESCRICAO_COL = `ISNULL(RTRIM(opc_local.OPCAO), 'Desconhecido')`;

/** Tag prefix abbreviations for physical labels (e.g. APO-040) */
export const TAG_PREFIX_CASE = `CASE a.LOCAL_ARM
    WHEN '1' THEN 'AVP-I'
    WHEN '2' THEN 'AVP-II'
    WHEN '3' THEN 'AAVP-I'
    WHEN '4' THEN 'ACP-I'
    WHEN '5' THEN 'AEP-II'
    WHEN '6' THEN 'AVA-I'
    WHEN '7' THEN 'APO'
    WHEN '8' THEN 'APT'
    WHEN '9' THEN 'APL'
    WHEN '10' THEN 'AMR'
    WHEN '11' THEN 'ASS'
    ELSE 'UNK'
  END`;

/** Query to list all LOCAL_ARM options from data dictionary */
export const listarLocais = `
SELECT
  VALOR AS valor,
  RTRIM(OPCAO) AS descricao
FROM TDDOPC
WHERE NUCAMPO = ${LOCAL_ARM_NUCAMPO}
ORDER BY CAST(VALOR AS INT)
`;
