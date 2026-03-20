/**
 * Queries SQL centralizadas para o módulo de Dicionário de Dados.
 *
 * Este módulo contém todas as queries relacionadas às tabelas:
 * - TDDTAB: Cadastro de tabelas do sistema
 * - TDDCAM: Cadastro de campos das tabelas
 * - TDDOPC: Opções de valores para campos
 * - TDDPCO: Propriedades/configurações de campos
 * - TDDINS: Definições de instâncias (entidades)
 * - TDDLIG: Relacionamentos entre instâncias (ligações)
 * - TDDLGC: Campos de ligação entre instâncias (join fields)
 *
 * @module Dicionário
 * @task D2-T10 a D2-T20
 */

// Query Objects - Tabelas (TDDTAB)
export * from './listar-tabelas.query';
export * from './obter-tabela.query';
export * from './buscar-tabelas.query';
export * from './obter-tabela-completa.query';

// Query Objects - Campos (TDDCAM)
export * from './listar-campos-tabela.query';
export * from './obter-campo.query';
export * from './buscar-campos.query';

// Query Objects - Opções de Campo (TDDOPC)
export * from './obter-opcoes-campo.query';

// Query Objects - Propriedades de Campo (TDDPCO)
export * from './obter-propriedades-campo.query';

// Query Objects - Instâncias (TDDINS) - D2-T10 a D2-T12
export * from './listar-instancias.query';
export * from './obter-instancia.query';
export * from './obter-instancia-completa.query';

// Query Objects - Relacionamentos (TDDLIG) - D2-T13 a D2-T14
export * from './listar-relacionamentos.query';
export * from './obter-campos-link.query';

// Query Objects - Consultas Avançadas - D2-T15 a D2-T18
export * from './obter-hierarquia-instancias.query';
export * from './buscar-global.query';
export * from './obter-estatisticas.query';
export * from './obter-tabelas-relacionadas.query';
