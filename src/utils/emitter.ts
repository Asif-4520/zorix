type Handler<T = void> = (payload: T) => void;
type EventName = 'blocked' | 'versionchange';

export class Emitter {
  private handlers: Map<EventName, Set<(payload?: unknown) => void>> = new Map();

  on<T = void>(event: EventName, fn: Handler<T>): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(fn as (payload?: unknown) => void);
    return this;
  }

  off<T = void>(event: EventName, fn: Handler<T>): this {
    this.handlers.get(event)?.delete(fn as (payload?: unknown) => void);
    return this;
  }

  emit<T = void>(event: EventName, payload?: T): void {
    const set = this.handlers.get(event);
    if (set) {
      for (const handler of set) {
        handler(payload);
      }
    }
  }
}
