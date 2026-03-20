import { FastifyInstance } from 'fastify';

interface PresenceEntry {
  codusu: number;
  nome: string;
  codparc: number | null;
  codgrupo: number | null;
  lastSeen: number; // timestamp ms
}

// In-memory presence store — no external deps
const online = new Map<number, PresenceEntry>();
const ONLINE_THRESHOLD_MS = 90_000; // 90s — if no heartbeat, considered offline

function pruneOffline() {
  const cutoff = Date.now() - ONLINE_THRESHOLD_MS;
  for (const [codusu, entry] of online) {
    if (entry.lastSeen < cutoff) online.delete(codusu);
  }
}

export async function presenceRoutes(app: FastifyInstance) {

  // Heartbeat — client calls every 30s
  app.post('/presence/heartbeat', async (request) => {
    const body = request.body as {
      codusu: number;
      nome?: string;
      codparc?: number | null;
      codgrupo?: number | null;
    };

    if (!body.codusu) return { ok: false };

    online.set(body.codusu, {
      codusu: body.codusu,
      nome: body.nome ?? '',
      codparc: body.codparc ?? null,
      codgrupo: body.codgrupo ?? null,
      lastSeen: Date.now(),
    });

    return { ok: true };
  });

  // Get online users
  app.get('/presence/online', async () => {
    pruneOffline();
    const users = Array.from(online.values()).map((e) => ({
      codusu: e.codusu,
      nome: e.nome,
      codparc: e.codparc,
      codgrupo: e.codgrupo,
    }));
    return users;
  });
}
