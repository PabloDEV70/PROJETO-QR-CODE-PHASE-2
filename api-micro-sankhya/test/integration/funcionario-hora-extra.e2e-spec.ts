import { buildApp } from '@/app';
import { FastifyInstance } from 'fastify';

describe('Funcionario Hora Extra Integration (e2e)', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /funcionarios/:codparc/perfil-completo', () => {
    it('should return 200 for known active employee (365)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codparc', 365);
    });

    it('should have all personal fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codparc');
      expect(body).toHaveProperty('nomeparc');
      expect(body.nomeparc).toBeTruthy();
      expect(body).toHaveProperty('cgcCpf');
      expect(body).toHaveProperty('telefone');
      expect(body).toHaveProperty('email');
    });

    it('should have all vinculo fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codemp');
      expect(body).toHaveProperty('codfunc');
      expect(body).toHaveProperty('situacao');
      expect(body).toHaveProperty('situacaoLabel');
      expect(body).toHaveProperty('dtadm');
    });

    it('should have situacao "1" and situacaoLabel "Ativo" for active employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.situacao).toBe('1');
      expect(body.situacaoLabel).toBe('Ativo');
    });

    it('should have organizational fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('codcargo');
      expect(body).toHaveProperty('cargo');
      expect(body).toHaveProperty('codfuncao');
      expect(body).toHaveProperty('funcao');
      expect(body).toHaveProperty('coddep');
      expect(body).toHaveProperty('departamento');
      expect(body).toHaveProperty('empresa');
    });

    it('should have cargaHoraria when codcargahor exists', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      if (body.codcargahor) {
        expect(body).toHaveProperty('cargaHoraria');
        expect(body.cargaHoraria).not.toBeNull();
        expect(body.cargaHoraria).toHaveProperty('codcargahor');
        expect(body.cargaHoraria).toHaveProperty('totalMinutosSemana');
        expect(body.cargaHoraria).toHaveProperty('totalHorasSemanaFmt');
        expect(body.cargaHoraria).toHaveProperty('dias');
      }
    });

    it('should have cargaHoraria.dias with at least one entry', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      if (body.cargaHoraria) {
        expect(Array.isArray(body.cargaHoraria.dias)).toBe(true);
        expect(body.cargaHoraria.dias.length).toBeGreaterThan(0);
      }
    });

    it('should have reasonable total hours (20h-50h per week)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      if (body.cargaHoraria) {
        const totalMinutos = body.cargaHoraria.totalMinutosSemana;
        expect(totalMinutos).toBeGreaterThanOrEqual(1200); // 20h
        expect(totalMinutos).toBeLessThanOrEqual(3000); // 50h
      }
    });

    it('should have Sunday (diasem=1) as folga for CODCARGAHOR 63', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/365/perfil-completo',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      if (body.codcargahor === 63 && body.cargaHoraria) {
        const sunday = body.cargaHoraria.dias.find((d: any) => d.diasem === 1);
        if (sunday) {
          expect(sunday.folga).toBe(true);
          expect(sunday.minutosPrevistos).toBe(0);
        }
      }
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/funcionarios/999999999/perfil-completo',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });
  });

  describe('GET /funcionarios/:codparc/hora-extra', () => {
    const validPeriod = 'dataInicio=2026-01-23&dataFim=2026-02-02';
    // CODPARC 3396 = known active employee with RDO data in period
    const codparcComRdo = 3396;

    it('should return 200 with valid period', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
    });

    it('should have funcionario, data, meta top-level keys', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('funcionario');
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
    });

    it('should have all funcionario fields', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.funcionario).toHaveProperty('codparc');
      expect(body.funcionario).toHaveProperty('nomeparc');
      expect(body.funcionario).toHaveProperty('cargo');
      expect(body.funcionario).toHaveProperty('departamento');
      expect(body.funcionario).toHaveProperty('codcargahor');
      expect(body.funcionario).toHaveProperty('totalHorasSemanaPrevistas');
    });

    it('should have data as array with at least one day', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should have all required fields in each day', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      if (body.data.length > 0) {
        const day = body.data[0];
        expect(day).toHaveProperty('dtref');
        expect(day).toHaveProperty('diasem');
        expect(day).toHaveProperty('diasemLabel');
        expect(day).toHaveProperty('minutosPrevistos');
        expect(day).toHaveProperty('minutosApontados');
        expect(day).toHaveProperty('minutosHoraExtra');
        expect(day).toHaveProperty('horasHoraExtraFmt');
        expect(day).toHaveProperty('folga');
        expect(day).toHaveProperty('percentualJornada');
        expect(day).toHaveProperty('itens');
      }
    });

    it('should have minutosPrevistos >= 0 for all days', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      body.data.forEach((day: any) => {
        expect(day.minutosPrevistos).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have minutosApontados >= 0 for all days', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      body.data.forEach((day: any) => {
        expect(day.minutosApontados).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have minutosHoraExtra >= 0 for all days', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      body.data.forEach((day: any) => {
        expect(day.minutosHoraExtra).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have horasHoraExtraFmt matching HH:MM pattern', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const hhmmPattern = /^-?\d{1,3}:\d{2}$/;

      body.data.forEach((day: any) => {
        expect(day.horasHoraExtraFmt).toMatch(hhmmPattern);
      });
    });

    it('should have all required fields in each item', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      body.data.forEach((day: any) => {
        if (day.itens.length > 0) {
          const item = day.itens[0];
          expect(item).toHaveProperty('item');
          expect(item).toHaveProperty('hrini');
          expect(item).toHaveProperty('hrfim');
          expect(item).toHaveProperty('hriniFormatada');
          expect(item).toHaveProperty('hrfimFormatada');
          expect(item).toHaveProperty('duracaoMinutos');
          expect(item).toHaveProperty('motivoDescricao');
          expect(item).toHaveProperty('motivoSigla');
          expect(item).toHaveProperty('nuos');
          expect(item).toHaveProperty('obs');
        }
      });
    });

    it('should have item duracaoMinutos >= 0 (HRFIM < HRINI protection)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      body.data.forEach((day: any) => {
        day.itens.forEach((item: any) => {
          expect(item.duracaoMinutos).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should have item hriniFormatada and hrfimFormatada matching HH:MM pattern', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      const hhmmPattern = /^\d{2}:\d{2}$/;

      body.data.forEach((day: any) => {
        day.itens.forEach((item: any) => {
          expect(item.hriniFormatada).toMatch(hhmmPattern);
          expect(item.hrfimFormatada).toMatch(hhmmPattern);
        });
      });
    });

    it('should have all required fields in meta', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.meta).toHaveProperty('totalDias');
      expect(body.meta).toHaveProperty('totalMinutosPrevistos');
      expect(body.meta).toHaveProperty('totalMinutosApontados');
      expect(body.meta).toHaveProperty('totalMinutosHoraExtra');
      expect(body.meta).toHaveProperty('totalHorasHoraExtraFmt');
      expect(body.meta).toHaveProperty('mediaMinutosDia');
      expect(body.meta).toHaveProperty('diasComHoraExtra');
      expect(body.meta).toHaveProperty('diasEmFolga');
    });

    it('should have meta.totalDias matching data.length', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.meta.totalDias).toBe(body.data.length);
    });

    it('should have meta.totalMinutosApontados equal sum of data minutosApontados', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      const sumApontados = body.data.reduce(
        (acc: number, day: any) => acc + day.minutosApontados,
        0
      );
      expect(body.meta.totalMinutosApontados).toBe(sumApontados);
    });

    it('should have meta.totalMinutosHoraExtra equal sum of data minutosHoraExtra', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      const sumHoraExtra = body.data.reduce(
        (acc: number, day: any) => acc + day.minutosHoraExtra,
        0
      );
      expect(body.meta.totalMinutosHoraExtra).toBe(sumHoraExtra);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/999999999/hora-extra?${validPeriod}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
    });

    it('should return data without date filters (may be empty or have data)', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/funcionarios/${codparcComRdo}/hora-extra`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('funcionario');
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
    });
  });
});
