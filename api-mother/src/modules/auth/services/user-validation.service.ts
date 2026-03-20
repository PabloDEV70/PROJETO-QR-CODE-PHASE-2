import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { SqlServerService } from '../../../database/sqlserver.service';
import { StructuredLogger } from '../../../common/logging/structured-logger.service';
import { trimFields } from '../../../common/utils/trim-fields';

function hashPassword(username: string, password: string): string {
  const concatenated = (username + password).trim();
  return createHash('md5').update(concatenated).digest('hex');
}

export interface UserDetails {
  CODUSU: number;
  NOMEUSU: string;
  EMAIL?: string;
  CODFUNC?: number;
  NOMEFUNC?: string;
  CODEMP?: number;
  CODGRUPO?: number; // Added user group code
  DTLIMACESSO?: Date; // Corrected field for access limit date
}

export interface LoginResult {
  success: boolean;
  user?: UserDetails;
  error?: string;
}

@Injectable()
export class UserValidationService {
  constructor(
    private readonly sqlServerService: SqlServerService,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger,
  ) {}

  async validateUser(username: string, password: string): Promise<LoginResult> {
    let trimmedUsername: string; // Declare outside try block
    try {
      trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      this.logger.debug('Starting user validation process', { username: trimmedUsername });

      const user = await this.findUserByUsername(trimmedUsername);
      if (!user) {
        this.logger.warn('User not found during validation', { username: trimmedUsername });
        this.logger.info('Auth attempt', { username: trimmedUsername, success: false });
        return { success: false, error: 'User not found' };
      }
      this.logger.debug('User found by username', { username: trimmedUsername, userId: user.CODUSU.toString() }); // Convert to string

      // --- New Validation: User Group (CODGRUPO) ---
      // Assuming a CODGRUPO of 0 or null is invalid for login
      if (!user.CODGRUPO || user.CODGRUPO === 0) {
        this.logger.warn(`User group not configured or invalid for user: ${trimmedUsername}`, {
          username: trimmedUsername,
          CODGRUPO: user.CODGRUPO,
        });
        this.logger.info('Auth attempt', { username: trimmedUsername, success: false });
        return { success: false, error: 'User group not configured or invalid' };
      }
      this.logger.debug(`User ${trimmedUsername} is in group ${user.CODGRUPO}`);

      // --- New Validation: Account Access Limit (DTLIMACESSO) ---
      if (user.DTLIMACESSO) {
        const accessLimitDate = new Date(user.DTLIMACESSO);
        if (accessLimitDate.getTime() < Date.now()) {
          this.logger.warn(`Account access limit reached for user: ${trimmedUsername}`, {
            username: trimmedUsername,
            DTLIMACESSO: user.DTLIMACESSO,
          });
          this.logger.info('Auth attempt', { username: trimmedUsername, success: false });
          return { success: false, error: 'Account access limit reached' };
        }
        this.logger.debug(`User ${trimmedUsername} account access limit on ${accessLimitDate.toISOString()}`);
      }
      // If DTLIMACESSO is null, assume no access limit.

      this.logger.debug('Attempting password validation', { username: trimmedUsername });
      const isPasswordValid = await this.validatePassword(trimmedUsername, trimmedPassword);
      if (!isPasswordValid) {
        this.logger.warn('Invalid password provided', { username: trimmedUsername });
        this.logger.info('Auth attempt', { username: trimmedUsername, success: false });
        return { success: false, error: 'Invalid password' };
      }
      this.logger.debug('Password validated successfully', { username: trimmedUsername });

      this.logger.info('Auth attempt', { username: trimmedUsername, success: true });
      return { success: true, user };
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.error('User validation failed - HTTP Exception', error as Error, { username: trimmedUsername });
        throw error;
      }
      this.logger.error('User validation failed - Generic Error', error as Error, { username: trimmedUsername });
      return { success: false, error: 'Validation failed' };
    }
  }

  async findUserByUsername(username: string): Promise<UserDetails | null> {
    this.logger.debug('Searching for user by username', { username });
    const query = `
      SELECT
        u.CODUSU,
        u.NOMEUSU,
        u.EMAIL,
        f.CODFUNC,
        f.NOMEFUNC,
        f.CODEMP,
        u.CODGRUPO,      -- Select user group code
        u.DTLIMACESSO    -- Select account access limit date
      FROM TSIUSU u
      LEFT JOIN TFPFUN f ON u.CODFUNC = f.CODFUNC AND u.CODEMP = f.CODEMP
      WHERE u.NOMEUSU = @param1
    `;

    try {
      const result = await this.sqlServerService.executeSQL(query, [username]);
      if (result.length > 0) {
        this.logger.debug('User found in database', { username, userId: result[0].CODUSU });
        return result[0];
      }
      this.logger.warn('User not found in database by username', { username });
      return null;
    } catch (error) {
      this.logger.error('Failed to find user in findUserByUsername', error as Error, { username });
      throw error;
    }
  }

  private async validatePassword(username: string, password: string): Promise<boolean> {
    this.logger.debug('Starting password comparison', { username });
    const hashedPassword = hashPassword(username, password);

    const query = `
      SELECT
        COUNT(*) as count
      FROM TSIUSU
      WHERE NOMEUSU = @param1
        AND INTERNO = @param2
    `;

    try {
      const result = await this.sqlServerService.executeSQL(query, [username, hashedPassword]);
      const isValid = result.length > 0 && result[0].count > 0;
      this.logger.debug(`Password comparison result for user ${username}: ${isValid ? 'valid' : 'invalid'}`);
      return isValid;
    } catch (error) {
      this.logger.error('Password validation failed in validatePassword', error as Error, { username });
      throw error;
    }
  }

  async getUserDetails(userId: string): Promise<UserDetails | null> {
    this.logger.debug('Attempting to retrieve user details', { userId });
    const query = `
      SELECT 
        u.CODUSU, 
        u.NOMEUSU, 
        u.EMAIL,
        f.CODFUNC,
        f.NOMEFUNC,
        f.CODEMP
      FROM TSIUSU u
      LEFT JOIN TFPFUN f ON u.CODFUNC = f.CODFUNC AND u.CODEMP = f.CODEMP
      WHERE u.CODUSU = @param1
    `;

    try {
      const result = await this.sqlServerService.executeSQL(query, [userId]);
      if (result.length === 0) {
        this.logger.warn(`No data found for user: ${userId}`);
        return null;
      }

      const user = trimFields(result[0]);
      this.logger.debug('User details retrieved successfully', { userId, username: user.NOMEUSU });
      return user;
    } catch (error) {
      this.logger.error('Failed to get user details in getUserDetails', error as Error, { userId });
      throw error;
    }
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    this.logger.debug('Attempting to update user last login', { userId });
    const query = `
      UPDATE TSIUSU 
      SET ULTACESSO = GETDATE()
      WHERE CODUSU = @param1
    `;

    try {
      await this.sqlServerService.executeSQL(query, [userId]);
      this.logger.debug('User last login updated successfully', { userId });
    } catch (error) {
      this.logger.error('Failed to update user last login in updateUserLastLogin', error as Error, { userId });
    }
  }

  validateUsername(username: string): boolean {
    if (!username || username.trim().length === 0) {
      return false;
    }
    const trimmedUsername = username.trim();
    return trimmedUsername.length >= 3 && trimmedUsername.length <= 50;
  }

  validatePasswordFormat(password: string): boolean {
    if (!password || password.trim().length === 0) {
      return false;
    }
    const trimmedPassword = password.trim();
    return trimmedPassword.length >= 4 && trimmedPassword.length <= 100;
  }
}
