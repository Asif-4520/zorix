import { expect, it, describe, vi } from 'vitest';
import { Emitter } from '../../src/utils/emitter';

describe('Emitter Unit Tests', () => {
  it('should register, emit, and detach event listeners', () => {
    const emitter = new Emitter();
    const fn = vi.fn();

    emitter.on('insert', fn);
    emitter.emit('insert', { count: 1 });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ count: 1 });

    emitter.off('insert', fn);
    emitter.emit('insert', { count: 2 });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle once() listeners correctly', () => {
    const emitter = new Emitter();
    const fn = vi.fn();

    emitter.once('update', fn);
    emitter.emit('update', { id: 1 });
    emitter.emit('update', { id: 2 });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({ id: 1 });
  });

  it('should remove all listeners', () => {
    const emitter = new Emitter();
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    emitter.on('change', fn1);
    emitter.on('delete', fn2);

    emitter.removeAllListeners();
    emitter.emit('change', {});
    emitter.emit('delete', {});

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).not.toHaveBeenCalled();
  });
});
