import { classifyPantryImage, type VisionClassificationHit } from '@domain/ai-core';
import i18next from 'i18next';
import { logAppError } from './errorLoggingService';
import { getActiveSettingsForAi } from './aiSettingsHelpers';

const LABEL_I18N_KEY: Record<string, string> = {
  tomato: 'localAiVision.labels.tomato',
  onion: 'localAiVision.labels.onion',
  garlic: 'localAiVision.labels.garlic',
  potato: 'localAiVision.labels.potato',
  carrot: 'localAiVision.labels.carrot',
  cucumber: 'localAiVision.labels.cucumber',
  lettuce: 'localAiVision.labels.lettuce',
  pepper: 'localAiVision.labels.pepper',
  broccoli: 'localAiVision.labels.broccoli',
  apple: 'localAiVision.labels.apple',
  banana: 'localAiVision.labels.banana',
  orange: 'localAiVision.labels.orange',
  lemon: 'localAiVision.labels.lemon',
  milk: 'localAiVision.labels.milk',
  cheese: 'localAiVision.labels.cheese',
  butter: 'localAiVision.labels.butter',
  yogurt: 'localAiVision.labels.yogurt',
  egg: 'localAiVision.labels.egg',
  bread: 'localAiVision.labels.bread',
  rice: 'localAiVision.labels.rice',
  pasta: 'localAiVision.labels.pasta',
  flour: 'localAiVision.labels.flour',
  sugar: 'localAiVision.labels.sugar',
  salt: 'localAiVision.labels.salt',
  oil: 'localAiVision.labels.oil',
  chicken: 'localAiVision.labels.chicken',
  beef: 'localAiVision.labels.beef',
  fish: 'localAiVision.labels.fish',
  shrimp: 'localAiVision.labels.shrimp',
  tofu: 'localAiVision.labels.tofu',
  beans: 'localAiVision.labels.beans',
  mushroom: 'localAiVision.labels.mushroom',
  herb: 'localAiVision.labels.herb',
  wine: 'localAiVision.labels.wine',
  beer: 'localAiVision.labels.beer',
  juice: 'localAiVision.labels.juice',
  coffee: 'localAiVision.labels.coffee',
  tea: 'localAiVision.labels.tea',
  chocolate: 'localAiVision.labels.chocolate',
  nuts: 'localAiVision.labels.nuts',
};

type PendingRequest = {
  resolve: (hits: VisionClassificationHit[]) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let requestId = 0;
const pendingRequests = new Map<number, PendingRequest>();

const getWorker = (): Worker | null => {
  if (typeof Worker === 'undefined' || import.meta.env.VITEST) {
    return null;
  }

  if (!worker) {
    worker = new Worker(new URL('../workers/vision.worker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener(
      'message',
      (event: MessageEvent<{ id: number; hits?: VisionClassificationHit[]; error?: string }>) => {
        const pending = pendingRequests.get(event.data.id);
        if (!pending) {
          return;
        }
        pendingRequests.delete(event.data.id);
        if (event.data.error) {
          pending.reject(new Error(event.data.error));
          return;
        }
        pending.resolve(event.data.hits ?? []);
      },
    );
    worker.addEventListener('error', (event: ErrorEvent) => {
      const message = event.message || 'vision-worker-error';
      for (const [id, pending] of pendingRequests) {
        pending.reject(new Error(message));
        pendingRequests.delete(id);
      }
    });
  }

  return worker;
};

const classifyInWorkerOrMain = async (image: Blob): Promise<VisionClassificationHit[]> => {
  const activeWorker = getWorker();
  if (!activeWorker) {
    return classifyPantryImage(image);
  }

  return new Promise((resolve, reject) => {
    const id = requestId++;
    pendingRequests.set(id, { resolve, reject });
    activeWorker.postMessage({ id, image });
  });
};

/** Entfernt EXIF durch Canvas-Reencode (kein Metadata-Leak bei lokalem Scan). */
export const stripImageExif = async (file: File): Promise<Blob> => {
  if (typeof createImageBitmap !== 'function') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return file;
      }
      ctx.drawImage(bitmap, 0, 0);
      return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
    }

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return file;
    }
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/jpeg', 0.92);
    });
    return blob ?? file;
  } finally {
    bitmap.close();
  }
};

const localizeLabel = (label: string): string => {
  const key = LABEL_I18N_KEY[label.toLowerCase()];
  if (!key) {
    return label;
  }
  const translated = i18next.t(key);
  return translated === key ? label : translated;
};

export const formatVisionHitsAsPantryText = (hits: VisionClassificationHit[]): string =>
  hits.map((hit) => localizeLabel(hit.label)).join(', ');

// QNBS-v3: M11.4 ONNX/CLIP Vision — lokal Vorratsfoto → Labels; Cloud bleibt Fallback
export const extractPantryItemsFromImageLocal = async (imageFile: File): Promise<string | null> => {
  const settings = getActiveSettingsForAi();
  if (!settings.localAi.enabled || !settings.localAi.enableVision) {
    return null;
  }

  try {
    const prepared = settings.localAi.stripExifOnVision
      ? await stripImageExif(imageFile)
      : imageFile;
    const hits = await classifyInWorkerOrMain(prepared);
    if (hits.length === 0) {
      return null;
    }
    return formatVisionHitsAsPantryText(hits);
  } catch (error) {
    void logAppError(error, 'localAiVision.classify');
    return null;
  }
};

export const resetVisionWorkerForTests = (): void => {
  worker?.terminate();
  worker = null;
  pendingRequests.clear();
  requestId = 0;
};
