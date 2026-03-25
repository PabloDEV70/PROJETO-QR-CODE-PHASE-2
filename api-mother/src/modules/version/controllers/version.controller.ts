import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import packageJson from '../../../../package.json';
import * as fs from 'fs';
import * as path from 'path';

interface BuildInfo {
  buildDate: string;
  commitHash: string;
  commitShort: string;
  branch: string;
  nodeVersion: string;
  environment: string;
}

@ApiTags('Version')
@Controller('version')
export class VersionController {
  private readonly logger = new Logger(VersionController.name);
  private cachedBuildInfo: BuildInfo | null = null;

  @Get()
  @ApiOperation({ summary: 'Get API version and build info' })
  getVersion() {
    if (process.env.NODE_ENV === 'production') {
      return { version: packageJson.version || '0.0.0' };
    }

    const buildInfo = this.getBuildInfo();
    return {
      version: packageJson.version || '0.0.0',
      name: packageJson.name || 'api',
      description: packageJson.description || 'DBMS Sankhya API',
      ...buildInfo,
    };
  }

  private getBuildInfo(): BuildInfo {
    if (this.cachedBuildInfo) {
      return this.cachedBuildInfo;
    }

    const buildInfo = this.loadFromFile() || this.loadFromEnv();
    this.cachedBuildInfo = buildInfo;
    return buildInfo;
  }

  private loadFromFile(): BuildInfo | null {
    const possiblePaths = [
      path.resolve(process.cwd(), 'build-info.json'),
      path.resolve(__dirname, '../../../../build-info.json'),
      path.resolve(__dirname, '../../../../../build-info.json'),
    ];

    for (const filePath of possiblePaths) {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(content);
          this.logger.log(`Build info loaded from: ${filePath}`);

          return {
            buildDate: data.buildDate || new Date().toISOString(),
            commitHash: data.commitHash || 'unknown',
            commitShort: data.commitShort || 'unknown',
            branch: data.branch || 'unknown',
            nodeVersion: data.nodeVersion || process.version,
            environment: data.environment || process.env.NODE_ENV || 'development',
          };
        }
      } catch {
        this.logger.debug(`Failed to read build info from ${filePath}`);
      }
    }

    return null;
  }

  private loadFromEnv(): BuildInfo {
    return {
      buildDate: process.env.BUILD_DATE || new Date().toISOString(),
      commitHash: process.env.COMMIT_HASH || process.env.GIT_COMMIT_HASH || 'local-dev',
      commitShort: process.env.COMMIT_SHORT || process.env.GIT_COMMIT_SHORT || 'local',
      branch: process.env.BRANCH || process.env.GIT_BRANCH || 'local',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
