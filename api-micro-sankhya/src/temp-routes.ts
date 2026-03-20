import { FastifyInstance } from 'fastify';
import { DbQueryService } from './src/domain/services/db-query.service';

export async function tempRoutes(fastify: FastifyInstance) {
  const db = new DbQueryService();

  fastify.get('/temp/analise-tgfcab/:numnota', async (request, reply) => {
    const { numnota } = request.params as { numnota: string };
    
    const num = parseInt(numnota);
    if (isNaN(num)) {
      return reply.status(400).send({ error: 'Numnota inválido' });
    }

    const resultados: Record<string, unknown> = {};

    // 1. Itens do cabeçalho
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
      WHERE TOP.NUMNOTA = ${num}
      ORDER BY TOP.SEQUENCIAL
    `);
    resultados.itens = itensCab.linhas;
    resultados.qtdItens = itensCab.quantidadeLinhas;

    // 2. Cabeçalho
    const cab = await db.executeQuery(`
      SELECT 
        CAB.NUMNOTA,
        CAB.CODTIPOPER,
        CAB.DTMOV,
        CAB.STATUSNOTA,
        CAB.VLTOTAL,
        CAB.NUNOTAORIG,
        TIP.DESCRTIPOPER
      FROM TGFCAB CAB
      LEFT JOIN TGCTIPOPER TIP ON CAB.CODTIPOPER = TIP.CODTIPOPER
      WHERE CAB.NUMNOTA = ${num}
    `);
    resultados.cabecalho = cab.linhas[0] || null;

    // 3. Devoluções vinculadas
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
      WHERE CAB.NUNOTAORIG = ${num}
    `);
    resultados.devolucoes = dev.linhas;
    resultados.qtdDevolucoes = dev.quantidadeLinhas;

    // 4. Histórico de alterações (se disponível)
    const historico = await db.executeQuery(`
      SELECT TOP 10
        H.NUMNOTA,
        H.CODUSU,
        H.DTMOV,
        H.HRMOV,
        H.CODTIPOPER,
        TIP.DESCRTIPOPER
      FROM TGFHST H
      LEFT JOIN TGCTIPOPER TIP ON H.CODTIPOPER = TIP.CODTIPOPER
      WHERE H.NUMNOTA = ${num}
      ORDER BY H.DTMOV DESC, H.HRMOV DESC
    `);
    resultados.historico = historico.linhas;

    return resultados;
  });

  // Casos semelhantes
  fastify.get('/temp/casos-similares', async (request, reply) => {
    const qtdItens = (request.query as Record<string, string>).qtd || '8';
    
    // Casos onde pedido teve devolução com menos itens
    const casos = await db.executeQuery(`
      WITH PEDIDO AS (
        SELECT 
          CAB.NUMNOTA,
          CAB.DTMOV,
          CAB.VLTOTAL,
          COUNT(TOP.CODTOP) AS QTD_ITENS
        FROM TGFCAB CAB
        INNER JOIN TGFTOP TOP ON CAB.NUMNOTA = TOP.NUMNOTA
        WHERE CAB.NUNOTAORIG IS NULL
          AND CAB.CODTIPOPER NOT IN (1202, 1203, 1204, 1205, 1206, 1207, 1208, 1209, 1210, 1211, 1212, 1213, 1214, 1215)
        GROUP BY CAB.NUMNOTA, CAB.DTMOV, CAB.VLTOTAL
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
      SELECT TOP 30
        PEDIDO.NUMNOTA AS NUM_PEDIDO,
        PEDIDO.DTMOV AS DATA_PEDIDO,
        PEDIDO.VLTOTAL AS VL_PEDIDO,
        PEDIDO.QTD_ITENS AS ITENS_PEDIDO,
        DEVOLUCAO.NUMNOTA AS NUM_DEV,
        DEVOLUCAO.DTMOV AS DATA_DEV,
        DEVOLUCAO.QTD_ITENS_DEV AS ITENS_DEV,
        DEVOLUCAO.STATUSNOTA AS STATUS_DEV,
        PEDIDO.QTD_ITENS - DEVOLUCAO.QTD_ITENS_DEV AS DIFERENCA
      FROM PEDIDO
      INNER JOIN DEVOLUCAO ON PEDIDO.NUMNOTA = DEVOLUCAO.NUNOTAORIG
      WHERE PEDIDO.QTD_ITENS > DEVOLUCAO.QTD_ITENS_DEV
        AND PEDIDO.QTD_ITENS = ${qtdItens}
      ORDER BY PEDIDO.DTMOV DESC
    `);

    return { qtdItens: parseInt(qtdItens), casos: casos.linhas };
  });
}
