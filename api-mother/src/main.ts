import './config/tracing';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { Response } from 'express';
import { AppModule } from './app/app.module';
import { StructuredLogger } from './common/logging/structured-logger.service';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { getCorsConfig } from './config/cors.config';

function validateProductionConfig(configService: ConfigService): void {
  const isProduction = configService.get('NODE_ENV') === 'production';

  const required = ['JWT_SECRET', 'SQLSERVER_SERVER', 'SQLSERVER_DATABASE'];
  const missing = required.filter((key) => !configService.get(key));

  const hasUser =
    configService.get('SQLSERVER_CRUD_USER') || configService.get('SQLSERVER_USER');
  const hasPassword =
    configService.get('SQLSERVER_CRUD_PASSWORD') || configService.get('SQLSERVER_PASSWORD');

  if (!hasUser) missing.push('SQLSERVER_CRUD_USER or SQLSERVER_USER');
  if (!hasPassword) missing.push('SQLSERVER_CRUD_PASSWORD or SQLSERVER_PASSWORD');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (isProduction) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    const corsOrigins = configService.get<string>('CORS_ORIGINS');
    if (!corsOrigins || corsOrigins === '*') {
      console.warn(
        '[SECURITY WARNING] CORS_ORIGINS not configured for production. Defaulting to blocked.',
      );
    }

    console.log('[SECURITY] Production config validated');
    console.log('[SECURITY] CORS origins:', corsOrigins || 'BLOCKED');
    console.log('[SECURITY] SQL encrypt:', configService.get('SQLSERVER_ENCRYPT') ?? 'not set');
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Ative tudo por enquanto
});
  app.enableShutdownHooks();

  const structuredLogger = app.get(StructuredLogger);
  const configService = app.get(ConfigService);

  validateProductionConfig(configService);

  const isProduction = configService.get('NODE_ENV') === 'production';

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: isProduction
          ? {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'"],
              imgSrc: ["'self'"],
              connectSrc: ["'self'"],
              frameSrc: ["'none'"],
              objectSrc: ["'none'"],
            }
          : {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'https://swagger.io'],
              fontSrc: ["'self'"],
              connectSrc: ["'self'"],
            },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
      },
    }),
  );

  // Apply compression for large responses (>1KB) — Brotli preferred, gzip fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use((compression as any)({ threshold: 1024 }));

  // Apply global interceptor for performance monitoring
  app.useGlobalInterceptors(new PerformanceInterceptor(app.get(StructuredLogger)));

  // Apply global exception filters for standardized error responses
  // AllExceptionsFilter deve vir primeiro (captura tudo), HttpExceptionFilter depois (mais específico)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Serve static assets (favicon, etc)
  app.useStaticAssets(join(__dirname, 'public'), {
    prefix: '/',
  });

  // Serve Swagger UI static assets — somente em desenvolvimento
  if (!isProduction) {
    app.useStaticAssets(join(__dirname, 'swagger-ui'), {
      prefix: '/api',
    });
  }

  // CORS configuration (centralizada em src/config/cors.config.ts)
  app.enableCors(getCorsConfig(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger/OpenAPI — desabilitado em producao
  if (!isProduction) {
  const config = new DocumentBuilder()
    .setTitle('DBMS Sankhya API')
    .setDescription(
      `
## API de Integração com Sankhya ERP

Esta API fornece acesso ao banco de dados Sankhya para consultas, inspeção de estrutura e dicionário de dados.

### Módulos Disponíveis

- **Auth** - Autenticação JWT com credenciais Sankhya
- **Health** - Monitoramento de saúde da API e banco de dados
- **Inspection** - Inspeção de tabelas, schemas, relacionamentos e queries
- **Dictionary** - Dicionário de dados Sankhya (TDDTAB, TDDCAM, TDDOPC, etc.)
- **Version** - Informações de versão da API

### Autenticação

A maioria dos endpoints requer autenticação via JWT Bearer Token.

1. Faça login em \`POST /auth/login\` com suas credenciais Sankhya
2. Use o token retornado no header: \`Authorization: Bearer <token>\`

### Headers Especiais

- \`X-Database\`: Seleciona o banco de dados (PROD, TESTE, TREINA)

### Segurança

- Apenas queries SELECT são permitidas (endpoints de leitura)
- Comandos destrutivos (DROP, DELETE, UPDATE, INSERT) são bloqueados
- Stored procedures são bloqueadas
- Rate limiting: 100 req/min global, 5 req/min para login
- Erros SQL são sanitizados (detalhes não expostos ao cliente)

### Banco de Dados Padrão

- **Default: TESTE** (para proteger dados de produção)
- Para acessar PROD, envie o header \`X-Database: PROD\`
    `,
    )
    .setVersion('1.0.0')
    .setContact('DBMS Sankhya', '', 'suporte@empresa.com')
    .setLicense('Proprietário', '')
    .addServer('https://api-dbexplorer.gigantao.net', 'Servidor de Produção')
    .addServer('http://localhost:3027', 'Servidor Local de Desenvolvimento')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido via /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticação e gerenciamento de sessões')
    .addTag('Health', 'Monitoramento de saúde da API')
    .addTag('Inspection', 'Inspeção de banco de dados e execução de queries')
    .addTag('Dictionary - Tables', 'Dicionário de dados - Tabelas (TDDTAB)')
    .addTag('Dictionary - Fields', 'Dicionário de dados - Campos (TDDCAM)')
    .addTag('Dictionary - Search', 'Busca global no dicionário de dados')
    .addTag('Monitoring', 'Monitoramento de performance do SQL Server')
    .addTag('Database Explorer', 'Exploração de views, triggers, procedures')
    .addTag('Mutation V2', 'Operações de escrita (INSERT, UPDATE, DELETE)')
    .addTag('Query Executor', 'Execução de queries SELECT')
    .addTag('Constructor', 'Construção dinâmica de telas/formulários')
    .addTag('Docs', 'Documentação interna da API')
    .addTag('Version', 'Informações de versão')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // Endpoint para exportar OpenAPI spec como JSON
  // Acessível em /api-json
  app.getHttpAdapter().get('/api-json', (_req, res: Response) => {
    res.json(document);
  });

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'DBMS Sankhya API - Swagger',
    customfavIcon: '/api/favicon-32x32.png',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2rem }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6 }
      .swagger-ui .info .description h3 { margin-top: 1.5em; color: #3b4151 }
      .swagger-ui .info .description code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px }
    `,
    swaggerOptions: {
      url: undefined,
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });
  } // fim do bloco !isProduction (Swagger)

  const port = configService.get<number>('PORT') || 3027;
  await app.listen(port, '0.0.0.0');

  const env = configService.get('NODE_ENV') || 'development';
  structuredLogger.info('Sankhya DB Gateway started', {
    port,
    swagger: `http://localhost:${port}/api`,
    env,
    database: configService.get('SQLSERVER_DATABASE'),
    server: configService.get('SQLSERVER_SERVER'),
  });
}

void bootstrap();
