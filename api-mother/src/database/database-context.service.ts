import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { DatabaseKey, DEFAULT_DATABASE_KEY } from '../config/database.config';

interface DatabaseContext {
  databaseKey: DatabaseKey;
}

@Injectable()
export class DatabaseContextService {
  private readonly storage = new AsyncLocalStorage<DatabaseContext>();

  run<T>(databaseKey: DatabaseKey, callback: () => T): T {
    return this.storage.run({ databaseKey }, callback);
  }

  getCurrentDatabase(): DatabaseKey {
    const store = this.storage.getStore();
    return store?.databaseKey ?? DEFAULT_DATABASE_KEY;
  }
}
