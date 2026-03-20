import fs from 'fs';
import path from 'path';
import { logger } from '../../shared/logger';

export interface Operador {
  codparc: number;
  nome: string;
  nomeusu: string;
}

export interface PainelEntry {
  id: string;
  modelo: string;
  tag: string;
  placa: string;
  specs: string;
  operadores: Operador[];
  contratante: string;
  local: string;
  previsao: string;
  status: 'FIXO' | 'PARADA' | 'MANUTENCAO' | 'PROGRAMADO' | 'DISPONIVEL';
  updatedBy: string | null;
  updatedAt: string;
}

type SSEClient = (data: string) => void;

const DATA_FILE = path.resolve(__dirname, '../../../data/painel-saidas.json');

class PainelSaidasStore {
  private entries: PainelEntry[] = [];
  private clients: Set<SSEClient> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.entries = JSON.parse(raw);
        logger.info(`[painel-saidas] loaded ${this.entries.length} entries`);
      }
    } catch (err) {
      logger.warn('[painel-saidas] failed to load, starting empty');
      this.entries = [];
    }
  }

  private persist() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.entries, null, 2), 'utf-8');
    } catch (err) {
      logger.error('[painel-saidas] failed to persist');
    }
  }

  private broadcast(event: string, payload: unknown) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.clients) {
      try { client(msg); } catch { this.clients.delete(client); }
    }
  }

  addClient(send: SSEClient) { this.clients.add(send); }
  removeClient(send: SSEClient) { this.clients.delete(send); }
  get clientCount() { return this.clients.size; }

  list(): PainelEntry[] { return this.entries; }

  get(id: string): PainelEntry | undefined {
    return this.entries.find((e) => e.id === id);
  }

  add(entry: Omit<PainelEntry, 'id' | 'updatedAt'>, user: string): PainelEntry {
    const item: PainelEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      updatedBy: user,
      updatedAt: new Date().toISOString(),
    };
    this.entries.push(item);
    this.persist();
    this.broadcast('add', item);
    return item;
  }

  update(id: string, changes: Partial<PainelEntry>, user: string): PainelEntry | null {
    const idx = this.entries.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.entries[idx] = {
      ...this.entries[idx]!,
      ...changes,
      id, // prevent id override
      updatedBy: user,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    this.broadcast('update', this.entries[idx]);
    return this.entries[idx]!;
  }

  remove(id: string): boolean {
    const idx = this.entries.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    this.entries.splice(idx, 1);
    this.persist();
    this.broadcast('remove', { id });
    return true;
  }

  /** Bulk replace all entries (for initial import) */
  replaceAll(entries: Omit<PainelEntry, 'id' | 'updatedAt'>[], user: string): PainelEntry[] {
    this.entries = entries.map((e) => ({
      ...e,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      updatedBy: user,
      updatedAt: new Date().toISOString(),
    }));
    this.persist();
    this.broadcast('reset', this.entries);
    return this.entries;
  }
}

export const painelSaidasStore = new PainelSaidasStore();
