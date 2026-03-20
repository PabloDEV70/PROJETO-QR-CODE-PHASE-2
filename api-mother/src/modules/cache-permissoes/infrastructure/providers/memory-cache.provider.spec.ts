/**
 * Testes unitarios para MemoryCacheProvider.
 *
 * @module M6 - Cache de Permissoes
 */

import { MemoryCacheProvider } from './memory-cache.provider';

describe('MemoryCacheProvider', () => {
  let provider: MemoryCacheProvider;

  beforeEach(() => {
    provider = new MemoryCacheProvider();
  });

  afterEach(() => {
    provider.onModuleDestroy();
  });

  describe('set e get', () => {
    it('deve armazenar e recuperar valor', async () => {
      await provider.set('chave-teste', { nome: 'valor' });
      const resultado = await provider.get('chave-teste');

      expect(resultado).toEqual({ nome: 'valor' });
    });

    it('deve retornar null para chave inexistente', async () => {
      const resultado = await provider.get('chave-inexistente');

      expect(resultado).toBeNull();
    });

    it('deve respeitar TTL', async () => {
      await provider.set('chave-ttl', 'valor', { ttlSegundos: 1 });

      // Deve existir imediatamente
      let resultado = await provider.get('chave-ttl');
      expect(resultado).toBe('valor');

      // Esperar expiracao
      await new Promise((resolve) => setTimeout(resolve, 1100));

      resultado = await provider.get('chave-ttl');
      expect(resultado).toBeNull();
    });
  });

  describe('delete', () => {
    it('deve remover item existente', async () => {
      await provider.set('chave-remover', 'valor');
      const removido = await provider.delete('chave-remover');

      expect(removido).toBe(true);
      expect(await provider.has('chave-remover')).toBe(false);
    });

    it('deve retornar false para item inexistente', async () => {
      const removido = await provider.delete('chave-inexistente');

      expect(removido).toBe(false);
    });
  });

  describe('has', () => {
    it('deve retornar true para chave existente', async () => {
      await provider.set('chave-has', 'valor');
      const existe = await provider.has('chave-has');

      expect(existe).toBe(true);
    });

    it('deve retornar false para chave inexistente', async () => {
      const existe = await provider.has('chave-inexistente');

      expect(existe).toBe(false);
    });

    it('deve retornar false para chave expirada', async () => {
      await provider.set('chave-expirada', 'valor', { ttlSegundos: 1 });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const existe = await provider.has('chave-expirada');
      expect(existe).toBe(false);
    });
  });

  describe('clear', () => {
    it('deve limpar todo o cache', async () => {
      await provider.set('chave1', 'valor1');
      await provider.set('chave2', 'valor2');
      await provider.set('chave3', 'valor3');

      await provider.clear();

      expect(await provider.size()).toBe(0);
    });
  });

  describe('keys', () => {
    it('deve listar todas as chaves', async () => {
      await provider.set('prefixo:chave1', 'valor1');
      await provider.set('prefixo:chave2', 'valor2');
      await provider.set('outro:chave3', 'valor3');

      const chaves = await provider.keys();

      expect(chaves).toHaveLength(3);
    });

    it('deve filtrar por padrao', async () => {
      await provider.set('prefixo:chave1', 'valor1');
      await provider.set('prefixo:chave2', 'valor2');
      await provider.set('outro:chave3', 'valor3');

      const chaves = await provider.keys('prefixo:*');

      expect(chaves).toHaveLength(2);
      expect(chaves).toContain('prefixo:chave1');
      expect(chaves).toContain('prefixo:chave2');
    });
  });

  describe('size', () => {
    it('deve retornar tamanho correto', async () => {
      await provider.set('chave1', 'valor1');
      await provider.set('chave2', 'valor2');

      expect(await provider.size()).toBe(2);
    });
  });

  describe('touch', () => {
    it('deve atualizar TTL de chave existente', async () => {
      await provider.set('chave-touch', 'valor', { ttlSegundos: 1 });

      const atualizado = await provider.touch('chave-touch', 60);

      expect(atualizado).toBe(true);

      // Esperar mais que o TTL original
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Deve ainda existir devido ao novo TTL
      const existe = await provider.has('chave-touch');
      expect(existe).toBe(true);
    });

    it('deve retornar false para chave inexistente', async () => {
      const atualizado = await provider.touch('chave-inexistente', 60);

      expect(atualizado).toBe(false);
    });
  });

  describe('mget', () => {
    it('deve retornar multiplos valores', async () => {
      await provider.set('multi:1', 'valor1');
      await provider.set('multi:2', 'valor2');
      await provider.set('multi:3', 'valor3');

      const resultados = await provider.mget(['multi:1', 'multi:2', 'multi:4']);

      expect(resultados.size).toBe(2);
      expect(resultados.get('multi:1')).toBe('valor1');
      expect(resultados.get('multi:2')).toBe('valor2');
      expect(resultados.has('multi:4')).toBe(false);
    });
  });

  describe('mset', () => {
    it('deve armazenar multiplos valores', async () => {
      const itens = new Map<string, string>([
        ['mset:1', 'valor1'],
        ['mset:2', 'valor2'],
      ]);

      await provider.mset(itens);

      expect(await provider.get('mset:1')).toBe('valor1');
      expect(await provider.get('mset:2')).toBe('valor2');
    });
  });

  describe('mdelete', () => {
    it('deve remover multiplas chaves', async () => {
      await provider.set('mdel:1', 'valor1');
      await provider.set('mdel:2', 'valor2');
      await provider.set('mdel:3', 'valor3');

      const removidos = await provider.mdelete(['mdel:1', 'mdel:2', 'mdel:4']);

      expect(removidos).toBe(2);
      expect(await provider.has('mdel:3')).toBe(true);
    });
  });

  describe('deleteByPattern', () => {
    it('deve remover chaves por padrao', async () => {
      await provider.set('pattern:a:1', 'valor1');
      await provider.set('pattern:a:2', 'valor2');
      await provider.set('pattern:b:1', 'valor3');

      const removidos = await provider.deleteByPattern('pattern:a:*');

      expect(removidos).toBe(2);
      expect(await provider.has('pattern:b:1')).toBe(true);
    });
  });

  describe('getInfo', () => {
    it('deve retornar informacoes da chave', async () => {
      await provider.set('info-chave', { dados: 'teste' }, { ttlSegundos: 300 });

      const info = await provider.getInfo('info-chave');

      expect(info).not.toBeNull();
      expect(info!.chave).toBe('info-chave');
      expect(info!.ttlRestante).toBeGreaterThan(0);
      expect(info!.ttlRestante).toBeLessThanOrEqual(300);
    });

    it('deve retornar null para chave inexistente', async () => {
      const info = await provider.getInfo('chave-inexistente');

      expect(info).toBeNull();
    });
  });

  describe('metricas', () => {
    it('deve rastrear hits e misses', async () => {
      await provider.set('metricas:chave', 'valor');

      // Gerar hits
      await provider.get('metricas:chave');
      await provider.get('metricas:chave');

      // Gerar misses
      await provider.get('metricas:inexistente');

      const metricas = provider.getMetricas();

      expect(metricas.hits).toBeGreaterThanOrEqual(2);
      expect(metricas.misses).toBeGreaterThanOrEqual(1);
    });
  });
});
