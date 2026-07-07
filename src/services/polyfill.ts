// Polyfill DOMException globally for native Hermes in React Native
if (typeof globalThis.DOMException === 'undefined') {
  class DOMException extends Error {
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'Error';
    }
  }
  (globalThis as any).DOMException = DOMException;
}
