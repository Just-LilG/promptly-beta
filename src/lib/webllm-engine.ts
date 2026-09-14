import type { MLCEngineInterface, InitProgressReport } from "@mlc-ai/web-llm";

// Small, fast model — good fit for a browser-loaded coaching assistant.
// Llama-3.2-1B is ~0.9GB quantized; a reasonable balance of speed and quality
// for a task this narrow (evaluating and discussing prompts).
export const MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let enginePromise: Promise<MLCEngineInterface> | null = null;

export function isWebGPUSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

export async function getEngine(
  onProgress?: (report: InitProgressReport) => void
): Promise<MLCEngineInterface> {
  if (!isWebGPUSupported()) {
    throw new Error("WEBGPU_UNSUPPORTED");
  }

  if (!enginePromise) {
    enginePromise = (async () => {
      const webllm = await import("@mlc-ai/web-llm");
      const engine = new webllm.MLCEngine();
      if (onProgress) {
        engine.setInitProgressCallback(onProgress);
      }
      await engine.reload(MODEL_ID);
      return engine;
    })();
  } else if (onProgress) {
    // Someone else already kicked off loading — best effort, attach nothing new,
    // the original caller's callback already covers progress.
  }

  return enginePromise;
}

export function resetEngine() {
  enginePromise = null;
}
