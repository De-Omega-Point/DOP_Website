/**
 * Transformers.js adapter for the De-Omega command deck.
 * Model loading is lazy and performed inside a Web Worker so the UI stays responsive.
 */
export class TransformerBridge {
  constructor({ onProgress } = {}) {
    this.onProgress = onProgress ?? (() => {});
    this.worker = null;
    this.ready = false;
    this.pending = new Map();
    this.sequence = 0;
  }

  async initialise() {
    if (this.ready) return true;
    if (!this.worker) this.#createWorker();

    return this.#request('load', {}).then(() => {
      this.ready = true;
      return true;
    });
  }

  async analyse(text) {
    if (!this.ready) await this.initialise();
    return this.#request('analyse', { text });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.pending.clear();
  }

  #createWorker() {
    this.worker = new Worker(new URL('./omega.worker.js', import.meta.url), { type: 'module' });

    this.worker.addEventListener('message', (event) => {
      const { id, type, payload, error } = event.data ?? {};

      if (type === 'progress') {
        this.onProgress(payload);
        return;
      }

      const request = this.pending.get(id);
      if (!request) return;

      this.pending.delete(id);
      if (error) request.reject(new Error(error));
      else request.resolve(payload);
    });

    this.worker.addEventListener('error', (event) => {
      const error = new Error(event.message || 'Local AI worker failed.');
      for (const request of this.pending.values()) request.reject(error);
      this.pending.clear();
      this.ready = false;
    });
  }

  #request(type, payload) {
    const id = `omega-${++this.sequence}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, payload });
    });
  }
}
