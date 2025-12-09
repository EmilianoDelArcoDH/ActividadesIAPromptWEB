import { useEffect, useState } from 'react';
import * as webllm from "@mlc-ai/web-llm";
// Importamos WebLLM directamente desde CDN para evitar depender de NPM en este prototipo.
// const webllmUrl = 'https://esm.run/@mlc-ai/web-llm';
// const webllmUrl = "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/dist/index.min.js";


export function usePhiModel() {
  const [engine, setEngine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({
    progress: 0,
    text: "Inicializando…",
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Modelo de Phi-3 Mini soportado por WebLLM
        // const modelId = "Phi-3-mini-4k-instruct-q4f16_1-MLC-1k";
        const modelId = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

        const eng = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (p) => {
            if (cancelled) return;
            setProgress({
              progress: p.progress ?? 0,
              text: p.text ?? "",
            });
          },
        });

        if (cancelled) return;
        setEngine(eng);
      } catch (err) {
        console.error("Error cargando modelo IA:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { engine, loading, error, progress };
}