export type GpuTier = 'high' | 'balanced' | 'efficient' | 'cpu-only';

export type GpuTierPreference = 'auto' | GpuTier;

export type GpuTierDetection = {
  tier: GpuTier;
  webGpuAvailable: boolean;
};

/**
 * Erkennt Hardware-Stufe für Local-AI (WebGPU → balanced, sonst WASM/CPU).
 */
export async function detectGpuTier(): Promise<GpuTierDetection> {
  if (typeof navigator === 'undefined') {
    return { tier: 'cpu-only', webGpuAvailable: false };
  }

  try {
    const gpu = navigator.gpu;
    if (!gpu) {
      return { tier: 'efficient', webGpuAvailable: false };
    }
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return { tier: 'efficient', webGpuAvailable: false };
    }
    return { tier: 'high', webGpuAvailable: true };
  } catch {
    return { tier: 'efficient', webGpuAvailable: false };
  }
}

export const resolveGpuTier = (
  preference: GpuTierPreference,
  detected: GpuTier,
): GpuTier => {
  if (preference !== 'auto') {
    return preference;
  }
  return detected;
};

export const shouldSkipWebGpuLayer = (tier: GpuTier): boolean =>
  tier === 'efficient' || tier === 'cpu-only';
