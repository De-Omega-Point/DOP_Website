import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
let classifierPromise;

function loadClassifier() {
  if (!classifierPromise) {
    classifierPromise = pipeline('sentiment-analysis', MODEL_ID, {
      dtype: 'q4',
      progress_callback: (progress) => {
        self.postMessage({ type: 'progress', payload: normaliseProgress(progress) });
      },
    });
  }
  return classifierPromise;
}

function normaliseProgress(progress = {}) {
  return {
    status: progress.status ?? 'loading',
    file: progress.file ?? progress.name ?? '',
    progress: Number.isFinite(progress.progress) ? progress.progress : null,
    loaded: progress.loaded ?? null,
    total: progress.total ?? null,
  };
}

self.addEventListener('message', async (event) => {
  const { id, type, payload } = event.data ?? {};

  try {
    if (type === 'load') {
      await loadClassifier();
      self.postMessage({ id, type: 'result', payload: { model: MODEL_ID, ready: true } });
      return;
    }

    if (type === 'analyse') {
      const classifier = await loadClassifier();
      const text = String(payload?.text ?? '').slice(0, 1800);
      const result = await classifier(text);
      self.postMessage({
        id,
        type: 'result',
        payload: {
          model: MODEL_ID,
          sentiment: result?.[0] ?? null,
        },
      });
      return;
    }

    throw new Error(`Unsupported worker request: ${type}`);
  } catch (error) {
    self.postMessage({ id, type: 'error', error: error instanceof Error ? error.message : String(error) });
  }
});
