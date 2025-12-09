import React from 'react';

export function HtmlPreview({ code }) {
  const srcDoc = code || '<p style="color:#64748b;font-size:13px;">(No hay contenido para mostrar)</p>';

  return (
    <iframe
      className="preview-frame"
      title="Vista previa HTML"
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
    />
  );
}