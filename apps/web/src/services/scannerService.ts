type BarcodeDetectionResult = { rawValue?: string };

type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectionResult[]>;
};

const getBarcodeDetectorCtor = (): BarcodeDetectorCtor | null => {
  const browserWindow = window as unknown as { BarcodeDetector?: BarcodeDetectorCtor };
  return browserWindow.BarcodeDetector ?? null;
};

export const scanBarcodeFromImage = async (file: File): Promise<string | null> => {
  const BarcodeDetector = getBarcodeDetectorCtor();

  if (BarcodeDetector && 'createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file);
    try {
      const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
      const results = await detector.detect(bitmap);
      const code = results.find((result) => result.rawValue)?.rawValue?.trim();
      if (code) {
        return code;
      }
    } finally {
      bitmap.close();
    }
  }

  const quaggaModule = await import('@ericblade/quagga2');
  const objectUrl = URL.createObjectURL(file);

  try {
    const result = await quaggaModule.default.decodeSingle({
      src: objectUrl,
      numOfWorkers: 0,
      inputStream: { size: 800 },
      decoder: { readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader'] },
    });
    return result?.codeResult?.code ?? null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export const recognizeTextFromImage = async (file: File, languages = 'deu+eng'): Promise<string> => {
  const tesseractModule = await import('tesseract.js');
  const objectUrl = URL.createObjectURL(file);

  try {
    const result = await tesseractModule.recognize(objectUrl, languages);
    return result.data.text?.trim() ?? '';
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};