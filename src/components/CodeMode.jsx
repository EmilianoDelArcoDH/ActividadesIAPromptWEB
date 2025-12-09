import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLanguage } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';
import { evaluateHTMLWithRules } from '../utils/htmlValidator.js';
import { FeedbackBox } from './FeedbackBox.jsx';
import { HtmlPreview } from './HtmlPreview.jsx';

const initialCode = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi primera web</title>
  </head>
  <body>
    <h1>Bienvenido a mi web</h1>
  </body>
</html>`;

export function CodeMode({ activity }) {

  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState(null);

  function handleValidate() {
    const trimmed = code.trim();
    if (!trimmed) {
      setResult({ ok: false, reason: 'Escribí algo de HTML para poder evaluarlo 🙂' });
      return;
    }

    const evalResult = evaluateHTMLWithRules(trimmed, activity.validator);
    setResult(evalResult);
  }

  return (
    <section className="panel">
      <div className="tag">Modo B – Interpretar prompt</div>
      <h2>Evaluar código escrito por el alumno</h2>
      <p className="small">
        {activity.goal}
      </p>

      <div className="row">
        <div>
          <div className="label">🧑 Código HTML del alumno</div>
          <CodeMirror
            value={code}
            height="260px"
            extensions={[htmlLanguage(), EditorView.lineWrapping]}
            onChange={(value) => setCode(value)}
          />
          <button className="primary-btn" onClick={handleValidate}>
            Validar mi código
          </button>
          <FeedbackBox
            result={result}
            prefixOk="✅ Código correcto:"
            prefixBad="⚠️ Hay cosas para mejorar:"
          />
        </div>

        <div>
          <div className="label">👀 Vista previa</div>
          <HtmlPreview code={code} />
        </div>
      </div>
    </section>
  );
}
