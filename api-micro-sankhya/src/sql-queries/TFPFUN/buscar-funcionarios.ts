/**
 * Busca funcionários ativos por termo (nome ou código)
 * Retorna apenas parceiros que têm vínculo em TFPFUN
 * Departamento via TFPDEP (mesmo do app etiquetas/armarios)
 */
export const buscarFuncionarios = `
SELECT DISTINCT TOP 50
  par.CODPARC AS codparc,
  par.NOMEPARC AS nomeparc,
  fun.CODFUNC AS codfunc,
  fun.CODEMP AS codemp,
  car.DESCRCARGO AS cargo,
  dep.DESCRDEP AS departamento,
  CASE WHEN fun.IMAGEM IS NOT NULL THEN 1 ELSE 0 END AS temFoto
FROM TGFPAR par
INNER JOIN TFPFUN fun ON fun.CODPARC = par.CODPARC
LEFT JOIN TFPCAR car ON car.CODCARGO = fun.CODCARGO
LEFT JOIN TFPDEP dep ON dep.CODDEP = fun.CODDEP
WHERE fun.SITUACAO = '1'
  AND (
    par.NOMEPARC LIKE '%@termo%'
    OR CAST(par.CODPARC AS VARCHAR) = '@termo'
    OR CAST(fun.CODFUNC AS VARCHAR) = '@termo'
  )
ORDER BY par.NOMEPARC
`;
