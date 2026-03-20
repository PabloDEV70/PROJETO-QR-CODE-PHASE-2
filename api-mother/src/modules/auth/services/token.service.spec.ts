import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenService, TokenPayload } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: JwtService;

  const MOCK_SECRET = 'test_secret';
  const MOCK_ACCESS_EXP = '1h';
  const MOCK_REFRESH_EXP = '7d';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return MOCK_SECRET;
              if (key === 'JWT_ACCESS_TOKEN_EXPIRATION') return MOCK_ACCESS_EXP;
              if (key === 'JWT_REFRESH_TOKEN_EXPIRATION') return MOCK_REFRESH_EXP;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should call jwtService.sign with payload and access token expiration', () => {
      const payload = { username: 'test', sub: 1 };
      (jwtService.sign as jest.Mock).mockReturnValue('mockAccessToken');
      const token = service.generateAccessToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload, { expiresIn: MOCK_ACCESS_EXP as any });
      expect(token).toBe('mockAccessToken');
    });
  });

  describe('generateRefreshToken', () => {
    it('should call jwtService.sign with payload and refresh token expiration', () => {
      const payload = { username: 'test', sub: 1 };
      (jwtService.sign as jest.Mock).mockReturnValue('mockRefreshToken');
      const token = service.generateRefreshToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload, { expiresIn: MOCK_REFRESH_EXP as any });
      expect(token).toBe('mockRefreshToken');
    });
  });

  describe('verifyToken', () => {
    it('should call jwtService.verify', () => {
      const token = 'someToken';
      const payload = { username: 'test', sub: '1' };
      (jwtService.verify as jest.Mock).mockReturnValue(payload);
      const result = service.verifyToken(token);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual(payload);
    });
  });

  describe('decodeToken', () => {
    it('should call jwtService.decode and return payload', () => {
      const token = 'someToken';
      const payload = { username: 'test', sub: '1' };
      (jwtService.decode as jest.Mock).mockReturnValue(payload);
      const result = service.decodeToken(token);
      expect(result).toEqual(payload);
    });

    it('should return null if decoding fails', () => {
      const token = 'invalidToken';
      (jwtService.decode as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });
      const result = service.decodeToken(token);
      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const header = 'Bearer abc.123.xyz';
      expect(service.extractTokenFromHeader(header)).toBe('abc.123.xyz');
    });

    it('should return null for invalid header', () => {
      const header = 'Basic abc.123.xyz';
      expect(service.extractTokenFromHeader(header)).toBeNull();
    });

    it('should return null for undefined header', () => {
      expect(service.extractTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true if token is expired', () => {
      const token = 'expiredToken';
      const expiredPayload: TokenPayload = { username: 'test', sub: '1', exp: Math.floor(Date.now() / 1000) - 100 };
      (jwtService.decode as jest.Mock).mockReturnValue(expiredPayload);
      expect(service.isTokenExpired(token)).toBe(true);
    });

    it('should return false if token is not expired', () => {
      const token = 'validToken';
      const validPayload: TokenPayload = { username: 'test', sub: '1', exp: Math.floor(Date.now() / 1000) + 100 };
      (jwtService.decode as jest.Mock).mockReturnValue(validPayload);
      expect(service.isTokenExpired(token)).toBe(false);
    });

    it('should return true if decoding fails', () => {
      const token = 'invalidToken';
      (jwtService.decode as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });
      expect(service.isTokenExpired(token)).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date if token is valid', () => {
      const token = 'validToken';
      const expTime = Math.floor(Date.now() / 1000) + 100;
      const payload: TokenPayload = { username: 'test', sub: '1', exp: expTime };
      (jwtService.decode as jest.Mock).mockReturnValue(payload);
      const result = service.getTokenExpiration(token);
      expect(result).toEqual(new Date(expTime * 1000));
    });

    it('should return null if decoding fails', () => {
      const token = 'invalidToken';
      (jwtService.decode as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });
      const result = service.getTokenExpiration(token);
      expect(result).toBeNull();
    });
  });
});
