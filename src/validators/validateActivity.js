//validateActivity.js
export function validateActivity(activity, { promptIA, htmlCode, cssCode, jsCode }) {

    const v = activity.validator;

    // Validar prompt
    if (v.promptMustContain) {
        const lowerPrompt = promptIA.toLowerCase();
        for (const word of v.promptMustContain) {
            if (!lowerPrompt.includes(word.toLowerCase())) {
                return { ok: false, reason: `El prompt debe incluir: "${word}"` };
            }
        }
    }

    // Validador genérico de <h1> por texto exacto, si la actividad lo pide
    if (v.h1TextEquals) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCode, "text/html");
        const h1 = doc.querySelector("h1");
        if (!h1) {
            return { ok: false, reason: "No se encontró ningún <h1> en el HTML." };
        }
        const text = (h1.textContent || "").trim();
        if (text !== v.h1TextEquals) {
            return {
                ok: false,
                reason: `El <h1> tiene el texto "${text}", pero debe ser exactamente "${v.h1TextEquals}".`,
            };
        }
    }


    // Validar HTML
    if (v.htmlMustContain) {
        for (const req of v.htmlMustContain) {
            if (!htmlCode.replace(/\s+/g, "").includes(req.replace(/\s+/g, ""))) {
                return { ok: false, reason: `El HTML debe contener: ${req}` };
            }
        }
    }

    // Listas
    // Contar <li>
    if (v.minLi) {
        const count = (htmlCode.match(/<li\b/gi) || []).length;
        if (count < v.minLi) {
            return {
                ok: false,
                reason: `El HTML debe contener al menos ${v.minLi} elementos <li>. Actualmente tiene ${count}.`,
            };
        }
    }

    if (v.maxLi) {
        const count = (htmlCode.match(/<li\b/gi) || []).length;
        if (count > v.maxLi) {
            return {
                ok: false,
                reason: `El HTML debe contener como máximo ${v.maxLi} elementos <li>. Actualmente tiene ${count}.`,
            };
        }
    }

    // Verificar que dentro del <ul> no haya texto fuera de los <li>
    if (v.liOnlyInUl) {
        const ulMatch = htmlCode.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
        if (ulMatch) {
            const insideUl = ulMatch[1];
            // eliminamos todos los <li>...</li> y etiquetas de espacio
            const rest = insideUl
                .replace(/<li[\s\S]*?<\/li>/gi, "")
                .replace(/<!--[\s\S]*?-->/g, "")
                .trim();

            if (rest) {
                return {
                    ok: false,
                    reason:
                        "Dentro del <ul> solo debe haber elementos <li>. Hay texto u otras etiquetas fuera de los <li>.",
                };
            }
        }
    }
    // Validar que los <li> contengan exactamente los textos requeridos
    if (v.liExactItems) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCode, "text/html");
        const liElements = Array.from(doc.querySelectorAll("li"));

        const userItems = liElements.map(li => (li.textContent || "").trim());
        const expectedItems = v.liExactItems.map(t => t.trim());

        // Validar cantidad correcta
        if (userItems.length !== expectedItems.length) {
            return {
                ok: false,
                reason: `Debe haber exactamente ${expectedItems.length} elementos <li>. Encontrados: ${userItems.length}.`
            };
        }

        // Validar contenido exacto
        for (let i = 0; i < expectedItems.length; i++) {
            if (userItems[i] !== expectedItems[i]) {
                return {
                    ok: false,
                    reason: `El ítem #${i + 1} debe ser "${expectedItems[i]}", pero se encontró "${userItems[i]}".`
                };
            }
        }
    }



    // Validar CSS
    if (v.cssMustContain) {
        for (const req of v.cssMustContain) {
            if (!cssCode.includes(req)) {
                return { ok: false, reason: `El CSS debe contener: ${req}` };
            }
        }
    }

    // Validar JS
    if (v.jsMustContain) {
        for (const req of v.jsMustContain) {
            if (!jsCode.includes(req)) {
                return { ok: false, reason: `El JS debe contener: ${req}` };
            }
        }
    }

    // -----------------------------
// VALIDAR addEventListener específico
// -----------------------------
if (v.jsMustContainEvent) {
    const cleanJS = jsCode.replace(/\s+/g, " ").trim().toLowerCase();

    // Patrón flexible que acepte:
    // - comillas simples o dobles
    // - espacios variados
    // - function() { ... } o function () { ... }
    // - alert con el texto correcto
    const regex = /document\.getelementbyid\(["']miboton["']\)\.addeventlistener\(\s*["']click["']\s*,\s*function\s*\(\s*\)\s*\{\s*alert\(\s*["']¡botón clickeado!["']\s*\)\s*;\s*\}\s*\)/i;

    if (!regex.test(jsCode)) {
        return {
            ok: false,
            reason:
                "Tu código JS debe agregar un addEventListener al botón 'miBoton' que muestre un alert con el texto: ¡Botón clickeado!",
        };
    }
}


    return { ok: true, reason: "Todo correcto." };
}
