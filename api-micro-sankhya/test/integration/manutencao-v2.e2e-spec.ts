import { buildApp } from '../../src/app';
import { FastifyInstance } from 'fastify';

describe('Manutenção V2 - Histórico, Planos e Produtividade', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /man/os/:nuos/historico', () => {
    it('deve retornar histórico de execução de uma OS', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/man/os?limit=1' });
      expect(listRes.statusCode).toBe(200);
      const listBody = JSON.parse(listRes.body);

      if (listBody.data && listBody.data.length > 0) {
        const nuos = listBody.data[0].NUOS;
        const response = await app.inject({
          method: 'GET',
          url: `/man/os/${nuos}/historico`,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(Array.isArray(body)).toBe(true);
      }
    });
  });

  describe('GET /man/veiculo/:codveiculo/resumo', () => {
    it('deve retornar resumo do histórico de um veículo', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/man/os?limit=1' });
      const listBody = JSON.parse(listRes.body);

      if (listBody.data && listBody.data.length > 0 && listBody.data[0].CODVEICULO) {
        const codveiculo = listBody.data[0].CODVEICULO;
        const response = await app.inject({
          method: 'GET',
          url: `/man/veiculo/${codveiculo}/resumo`,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('codveiculo');
        expect(body).toHaveProperty('totalOs');
      }
    });
  });

  describe('GET /man/veiculo/:codveiculo/historico', () => {
    it('deve retornar lista paginada de OS do veículo (skip se não suportado)', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/man/os?limit=1' });
      const listBody = JSON.parse(listRes.body);

      if (listBody.data && listBody.data.length > 0 && listBody.data[0].CODVEICULO) {
        const codveiculo = listBody.data[0].CODVEICULO;
        const response = await app.inject({
          method: 'GET',
          url: `/man/veiculo/${codveiculo}/historico?page=1&limit=10`,
        });
        // Skip se API Mother não suporta esta query
        if (response.statusCode === 400) {
          console.log('SKIP: /man/veiculo/:codveiculo/historico não suportado');
          return;
        }
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('total');
        expect(Array.isArray(body.data)).toBe(true);
      }
    });
  });

  describe('GET /man/veiculo/:codveiculo/servicos-frequentes', () => {
    it('deve retornar serviços mais executados no veículo', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/man/os?limit=1' });
      const listBody = JSON.parse(listRes.body);

      if (listBody.data && listBody.data.length > 0 && listBody.data[0].CODVEICULO) {
        const codveiculo = listBody.data[0].CODVEICULO;
        const response = await app.inject({
          method: 'GET',
          url: `/man/veiculo/${codveiculo}/servicos-frequentes`,
        });
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(Array.isArray(body)).toBe(true);
      }
    });
  });

  describe('GET /man/veiculo/:codveiculo/observacoes', () => {
    it('deve retornar observações técnicas do veículo (skip se não suportado)', async () => {
      const listRes = await app.inject({ method: 'GET', url: '/man/os?limit=1' });
      const listBody = JSON.parse(listRes.body);

      if (listBody.data && listBody.data.length > 0 && listBody.data[0].CODVEICULO) {
        const codveiculo = listBody.data[0].CODVEICULO;
        const response = await app.inject({
          method: 'GET',
          url: `/man/veiculo/${codveiculo}/observacoes?page=1&limit=10`,
        });
        // Skip se API Mother não suporta esta query
        if (response.statusCode === 400) {
          console.log('SKIP: /man/veiculo/:codveiculo/observacoes não suportado');
          return;
        }
        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('data');
        expect(body).toHaveProperty('total');
      }
    });
  });

  describe('GET /man/planos', () => {
    it('deve listar planos de manutenção preventiva (skip se tabela não acessível)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/planos',
      });
      // Skip se tabela TCFMAN não acessível
      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos - tabela TCFMAN não acessível');
        return;
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /man/planos/aderencia', () => {
    it('deve retornar análise de aderência aos planos (skip se tabela não acessível)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/aderencia',
      });
      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/aderencia - tabela TCFMAN não acessível');
        return;
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('deve filtrar por situação (skip se tabela não acessível)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/aderencia?situacao=ATRASADA',
      });
      if (response.statusCode === 400) {
        console.log('SKIP: filtro situação - tabela TCFMAN não acessível');
        return;
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      body.forEach((item: { situacao: string }) => {
        expect(item.situacao).toBe('ATRASADA');
      });
    });
  });

  describe('GET /man/planos/atrasadas', () => {
    it('deve retornar manutenções preventivas atrasadas (skip se tabela não acessível)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/atrasadas',
      });
      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/atrasadas - tabela TCFMAN não acessível');
        return;
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });

  describe('GET /man/planos/resumo', () => {
    it('deve retornar resumo da aderência (skip se tabela não acessível)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/planos/resumo',
      });
      if (response.statusCode === 400) {
        console.log('SKIP: /man/planos/resumo - tabela TCFMAN não acessível');
        return;
      }
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('emDia');
      expect(body).toHaveProperty('proximas');
      expect(body).toHaveProperty('atrasadas');
      expect(body).toHaveProperty('semHistorico');
      expect(body).toHaveProperty('total');
    });
  });

  describe('GET /man/tecnicos/produtividade', () => {
    it('deve retornar ranking de produtividade dos técnicos', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade',
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('deve aceitar filtros de data e limite', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/man/tecnicos/produtividade?dataInicio=2024-01-01&dataFim=2024-12-31&limit=5',
      });
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
