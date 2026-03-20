/**
 * DTOs da camada de apresentação do módulo Dicionário.
 *
 * Exporta todos os Data Transfer Objects utilizados pelos controllers.
 */

// Resposta de Tabelas
export * from './tabela-resposta.dto';

// Resposta de Campos
export * from './campo-resposta.dto';

// Resposta de Instâncias
export * from './instancia-resposta.dto';

// Resposta de Relacionamentos
export * from './relacionamento-resposta.dto';

// Resultado de Pesquisa
export * from './resultado-pesquisa.dto';

// D4: DTOs para Instâncias e Relacionamentos
export * from './instancia-completa-resposta.dto';
export * from './hierarquia-instancias-resposta.dto';
export * from './link-campo-resposta.dto';
export * from './grafo-tabelas-resposta.dto';
export * from './relacionamentos-tabela-resposta.dto';

// D7: DTOs para Cache Admin
export * from './invalidar-cache.dto';
