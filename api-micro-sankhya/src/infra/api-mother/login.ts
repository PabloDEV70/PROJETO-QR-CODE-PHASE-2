import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../shared/logger';
import { getDatabase } from './database-context';
import { devLog, R, B, D, GREEN, RED, YELLOW, CYAN, clock } from '../../shared/log-colors';

export class ApiMotherAuthService {
  private static instance: ApiMotherAuthService;

  private constructor() {}

  public static getInstance(): ApiMotherAuthService {
    if (!ApiMotherAuthService.instance) {
      ApiMotherAuthService.instance = new ApiMotherAuthService();
    }
    return ApiMotherAuthService.instance;
  }

  public async login(
    username: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    devLog(`${clock()}  ${D}├─${R} ${CYAN}AUTH${R} ${D}Authenticating${R} ${CYAN}${username}${R}${D}...${R}`);
    logger.info('[ApiMotherAuth] Authenticating as %s...', username);
    try {
      const database = getDatabase();
      const response = await axios.post(
        `${env.API_MAE_BASE_URL}/auth/login`,
        { username, password },
        { headers: { 'X-Database': database } },
      );

      const data = response.data as {
        data?: { access_token?: string; refreshToken?: string };
        access_token?: string;
        token?: string;
        refreshToken?: string;
      };
      const accessToken = data.data?.access_token || data.access_token || data.token;
      const refreshToken = data.data?.refreshToken || data.refreshToken || '';

      if (!accessToken) {
        throw new Error('Token not found in response');
      }

      devLog(`${clock()}  ${D}├─${R} ${GREEN}${B}AUTH OK${R} ${CYAN}${username}${R}`);
      logger.info('[ApiMotherAuth] Authentication successful for %s', username);
      return { accessToken, refreshToken };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      devLog(`${clock()}  ${D}├─${R} ${RED}${B}AUTH FAIL${R} ${CYAN}${username}${R} ${D}${msg.slice(0, 60)}${R}`);
      logger.error('[ApiMotherAuth] Login failed for %s: %s', username, msg);
      throw error;
    }
  }

  public async refreshUserToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    logger.info('[ApiMotherAuth] Refreshing user token...');
    try {
      const database = getDatabase();
      const response = await axios.post(
        `${env.API_MAE_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'X-Database': database } },
      );

      const data = response.data as {
        data?: { access_token?: string; refreshToken?: string };
        access_token?: string;
        token?: string;
        refreshToken?: string;
      };
      const accessToken = data.data?.access_token || data.access_token || data.token;
      const newRefresh = data.data?.refreshToken || data.refreshToken || '';

      if (!accessToken) {
        throw new Error('Refresh failed: no token in response');
      }

      logger.info('[ApiMotherAuth] Token refresh successful');
      return { accessToken, refreshToken: newRefresh };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error('[ApiMotherAuth] Token refresh failed: %s', msg);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await axios.get(`${env.API_MAE_BASE_URL}/version`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
