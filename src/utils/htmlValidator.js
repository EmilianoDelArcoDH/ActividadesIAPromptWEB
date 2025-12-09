export function evaluateHTMLWithRules(htmlString, validator) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  if (validator.type === "html-h1-text") {
    const h1 = doc.querySelector(validator.tag || "h1");
    if (!h1) {
      return { ok: false, reason: `No se encontró ninguna etiqueta <${validator.tag || "h1"}>.` };
    }
    const txt = (h1.textContent || "").trim();
    if (txt !== validator.text) {
      return {
        ok: false,
        reason: `El texto del <h1> es "${txt}", pero debe ser exactamente "${validator.text}".`,
      };
    }
    return { ok: true, reason: "Perfecto: el <h1> es correcto." };
  }

  if (validator.type === "html-ul-li-min") {
    const ul = doc.querySelector("ul");
    if (!ul) return { ok: false, reason: "Debe existir una lista <ul>." };
    const lis = ul.querySelectorAll("li").length;
    if (lis < (validator.minLi || 1)) {
      return {
        ok: false,
        reason: `La lista <ul> tiene ${lis} <li>, pero debe tener al menos ${validator.minLi}.`,
      };
    }
    return { ok: true, reason: "Correcto: la lista tiene suficientes elementos." };
  }

  // fallback
  return { ok: true, reason: "No hay reglas específicas; se aceptó el código." };
}
