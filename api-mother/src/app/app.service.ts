import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getSitemapHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sankhya DB Gateway API - Sitemap</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem 1rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 3rem 2rem;
      text-align: center;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .stats {
      background: rgba(255,255,255,0.15);
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      font-size: 0.95rem;
    }

    .content {
      padding: 2rem;
    }

    .intro {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #667eea;
    }

    .intro p {
      margin-bottom: 1rem;
    }

    .intro a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s;
    }

    .intro a:hover {
      color: #764ba2;
    }

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.8rem;
      color: #667eea;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 3px solid #667eea;
      font-weight: 600;
    }

    .endpoint {
      background: #f8f9fa;
      padding: 1.2rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      transition: all 0.3s;
      border-left: 4px solid transparent;
    }

    .endpoint:hover {
      background: #e9ecef;
      border-left-color: #667eea;
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .method {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .method.get {
      background: #28a745;
      color: white;
    }

    .method.post {
      background: #007bff;
      color: white;
    }

    .method.put {
      background: #ffc107;
      color: #333;
    }

    .method.delete {
      background: #dc3545;
      color: white;
    }

    .method.patch {
      background: #fd7e14;
      color: white;
    }

    .path {
      font-family: 'Courier New', monospace;
      font-size: 1.1rem;
      font-weight: 600;
      color: #495057;
    }

    .description {
      color: #6c757d;
      margin-left: 5rem;
      font-size: 0.95rem;
    }

    footer {
      background: #f8f9fa;
      padding: 2rem;
      text-align: center;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }

    footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      header h1 {
        font-size: 1.8rem;
      }

      .section-title {
        font-size: 1.4rem;
      }

      .endpoint-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .description {
        margin-left: 0;
        margin-top: 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Sankhya DB Gateway API</h1>
      <p>Complete API Sitemap & Endpoint Reference</p>
      <div class="stats">218+ Endpoints | 15 Categories | 33 Controllers</div>
    </header>

    <div class="content">
      <div class="intro">
        <p><strong>Welcome to the Sankhya DB Gateway API!</strong></p>
        <p>This page lists all available endpoints in our RESTful API. For interactive documentation and testing, visit the <a href="/api" target="_blank">Swagger UI Documentation</a>.</p>
      </div>

      <!-- 1. AUTHENTICATION -->
      <div class="section">
        <h2 class="section-title">1. Authentication</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auth/login</span>
          </div>
          <div class="description">Authenticate user and get JWT token</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auth/refresh</span>
          </div>
          <div class="description">Refresh access and refresh tokens</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auth/profile</span>
          </div>
          <div class="description">Get current authenticated user profile</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auth/me</span>
          </div>
          <div class="description">Get detailed user information with organizational structure</div>
        </div>
      </div>

      <!-- 2. USERS & PERSONNEL -->
      <div class="section">
        <h2 class="section-title">2. Users & Personnel</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users</span>
          </div>
          <div class="description">List all users with pagination</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/stats</span>
          </div>
          <div class="description">Get user statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/active-employees</span>
          </div>
          <div class="description">List users with active employees</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/by-company/:codemp</span>
          </div>
          <div class="description">List users by company</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/by-group/:codgrupo</span>
          </div>
          <div class="description">List users by access group</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu</span>
          </div>
          <div class="description">Get basic user details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/complete</span>
          </div>
          <div class="description">Get complete user data with all relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/partner</span>
          </div>
          <div class="description">Get user's partner information</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/employee</span>
          </div>
          <div class="description">Get user's active employee record</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/employees</span>
          </div>
          <div class="description">Get user's employment history</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/access-info</span>
          </div>
          <div class="description">Get user's access information</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/company</span>
          </div>
          <div class="description">Get user's company data</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/users/:codusu/access-group</span>
          </div>
          <div class="description">Get user's access group</div>
        </div>
      </div>

      <!-- 3. ADMIN - ROLES & PERMISSIONS -->
      <div class="section">
        <h2 class="section-title">3. Admin - Roles & Permissions</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/roles</span>
          </div>
          <div class="description">List all roles</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/admin/roles</span>
          </div>
          <div class="description">Create a new role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method put">PUT</span>
            <span class="path">/admin/roles/:codRole</span>
          </div>
          <div class="description">Update an existing role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/admin/roles/:codRole</span>
          </div>
          <div class="description">Remove (deactivate) a role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/permissoes</span>
          </div>
          <div class="description">List all table permissions</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/permissoes/role/:codRole</span>
          </div>
          <div class="description">List permissions for a specific role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/permissoes/tabela/:nomeTabela</span>
          </div>
          <div class="description">List permissions for a specific table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/admin/permissoes</span>
          </div>
          <div class="description">Create a new table permission</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method put">PUT</span>
            <span class="path">/admin/permissoes/:codPermissao</span>
          </div>
          <div class="description">Update a table permission</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/admin/permissoes/:codPermissao</span>
          </div>
          <div class="description">Remove a table permission</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/usuarios-roles</span>
          </div>
          <div class="description">List user-role associations</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/usuarios-roles/role/:codRole</span>
          </div>
          <div class="description">List users for a specific role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/usuarios-roles/usuario/:codUsuario</span>
          </div>
          <div class="description">List roles for a specific user</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/admin/usuarios-roles</span>
          </div>
          <div class="description">Associate user to a role</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/admin/usuarios-roles/:codUsuario/:codRole</span>
          </div>
          <div class="description">Disassociate user from a role</div>
        </div>
      </div>

      <!-- 4. ADMIN - PARAMETERS -->
      <div class="section">
        <h2 class="section-title">4. Admin - System Parameters</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/admin/parametros</span>
          </div>
          <div class="description">List all system parameters</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/admin/parametros</span>
          </div>
          <div class="description">Create a new system parameter</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method put">PUT</span>
            <span class="path">/admin/parametros/:codParametro</span>
          </div>
          <div class="description">Update a system parameter</div>
        </div>
      </div>

      <!-- 5. PERMISSIONS & ACCESS CONTROL -->
      <div class="section">
        <h2 class="section-title">5. Permissions & Access Control</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes/tela/:codUsuario/:codTela</span>
          </div>
          <div class="description">Get screen permissions for user</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes/verificar/:codUsuario/:codTela/:nomeControle</span>
          </div>
          <div class="description">Verify specific control permissions</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes/parametros/:codUsuario</span>
          </div>
          <div class="description">Get user-specific parameters</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes-escrita/verificar/:codUsuario/:tabela/:operacao</span>
          </div>
          <div class="description">Verify write permissions for table operation</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes-escrita/verificar-multiplas/:codUsuario</span>
          </div>
          <div class="description">Verify multiple write permissions</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes-escrita/usuario/:codUsuario</span>
          </div>
          <div class="description">List all write permissions for user</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissoes-escrita/usuario/:codUsuario/tabela/:tabela</span>
          </div>
          <div class="description">Get write permissions for specific table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissions-debug/user/:userId/hierarchy</span>
          </div>
          <div class="description">Debug: Get user permission hierarchy</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissions-debug/user/:userId/resources</span>
          </div>
          <div class="description">Debug: List user's accessible resources</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissions-debug/user/:userId/tables</span>
          </div>
          <div class="description">Debug: List user's accessible tables</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/permissions-debug/validate</span>
          </div>
          <div class="description">Debug: Validate specific permission</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/permissions-debug/cache/stats</span>
          </div>
          <div class="description">Debug: Get permission cache statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/permissions-debug/cache/clear</span>
          </div>
          <div class="description">Debug: Clear permission cache</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/metricas</span>
          </div>
          <div class="description">Get complete cache metrics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/metricas/simplificadas</span>
          </div>
          <div class="description">Get simplified cache metrics (hit/miss)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/saude</span>
          </div>
          <div class="description">Verify cache health</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/tendencias</span>
          </div>
          <div class="description">Get cache hit rate trends</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/invalidar/usuario</span>
          </div>
          <div class="description">Invalidate cache for a user</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/invalidar/tela</span>
          </div>
          <div class="description">Invalidate cache for a screen</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/invalidar/grupo</span>
          </div>
          <div class="description">Invalidate cache for a group</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/cache-permissoes/invalidar/global</span>
          </div>
          <div class="description">Invalidate all cache (CAUTION!)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/invalidacoes/historico</span>
          </div>
          <div class="description">Get cache invalidation history</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/limpeza/configuracao</span>
          </div>
          <div class="description">Get cleanup job configuration</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/limpeza/configuracao</span>
          </div>
          <div class="description">Update cleanup job configuration</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/limpeza/executar</span>
          </div>
          <div class="description">Execute cleanup manually</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/limpeza/historico</span>
          </div>
          <div class="description">Get cleanup history</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/limpeza/status</span>
          </div>
          <div class="description">Get cleanup job status</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/monitoramento/estatisticas</span>
          </div>
          <div class="description">Get monitoring statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/cache-permissoes/monitoramento/eventos</span>
          </div>
          <div class="description">Get recent change events</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/monitoramento/iniciar</span>
          </div>
          <div class="description">Start change monitoring</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/cache-permissoes/monitoramento/parar</span>
          </div>
          <div class="description">Stop change monitoring</div>
        </div>
      </div>

      <!-- 6. DATA DICTIONARY -->
      <div class="section">
        <h2 class="section-title">6. Data Dictionary</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/tabelas</span>
          </div>
          <div class="description">List active dictionary tables</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/tabelas/:nome</span>
          </div>
          <div class="description">Get table details by name</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/tabelas/:nome/campos</span>
          </div>
          <div class="description">List table fields</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/tabelas/:nome/instancias</span>
          </div>
          <div class="description">List table instances</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/tabelas/:nome/relacionamentos</span>
          </div>
          <div class="description">List table relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/pesquisar</span>
          </div>
          <div class="description">Global dictionary search</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/instancias/tabela/:nomeTabela</span>
          </div>
          <div class="description">List instances for a table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/instancias/:nomeInstancia</span>
          </div>
          <div class="description">Get instance by name</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/instancias/:nomeInstancia/completa</span>
          </div>
          <div class="description">Get instance with relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/instancias/:nomeInstancia/hierarquia</span>
          </div>
          <div class="description">Get instance hierarchy</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/relacionamentos/tabela/:nomeTabela</span>
          </div>
          <div class="description">List table relationships (categorized)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/relacionamentos/campos/:nomeInstanciaPai/:nomeInstanciaFilho</span>
          </div>
          <div class="description">Get relationship link fields</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/relacionamentos/grafo/:nomeTabela</span>
          </div>
          <div class="description">Get related tables graph</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/admin/cache/estatisticas</span>
          </div>
          <div class="description">Get dictionary cache statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/dicionario/admin/cache/invalidar</span>
          </div>
          <div class="description">Invalidate dictionary cache</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/export/tabela/:nomeTabela/doc</span>
          </div>
          <div class="description">Generate table documentation (Markdown/HTML/PDF)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/export/json</span>
          </div>
          <div class="description">Export dictionary in JSON format</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/form-builder/schema/form</span>
          </div>
          <div class="description">Generate form schema for table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dicionario/form-builder/schema/grid</span>
          </div>
          <div class="description">Generate grid schema for table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables</span>
          </div>
          <div class="description">List dictionary tables (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/search/:term</span>
          </div>
          <div class="description">Search tables by name or description</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName</span>
          </div>
          <div class="description">Get table details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/fields</span>
          </div>
          <div class="description">List table fields</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/fields/:fieldName</span>
          </div>
          <div class="description">Get field details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/fields/:fieldName/options</span>
          </div>
          <div class="description">Get field options</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/fields/:fieldName/properties</span>
          </div>
          <div class="description">Get field properties</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/instances</span>
          </div>
          <div class="description">Get table instances</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tables/:tableName/relationships</span>
          </div>
          <div class="description">Get table relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/fields/search/:term</span>
          </div>
          <div class="description">Search fields in all tables</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/options/by-nucampo/:nucampo</span>
          </div>
          <div class="description">Get options by NUCAMPO</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/search/:term</span>
          </div>
          <div class="description">Global dictionary search (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/instances/:instanceName/links</span>
          </div>
          <div class="description">Get instance links/relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/dictionary/query</span>
          </div>
          <div class="description">Execute custom dictionary query</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/meta/allowed-tables</span>
          </div>
          <div class="description">List allowed dictionary tables for queries</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/meta/field-types</span>
          </div>
          <div class="description">Get dictionary field types</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/meta/presentation-types</span>
          </div>
          <div class="description">Get dictionary presentation types</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tabelas</span>
          </div>
          <div class="description">List all dictionary tables (V3)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tabelas/buscar</span>
          </div>
          <div class="description">Search tables by term (V3)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tabelas/:nome</span>
          </div>
          <div class="description">Get table by name (V3)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tabelas/:nome/campos</span>
          </div>
          <div class="description">List table fields (V3)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/dictionary/tabelas/:nomeTabela/campos/:nomeCampo</span>
          </div>
          <div class="description">Get field with options (V3)</div>
        </div>
      </div>

      <!-- 7. CONSTRUCTOR -->
      <div class="section">
        <h2 class="section-title">7. Constructor (Screen Builder)</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/constructor/health</span>
          </div>
          <div class="description">Constructor service health check</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/constructor/screens</span>
          </div>
          <div class="description">List available screens/instances</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/constructor/screens/:name</span>
          </div>
          <div class="description">Get screen definition</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/constructor/screens/:name/data</span>
          </div>
          <div class="description">Get sample data from screen table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/constructor/screens/:screenId/validate-permission</span>
          </div>
          <div class="description">Validate field permission for operation</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/constructor/telas</span>
          </div>
          <div class="description">List additional custom screens</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/constructor/telas</span>
          </div>
          <div class="description">Create new screen</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/constructor/telas/:nomeInstancia</span>
          </div>
          <div class="description">Delete screen</div>
        </div>
      </div>

      <!-- 8. DATABASE EXPLORER -->
      <div class="section">
        <h2 class="section-title">8. Database Explorer</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/resumo</span>
          </div>
          <div class="description">Get database summary statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/views</span>
          </div>
          <div class="description">List all database views</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/views/:schema/:nome</span>
          </div>
          <div class="description">Get view details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/triggers</span>
          </div>
          <div class="description">List all database triggers</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/triggers/:schema/:nome</span>
          </div>
          <div class="description">Get trigger details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/procedures</span>
          </div>
          <div class="description">List all stored procedures</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/procedures/:schema/:nome</span>
          </div>
          <div class="description">Get stored procedure details</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/relacionamentos</span>
          </div>
          <div class="description">List all foreign key relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/database/cache/limpar</span>
          </div>
          <div class="description">Clear database explorer cache</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/database/cache/estatisticas</span>
          </div>
          <div class="description">Get cache statistics</div>
        </div>
      </div>

      <!-- 9. INSPECTION & QUERY EXECUTION -->
      <div class="section">
        <h2 class="section-title">9. Inspection & Query Execution</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/tables</span>
          </div>
          <div class="description">List all database tables</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/table-schema</span>
          </div>
          <div class="description">Get table schema structure</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/table-relations</span>
          </div>
          <div class="description">Get table foreign key relationships</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/primary-keys/:tableName</span>
          </div>
          <div class="description">Get table primary keys</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/inspection/query</span>
          </div>
          <div class="description">Execute SQL query (SELECT/INSERT/UPDATE/DELETE)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/tabelas</span>
          </div>
          <div class="description">List tables (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/tabelas/:nomeTabela/schema</span>
          </div>
          <div class="description">Get table schema (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/tabelas/:nomeTabela/relacoes</span>
          </div>
          <div class="description">Get table relations (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/inspection/tabelas/:nomeTabela/chaves-primarias</span>
          </div>
          <div class="description">Get primary keys (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/inspection/query</span>
          </div>
          <div class="description">Execute SQL query (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/query-executor</span>
          </div>
          <div class="description">Execute parameterized SQL query</div>
        </div>
      </div>

      <!-- 10. AUDIT & APPROVALS -->
      <div class="section">
        <h2 class="section-title">10. Audit & Approvals</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auditoria/registrar</span>
          </div>
          <div class="description">Register operation in audit log</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/historico</span>
          </div>
          <div class="description">Query audit history</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/historico/:id</span>
          </div>
          <div class="description">Get audit record by ID</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/historico/registro/:tabela/:chave</span>
          </div>
          <div class="description">Get audit history for specific record</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/estatisticas</span>
          </div>
          <div class="description">Get audit statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/exportar</span>
          </div>
          <div class="description">Export audit history</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auditoria/aprovacoes/solicitar</span>
          </div>
          <div class="description">Request approval for operation</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes</span>
          </div>
          <div class="description">List approvals</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes/pendentes</span>
          </div>
          <div class="description">List pending approvals only</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes/proximas-expirar</span>
          </div>
          <div class="description">List approvals close to expiration</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes/contagem</span>
          </div>
          <div class="description">Count pending approvals</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes/estatisticas</span>
          </div>
          <div class="description">Get approval statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/auditoria/aprovacoes/:id</span>
          </div>
          <div class="description">Get approval by ID</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auditoria/aprovacoes/:id/aprovar</span>
          </div>
          <div class="description">Approve a request</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auditoria/aprovacoes/:id/rejeitar</span>
          </div>
          <div class="description">Reject a request</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/auditoria/aprovacoes/expirar</span>
          </div>
          <div class="description">Mark expired approvals</div>
        </div>
      </div>

      <!-- 11. DATA MUTATIONS -->
      <div class="section">
        <h2 class="section-title">11. Data Mutations</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/mutation-v2/insert</span>
          </div>
          <div class="description">Insert new record into table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method put">PUT</span>
            <span class="path">/mutation-v2/update</span>
          </div>
          <div class="description">Update existing record in table</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method delete">DELETE</span>
            <span class="path">/mutation-v2/delete</span>
          </div>
          <div class="description">Delete record from table</div>
        </div>
      </div>

      <!-- 12. MONITORING -->
      <div class="section">
        <h2 class="section-title">12. Monitoring & Performance</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/permissoes</span>
          </div>
          <div class="description">Get permission monitoring data</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/visao-servidor</span>
          </div>
          <div class="description">Get server overview</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/estatisticas-query</span>
          </div>
          <div class="description">Get query statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/queries-ativas</span>
          </div>
          <div class="description">List active queries</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/estatisticas-espera</span>
          </div>
          <div class="description">Get wait statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/sessoes</span>
          </div>
          <div class="description">Get session statistics</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/queries-pesadas</span>
          </div>
          <div class="description">List heavy/expensive queries</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/health</span>
          </div>
          <div class="description">Monitoring service health check</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/permissions</span>
          </div>
          <div class="description">Monitor permissions (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/query-stats</span>
          </div>
          <div class="description">Query statistics (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/active-queries</span>
          </div>
          <div class="description">Active queries (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/wait-stats</span>
          </div>
          <div class="description">Wait statistics (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/session-stats</span>
          </div>
          <div class="description">Session statistics (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/server-overview</span>
          </div>
          <div class="description">Server overview (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/user-ranking</span>
          </div>
          <div class="description">User activity ranking</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/heavy-queries</span>
          </div>
          <div class="description">Heavy queries (V2)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/monitoring/sessions-detail</span>
          </div>
          <div class="description">Detailed session information</div>
        </div>
      </div>

      <!-- 13. HEALTH & SYSTEM -->
      <div class="section">
        <h2 class="section-title">13. Health & System</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/</span>
          </div>
          <div class="description">API root endpoint</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/health</span>
          </div>
          <div class="description">Comprehensive health check</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/health/db-ping</span>
          </div>
          <div class="description">Test database connection and query</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/health/db-connect</span>
          </div>
          <div class="description">Test database server reachability</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/health/check-me</span>
          </div>
          <div class="description">Simple health check</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/version</span>
          </div>
          <div class="description">Get API version information</div>
        </div>
      </div>

      <!-- 14. DOCUMENTATION -->
      <div class="section">
        <h2 class="section-title">14. Documentation</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/sitemap</span>
          </div>
          <div class="description">This sitemap page</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/docs</span>
          </div>
          <div class="description">Documentation index (Markdown)</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/docs/list</span>
          </div>
          <div class="description">List available documentation files</div>
        </div>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/docs/:filename</span>
          </div>
          <div class="description">Get specific documentation file</div>
        </div>
      </div>

      <!-- 15. CUSTOM TABLES -->
      <div class="section">
        <h2 class="section-title">15. Custom Tables (DANGEROUS - TESTE ONLY)</h2>
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/custom-tables</span>
          </div>
          <div class="description">Create custom Sankhya table (TESTE database only)</div>
        </div>
      </div>
    </div>

    <footer>
      <p><strong>Sankhya DB Gateway API</strong> - RESTful API for Sankhya Database Access</p>
      <p>For interactive documentation and testing, visit <a href="/api" target="_blank">Swagger Documentation</a></p>
      <p style="margin-top: 1rem; font-size: 0.9rem;">218+ endpoints across 15 categories | 33 controllers</p>
    </footer>
  </div>
</body>
</html>`;
  }
}
