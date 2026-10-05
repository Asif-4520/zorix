export type DBEventName =
  | 'blocked'
  | 'versionchange'
  | 'open'
  | 'connect'
  | 'close'
  | 'error'
  | 'upgrade'
  | 'insert'
  | 'update'
  | 'delete'
  | 'clear'
  | 'change';

export type ModelEventName = 'insert' | 'update' | 'delete' | 'clear' | 'change';

export type EventName = DBEventName | ModelEventName | (string & {});

type Handler<T = any> = (payload: T) => void;

export class Emitter {
  private handlers: Map<string, Set<Handler>> = new Map();

  /** Registers a persistent event listener. */
  on<T = any>(event: EventName, fn: Handler<T>): this {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(fn);
    return this;
  }

  /** Removes a registered event listener. */
  off<T = any>(event: EventName, fn: Handler<T>): this {
    this.handlers.get(event)?.delete(fn);
    return this;
  }

  /** Registers a one-time event listener that auto-removes after firing once. */
  once<T = any>(event: EventName, fn: Handler<T>): this {
    const onceWrapper = (payload: T) => {
      this.off(event, onceWrapper);
      fn(payload);
    };
    return this.on(event, onceWrapper);
  }

  /** Emits an event with optional payload data. */
  emit<T = any>(event: EventName, payload?: T): void {
    const set = this.handlers.get(event);
    if (set) {
      // Execute on copy to safely handle once() unsubscriptions during loop
      const callbacks = Array.from(set);
      for (const handler of callbacks) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`Error in event listener for "${event}":`, err);
        }
      }
    }
  }

  /** Removes all event listeners for a specific event or all events. */
  removeAllListeners(event?: EventName): this {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
    return this;
  }
}
