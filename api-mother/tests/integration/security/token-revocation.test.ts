import { TokenRevocationService } from '../../../src/modules/auth/services/token-revocation.service';
import { ConfigService } from '@nestjs/config';

// Mock TokenService
const mockTokenService = {
  getTokenExpiration: jest.fn().mockReturnValue(new Date(Date.now() + 3600_000)),
};

describe('Token Revocation Service (in-memory fallback)', () => {
  let service: TokenRevocationService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockReturnValue(undefined), // No REDIS_URL = in-memory
    } as unknown as ConfigService;

    service = new TokenRevocationService(mockTokenService as any, mockConfigService);
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('token novo nao esta revogado', async () => {
    const result = await service.isRevoked('token-abc-123');
    expect(result).toBe(false);
  });

  it('token revogado retorna true', async () => {
    const token = 'token-to-revoke-456';
    await service.revoke(token);
    const result = await service.isRevoked(token);
    expect(result).toBe(true);
  });

  it('tokens diferentes nao se afetam', async () => {
    await service.revoke('token-A');
    expect(await service.isRevoked('token-A')).toBe(true);
    expect(await service.isRevoked('token-B')).toBe(false);
  });

  it('multiplos tokens podem ser revogados', async () => {
    await service.revoke('token-1');
    await service.revoke('token-2');
    await service.revoke('token-3');
    expect(await service.isRevoked('token-1')).toBe(true);
    expect(await service.isRevoked('token-2')).toBe(true);
    expect(await service.isRevoked('token-3')).toBe(true);
    expect(await service.isRevoked('token-4')).toBe(false);
  });

  it('usa hash do token, nao o token em si', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
    await service.revoke(token);
    // Deve encontrar pelo mesmo token
    expect(await service.isRevoked(token)).toBe(true);
    // Nao deve encontrar por token diferente
    expect(await service.isRevoked(token + 'x')).toBe(false);
  });
});
