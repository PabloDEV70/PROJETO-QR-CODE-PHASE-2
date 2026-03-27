import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RedisService } from '../../../common/services/redis.service';

@ApiTags('Monitoring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('monitoring')
export class UsersOnlineController {
  constructor(private readonly redisService: RedisService) {}

  @Get('users-online')
  @ApiQuery({ name: 'database', required: false, enum: ['PROD', 'TESTE', 'TREINA'] })
  async getUsersOnline(@Query('database') database?: string) {
    const redis = this.redisService.getClient();
    if (!redis) {
      return { online: [], total: 0, source: 'unavailable', message: 'Redis not connected' };
    }

    const databases = database ? [database] : ['PROD', 'TESTE', 'TREINA'];
    const allUsers: Record<string, unknown>[] = [];

    for (const db of databases) {
      const userIds = await redis.zrevrange(`users:online:${db}`, 0, -1);

      if (userIds.length === 0) continue;

      const pipeline = redis.pipeline();
      for (const uid of userIds) {
        pipeline.get(`user:active:${db}:${uid}`);
      }
      const results = await pipeline.exec();

      if (results) {
        for (const [err, val] of results) {
          if (!err && val) {
            try {
              allUsers.push(JSON.parse(val as string));
            } catch { /* skip malformed */ }
          }
        }
      }
    }

    // Sort by lastSeen desc
    allUsers.sort((a, b) => {
      const ta = new Date(a.lastSeen as string).getTime();
      const tb = new Date(b.lastSeen as string).getTime();
      return tb - ta;
    });

    return {
      online: allUsers,
      total: allUsers.length,
      databases: database ? [database] : ['PROD', 'TESTE', 'TREINA'],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('users-online/count')
  @ApiQuery({ name: 'database', required: false, enum: ['PROD', 'TESTE', 'TREINA'] })
  async getUsersOnlineCount(@Query('database') database?: string) {
    const redis = this.redisService.getClient();
    if (!redis) return { total: 0, source: 'unavailable' };

    const databases = database ? [database] : ['PROD', 'TESTE', 'TREINA'];
    const counts: Record<string, number> = {};
    let total = 0;

    for (const db of databases) {
      const now = Date.now();
      await redis.zremrangebyscore(`users:online:${db}`, '-inf', now - 300_000);
      const count = await redis.zcard(`users:online:${db}`);
      counts[db] = count;
      total += count;
    }

    return { counts, total, timestamp: new Date().toISOString() };
  }
}
