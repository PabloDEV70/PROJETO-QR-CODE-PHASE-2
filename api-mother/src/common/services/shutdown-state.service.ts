import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class ShutdownStateService implements OnApplicationShutdown {
  private isShuttingDown = false;

  markShuttingDown(): void {
    this.isShuttingDown = true;
  }

  isInShutdown(): boolean {
    return this.isShuttingDown;
  }

  async onApplicationShutdown(_signal?: string): Promise<void> {
    this.markShuttingDown();
    // Brief pause so health checks can observe the shutting_down state
    // before the process begins tearing down modules.
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }
}
