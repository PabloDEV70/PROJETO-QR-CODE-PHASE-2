import { DbQueryService } from './src/domain/services/db-query.service';

const db = new DbQueryService();

async function main() {
  console.log('=== TGFCAB 234754 - Itens Atuais ===\n');
  
  // Ver os itens atuais da TGFCAB 234754
  const itensCab = await db.executeQuery(`
    SELECT 
      TOP.CODTOP,
      TOP.DESCRICAO,
      TOP.QTD,
      TOP.VLUNIT,
      TOP.VLTOTAL,
      TOP.CODPROD,
      PROD.DESCRPROD
    FROM TGFTOP TOP
    LEFT JOIN TGFPRO PROD ON TOP.CODPROD = PROD.CODPROD
    WHERE TOP.NUMNOTA = 234754
    ORDER BY TOP.SEQUENCIAL
  `);
  
  console.log(`Encontrados ${itensCab.quantidadeLinhas} itens na TGFCAB 234754:`);
  console.table(itensCab.linhas);

  // Ver detalhes do cabeçalho
  console.log('\n=== TGFCAB 234754 - Cabeçalho ===\n');
  const cab = await db.executeQuery(`
    SELECT 
      CAB.NUMNOTA,
      CAB.CODTIPOPER,
      CAB.DTMOV,
      CAB.STATUSNOTA,
      CAB.VLTOTAL,
      TIP.DESCRTIPOPER
    FROM TGFCAB CAB
    LEFT JOIN TGCTIPOPER TIP ON CAB.CODTIPOPER = TIP.CODTIPOPER
    WHERE CAB.NUMNOTA = 234754
  `);
  console.table(cab.linhas);

  // Verificar se existe devolução vinculada (NUNOTAORIG)
  console.log('\n=== TGFCAB 234754 - Devolução Vinculada ===\n');
  const dev = await db.executeQuery(`
    SELECT 
      CAB.NUMNOTA,
      CAB.CODTIPOPER,
      CAB.DTMOV,
      CAB.STATUSNOTA,
      CAB.NUNOTAORIG,
      TIP.DESCRTIPOPER
    FROM TGFCAB CAB
    LEFT JOIN TGCTIPOPER TIP ON CAB.CODTIPOPER = TIP.CODTIPOPER
    WHERE CAB.NUNOTAORIG = 234754
  `);
  console.log(`Encontradas ${dev.quantidadeLinhas} devoluções vinculadas:`);
  console.table(dev.linhas);

  // Casos semelhantes: pedidos com X itens que tiveram devolução
  // Vamos procurar pedidos com exatamente 8 itens que tiveram devolução
  console.log('\n=== Casos Semelhantes: Pedidos com 8 itens e devoluções ===\n');
  const similares = await db.executeQuery(`
    SELECT 
      CAB.NUMNOTA AS NUMNOTA_ORIG,
      CAB.DTMOV,
      CAB.VLTOTAL,
      COUNT(TOP.CODTOP) AS QTD_ITENS,
      DEV.NUMNOTA AS NUMNOTA_DEV,
      DEV.DTMOV AS DTMOV_DEV,
      DEV.STATUSNOTA AS STATUS_DEV,
      DEV.VLTOTAL AS VLTOTAL_DEV
    FROM TGFCAB CAB
    INNER JOIN TGFTOP TOP ON CAB.NUMNOTA = TOP.NUMNOTA
    INNER JOIN TGFCAB DEV ON CAB.NUMNOTA = DEV.NUNOTAORIG
    WHERE CAB.NUNOTAORIG IS NULL
      AND DEV.CODTIPOPER IN (1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215)
    GROUP BY CAB.NUMNOTA, CAB.DTMOV, CAB.VLTOTAL, DEV.NUMNOTA, DEV.DTMOV, DEV.STATUSNOTA, DEV.VLTOTAL
    HAVING COUNT(TOP.CODTOP) = 8
    ORDER BY CAB.DTMOV DESC
  `);
  console.log(`Encontrados ${similares.quantidadeLinhas} casos:`);
  console.table(similares.linhas.slice(0, 20)); // Primeiros 20

  // Ver se existe algum caso onde a devolução teve menos itens que o original
  console.log('\n=== Casos onde devolução tem menos itens ===\n');
  const casosEspeciais = await db.executeQuery(`
    WITH PEDIDO AS (
      SELECT 
        CAB.NUMNOTA,
        CAB.DTMOV,
        COUNT(TOP.CODTOP) AS QTD_ITENS
      FROM TGFCAB CAB
      INNER JOIN TGFTOP TOP ON CAB.NUMNOTA = TOP.NUMNOTA
      WHERE CAB.NUNOTAORIG IS NULL
        AND CAB.CODTIPOPER NOT IN (1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215)
      GROUP BY CAB.NUMNOTA, CAB.DTMOV
    ),
    DEVOLUCAO AS (
      SELECT 
        CAB.NUMNOTA,
        CAB.NUNOTAORIG,
        CAB.DTMOV,
        CAB.STATUSNOTA,
        COUNT(TOP.CODTOP) AS QTD_ITENS_DEV
      FROM TGFCAB CAB
      INNER JOIN TGFTOP TOP ON CAB.NUMNOTA = TOP.NUMNOTA
      WHERE CAB.CODTIPOPER IN (1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215)
      GROUP BY CAB.NUMNOTA, CAB.NUNOTAORIG, CAB.DTMOV, CAB.STATUSNOTA
    )
    SELECT 
      PEDIDO.NUMNOTA AS NUM_PEDIDO,
      PEDIDO.DTMOV AS DATA_PEDIDO,
      PEDIDO.QTD_ITENS AS ITENS_PEDIDO,
      DEVOLUCAO.NUMNOTA AS NUM_DEV,
      DEVOLUCAO.DTMOV AS DATA_DEV,
      DEVOLUCAO.QTD_ITENS_DEV AS ITENS_DEV,
      DEVOLUCAO.STATUSNOTA AS STATUS_DEV,
      PEDIDO.QTD_ITENS - DEVOLUCAO.QTD_ITENS_DEV AS DIFERENCA
    FROM PEDIDO
    INNER JOIN DEVOLUCAO ON PEDIDO.NUMNOTA = DEVOLUCAO.NUNOTAORIG
    WHERE PEDIDO.QTD_ITENS > DEVOLUCAO.QTD_ITENS_DEV
    ORDER BY PEDIDO.DTMOV DESC
  `);
  console.log(`Encontrados ${casosEspeciais.quantidadeLinhas} casos:`);
  console.table(casosEspeciais.linhas.slice(0, 20));

  console.log('\n=== Fim da Análise ===');
}

main().catch(console.error);
