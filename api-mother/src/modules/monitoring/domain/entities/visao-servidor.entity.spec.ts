import { VisaoServidor } from './visao-servidor.entity';

describe('VisaoServidor Entity', () => {
  const dadosBase = {
    sql_version: 'Microsoft SQL Server 2019 (RTM) - 15.0.2000.5',
    server_name: 'SQL-PROD',
    current_database: 'SANKHYA_PROD',
    active_user_sessions: 45,
    active_requests: 12,
    user_connections: 45,
    server_time: new Date(),
  };

  describe('criar', () => {
    it('deve criar uma visão do servidor', () => {
      const visao = VisaoServidor.criar(dadosBase);

      expect(visao.versaoSql).toContain('Microsoft SQL Server 2019');
      expect(visao.nomeServidor).toBe('SQL-PROD');
      expect(visao.bancoAtual).toBe('SANKHYA_PROD');
      expect(visao.sessoesUsuarioAtivas).toBe(45);
      expect(visao.requisicaosAtivas).toBe(12);
    });
  });

  describe('obterVersaoSimplificada', () => {
    it('deve retornar versão simplificada', () => {
      const visao = VisaoServidor.criar(dadosBase);
      expect(visao.obterVersaoSimplificada()).toBe('SQL Server 2019');
    });
  });

  describe('temCargaAlta', () => {
    it('deve retornar false para carga normal', () => {
      const visao = VisaoServidor.criar(dadosBase);
      expect(visao.temCargaAlta()).toBe(false);
    });

    it('deve retornar true para muitas sessões', () => {
      const visao = VisaoServidor.criar({
        ...dadosBase,
        active_user_sessions: 150,
      });
      expect(visao.temCargaAlta()).toBe(true);
    });

    it('deve retornar true para muitas requisições', () => {
      const visao = VisaoServidor.criar({
        ...dadosBase,
        active_requests: 60,
      });
      expect(visao.temCargaAlta()).toBe(true);
    });
  });
});
