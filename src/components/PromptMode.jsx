import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLanguage } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';
import { evaluateHTMLWithRules } from '../utils/htmlValidator.js';
import { FeedbackBox } from './FeedbackBox.jsx';

export function PromptMode({ engine, loading, error, activity  }) {
  const [prompt, setPrompt] = useState(
  activity.promptHint ||
    'Escribí un prompt para que la IA genere el HTML correcto...'
);

  const [generatedCode, setGeneratedCode] = useState(
    '<!DOCTYPE html>\n<html lang="es">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Mi primera web</title>\n  </head>\n  <body>\n    <!-- Acá va a aparecer el código generado por la IA -->\n  </body>\n</html>'
  );
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const disabled = loading || !engine || !!error || running;

  async function handleRun() {
    if (!engine) return;
    const trimmed = prompt.trim();
    if (!trimmed) {
      setResult({ ok: false, reason: 'Escribí un prompt primero 😉' });
      return;
    }

    setRunning(true);
    setResult({ ok: false, reason: 'Generando código con tu prompt...' });

    try {
      const messages = [
        {
          role: 'system',
          content:
            'Sos un generador de código HTML. Siempre respondés SOLO con código HTML válido, ' +
            'sin explicaciones ni texto fuera de etiquetas.',
        },
        { role: 'user', content: trimmed },
      ];

      const reply = await engine.chat.completions.create({
        messages,
        temperature: 0.3,
        stream: false,
      });

      // 1) Tomamos el texto bruto
      let raw = reply?.choices?.[0]?.message?.content || "";

      // 2) Sacamos posibles fences de markdown y el "Answer:" o similares
      let html = raw
        .replace(/```html/gi, "")
        .replace(/```/g, "")
        .replace(/^[\s\-]*Answer:\s*/i, "") // quita "Answer:" al inicio si lo hay
        .trim();

      // 3) Si hay más de un bloque, nos quedamos solo con el primer <html>...</html>
      const match = html.match(/<html[\s\S]*?<\/html>/i);
      if (match) {
        html = match[0];
      }

      // 4) Si no hay <html>, pero hay <body>, envolvemos
      if (!match && /<body[\s\S]*<\/body>/i.test(html)) {
        html = `<!DOCTYPE html>\n<html>\n${html}\n</html>`;
      }

      // 5) Guardamos el código limpio
      setGeneratedCode(html || "<!-- No se recibió código -->");

      // 6) Evaluamos el HTML limpio
      const evalResult = evaluateHTMLWithRules(html, activity.validator);
      setResult({
        ok: evalResult.ok,
        reason:
          (evalResult.ok ? "Prompt eficaz: " : "El prompt no logró el objetivo: ") +
          evalResult.reason,
      });

    } catch (err) {
      console.error('Error al llamar al modelo:', err);
      setResult({
        ok: false,
        reason: 'Error al llamar al modelo: ' + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="panel">
      <div className="tag">Modo A – Prompt engineering</div>
      <h2>Evaluar eficacia del prompt</h2>
      <p className="small">
        Objetivo del ejercicio: lograr que la IA genere un código HTML que contenga un
        &lt;h1&gt; con el texto exacto <b>"Bienvenido a mi web"</b>.
      </p>

      {/* Caja de PROMPT aparte */}
      <div className="prompt-box">
        <div className="label">🧑 Prompt del alumno para la IA</div>
        <CodeMirror
          value={prompt}
          height="160px"
          extensions={[htmlLanguage(), EditorView.lineWrapping]}
          onChange={(value) => setPrompt(value)}
        />
        <button className="primary-btn" onClick={handleRun} disabled={disabled}>
          {running ? 'Generando...' : 'Probar prompt (IA genera HTML)'}
        </button>
        <FeedbackBox result={result} />
      </div>

      {/* Caja de código generado aparte, abajo y con colores */}
      <div style={{ marginTop: '18px' }}>
        <div className="label">🤖 Código HTML generado por la IA</div>
        <CodeMirror
          value={generatedCode}
          height="220px"
          extensions={[htmlLanguage(), EditorView.lineWrapping]}
          editable={false}
          readOnly={true}
        />
      </div>

      {error && (
        <p className="feedback bad" style={{ marginTop: '10px' }}>
          ❌ Error del modelo (modo prompt): {error}
        </p>
      )}
    </section>
  );
}
