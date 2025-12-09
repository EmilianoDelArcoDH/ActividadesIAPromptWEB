//ActivityEngine.jsx
import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { useParams } from "react-router-dom";

import { validateActivity } from "../validators/validateActivity";

export function ActivityEngine({ activity, engine }) {
    const { activityId } = useParams();
    const [prompt, setPrompt] = useState(activity.promptHint || "");
    const [htmlCode, setHtmlCode] = useState(
        activity.htmlTemplateAlum || activity.htmlTemplate || ""
    );
    const [cssCode, setCssCode] = useState(activity.cssTemplate || "");
    const [jsCode, setJsCode] = useState(activity.jsTemplate || "");
    const [result, setResult] = useState(null);
    const [loadingIA, setLoadingIA] = useState(false);

    const iaReady = Boolean(engine);

    useEffect(() => {
        setPrompt(activity.promptHint || "");
        setHtmlCode(activity.htmlTemplateAlum || "");
        setCssCode(activity.cssTemplate || "");
        setJsCode(activity.jsTemplate || "");
        setResult(null);
        setLoadingIA(false);
    }, [activity.id]);

    async function runPrompt() {
        console.log("🟦 runPrompt() iniciado");

        // 1) Si la actividad NO usa IA, salimos directo
        if (!activity.mode?.aiGeneratesCode) {
            console.log("ℹ️ Esta actividad no usa IA (aiGeneratesCode = false).");
            return;
        }

        if (!engine) {
            console.log("❌ engine no existe todavía");
            return;
        }

        setLoadingIA(true);

        // 2) Flujo ESPECIAL para actividades de CSS con IA
        if (activity.tech.includes("css") && activity.mode.aiGeneratesCode) {
            // Prompt de sistema genérico para CSS
            const systemPrompt = `
Sos un asistente experto en CSS.
Respondé SOLO con reglas CSS válidas.
NO incluyas etiquetas <style>, ni HTML, ni explicación en texto.
Solo devolvé el código CSS que correspondería a la consigna.
`;

            // Usamos activity.instruction como contexto de la consigna, si existe
            const baseInstruction = activity.instruction
                ? `Consigna de la actividad:\n${activity.instruction}\n\n`
                : "";

            const messages = [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `
${baseInstruction}Prompt del alumno:
${prompt}

Recordá: devolvé SOLO CSS, sin etiquetas <style>, sin HTML extra ni explicación en texto.
      `,
                },
            ];

            console.log("📨 Mensajes enviados al modelo (CSS):", messages);

            let reply;
            try {
                reply = await engine.chat.completions.create({
                    messages,
                    temperature: 0.1,
                });
                console.log("🟩 Respuesta cruda del modelo (CSS):", reply);
            } catch (err) {
                console.log("❌ ERROR en WebLLM (CSS):", err);
                setLoadingIA(false);
                return;
            }

            let fragment = reply?.choices?.[0]?.message?.content || "";
            console.log("🟨 Fragmento ORIGINAL recibido (CSS):", fragment);

            // Sacar fences ```...```
            const fenceMatch = fragment.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
            if (fenceMatch) {
                fragment = fenceMatch[1].trim();
            } else {
                fragment = fragment.replace(/```/g, "").trim();
            }

            // Sacar tags <style> si vinieran igual
            fragment = fragment.replace(/<\/?style[^>]*>/gi, "").trim();

            if (!fragment) {
                console.log("⚠️ La IA devolvió fragmento vacío (CSS). NO insertamos nada.");
                setLoadingIA(false);
                return;
            }

            console.log("🟨 Fragmento LIMPIO (CSS):", fragment);
            setCssCode(fragment);
            setLoadingIA(false);
            return;
        }

        // 3) Flujo JS con IA
        if (activity.tech.includes("js") && activity.mode.aiGeneratesCode) {
            const systemPrompt = `
Sos un asistente experto en JavaScript.
Respondé SOLO con código JavaScript válido.
NO incluyas etiquetas <script>, ni HTML, ni CSS, ni explicaciones.
Tu respuesta debe ser solo el fragmento JS solicitado.
    `;

            const baseInstruction = activity.instruction
                ? `Consigna de la actividad:\n${activity.instruction}\n\n`
                : "";

            const messages = [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `
${baseInstruction}
Prompt del alumno:
${prompt}

Recordá: devolvé SOLO código JavaScript. Nada de HTML, CSS o explicaciones.
        `,
                },
            ];

            console.log("📨 Mensajes enviados al modelo (JS):", messages);

            let reply;
            try {
                reply = await engine.chat.completions.create({
                    messages,
                    temperature: 0.1,
                });
                console.log("🟩 Respuesta cruda del modelo (JS):", reply);
            } catch (err) {
                console.log("❌ ERROR en WebLLM (JS):", err);
                setLoadingIA(false);
                return;
            }

            let fragment = reply?.choices?.[0]?.message?.content || "";
            console.log("🟨 Fragmento ORIGINAL recibido (JS):", fragment);

            // Sacar ``` fences
            const fenceMatch = fragment.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
            if (fenceMatch) {
                fragment = fenceMatch[1].trim();
            } else {
                fragment = fragment.replace(/```/g, "").trim();
            }

            // Limpieza por si mete <script>
            fragment = fragment.replace(/<\/?script[^>]*>/gi, "").trim();

            if (!fragment) {
                console.log("⚠️ La IA devolvió fragmento vacío (JS).");
                setLoadingIA(false);
                return;
            }

            console.log("🟨 Fragmento LIMPIO (JS):", fragment);

            // Insertar en plantilla si existe
            if (activity.jsTemplate && activity.jsTemplate.includes("// Escribí tu función acá")) {
                const finalJS = activity.jsTemplate.replace("// Escribí tu función acá", fragment);
                setJsCode(finalJS);
            } else {
                // Si no hay plantilla, simplemente ponemos el fragmento
                setJsCode(fragment);
            }

            setLoadingIA(false);
            return;
        }

        // 4) Flujo HTML (igual que antes): completar dentro de un template
        const template = activity.htmlTemplate || "";
        const marker = activity.insertMarker || "<!-- INSERT_HTML_HERE -->";

        console.log("📌 Template recibido:", template);
        console.log("📌 Marker usado:", marker);

        const systemPrompt = `
Sos un asistente que completa código dentro de un template dado.
NO modifiques nada fuera del marcador.
NO devuelvas el documento completo.
Respondé SOLO el fragmento que debe ir dentro del marcador:
${marker}
`;

        const messages = [
            { role: "system", content: systemPrompt },
            {
                role: "user",
                content: `
Template del documento:

${template}

Prompt del alumno:
${prompt}

Respondé SOLO con el fragmento que va dentro del marcador.
${marker}
      `,
            },
        ];

        console.log("📨 Mensajes enviados al modelo (HTML):", messages);

        let reply;

        try {
            reply = await engine.chat.completions.create({
                messages,
                temperature: 0.1,
            });

            console.log("🟩 Respuesta cruda del modelo (HTML):", reply);
        } catch (err) {
            console.log("❌ ERROR en WebLLM (HTML):", err);
            setLoadingIA(false);
            return;
        }

        let fragment = reply?.choices?.[0]?.message?.content || "";
        console.log("🟨 Fragmento ORIGINAL recibido (HTML):", fragment);

        const fenceMatch = fragment.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
        if (fenceMatch) {
            fragment = fenceMatch[1].trim();
        } else {
            fragment = fragment.replace(/```/g, "").trim();
        }

        if (!fragment) {
            console.log("⚠️ La IA devolvió fragmento vacío. NO insertamos nada.");
            setLoadingIA(false);
            return;
        }

        const finalHTML = template.replace(marker, fragment);
        console.log("🟧 HTML FINAL tras el replace:", finalHTML);

        if (activity.tech.includes("html")) {
            setHtmlCode(finalHTML);
        }

        setLoadingIA(false);
    }

    function validate() {
        const evaluation = validateActivity(activity, {
            prompt,
            htmlCode,
            cssCode,
            jsCode,
        });
        setResult(evaluation);
    }

    const previewHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Vista previa</title>
  <style>
${cssCode || ""}
  </style>
</head>
<body>
${activity.htmlTemplate || ""}
<script>
${jsCode || ""}
</script>
</body>
</html>
`;


    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "24px",
                background: "#f3f4f6",
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                }}
            >
                {/* Encabezado de la actividad */}
                <div
                    style={{
                        background: "#ffffff",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
                        {activity.title}
                    </h2>
                    {activity.goal && (
                        <p style={{ marginTop: "4px", color: "#4b5563", fontSize: "14px" }}>
                            {activity.goal}
                        </p>
                    )}
                    <p style={{ marginTop: "8px", color: "#6b7280", fontSize: "13px" }}>
                        ID de actividad: <code>{activityId}</code>
                    </p>
                </div>

                {/* GRID principal: izquierda (consigna + editores) / derecha (preview + feedback) */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: activity.preview?.useHtmlAndCss
                            ? "minmax(0, 2fr) minmax(0, 1.5fr)"
                            : "minmax(0, 1fr)",
                        gap: "16px",
                        alignItems: "flex-start",
                    }}
                >
                    {/* COLUMNA IZQUIERDA */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Consigna / Prompt para la IA / Prompt del alumno */}
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "12px",
                                padding: "14px 16px",
                                boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            {activity.instruction && (
                                <div style={{ marginBottom: "10px" }}>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#111827",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Prompt que se le pidió a la IA
                                    </div>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#374151",
                                        }}
                                    >
                                        {activity.instruction}
                                    </p>
                                </div>
                            )}

                            {activity.mode.studentWritesPrompt && (
                                <>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#111827",
                                            marginBottom: "4px",
                                            marginTop: activity.instruction ? "12px" : 0,
                                        }}
                                    >
                                        Tu prompt (lo que vos le pedís a la IA)
                                    </div>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        rows={4}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            fontSize: "14px",
                                            borderRadius: "8px",
                                            border: "1px solid #d1d5db",
                                            resize: "vertical",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                    <button
                                        onClick={runPrompt}
                                        disabled={loadingIA || !iaReady}
                                        style={{
                                            marginTop: "8px",
                                            padding: "8px 14px",
                                            borderRadius: "999px",
                                            border: "none",
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            backgroundColor:
                                                !iaReady ? "#9ca3af" : loadingIA ? "#9ca3af" : "#2563eb",
                                            color: "#ffffff",
                                            cursor: !iaReady || loadingIA ? "default" : "pointer",
                                        }}
                                    >
                                        {!iaReady
                                            ? "Cargando modelo de IA..."
                                            : loadingIA
                                                ? "Generando con IA..."
                                                : "Enviar prompt a la IA"}
                                    </button>

                                    {!iaReady && (
                                        <p
                                            style={{
                                                marginTop: "4px",
                                                fontSize: "12px",
                                                color: "#6b7280",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "12px",
                                                    height: "12px",
                                                    borderRadius: "999px",
                                                    border: "2px solid #9ca3af",
                                                    borderTopColor: "#4b5563",
                                                    animation: "spin 0.8s linear infinite",
                                                    display: "inline-block",
                                                }}
                                            ></span>
                                            Cargando modelo en tu navegador... puede tardar unos segundos la primera vez.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Editores de código */}
                        {activity.tech.includes("html") && (
                            <div
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#111827",
                                        }}
                                    >
                                        HTML
                                    </h3>
                                    {!activity.mode?.studentEditsCode && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                color: "#6b7280",
                                                background: "#f3f4f6",
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                            }}
                                        >
                                            Solo lectura
                                        </span>
                                    )}
                                </div>
                                <CodeMirror
                                    value={htmlCode}
                                    height="220px"
                                    extensions={[html()]}
                                    editable={activity.mode?.studentEditsCode !== false}
                                    onChange={(value) => {
                                        if (activity.mode?.studentEditsCode !== false) {
                                            setHtmlCode(value);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {activity.tech.includes("css") && (
                            <div
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#111827",
                                        }}
                                    >
                                        CSS
                                    </h3>
                                    {!activity.mode?.studentEditsCode && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                color: "#6b7280",
                                                background: "#f3f4f6",
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                            }}
                                        >
                                            Solo lectura
                                        </span>
                                    )}
                                </div>
                                <CodeMirror
                                    value={cssCode}
                                    height="220px"
                                    extensions={[css()]}
                                    editable={activity.mode?.studentEditsCode !== false}
                                    onChange={(value) => {
                                        if (activity.mode?.studentEditsCode !== false) {
                                            setCssCode(value);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {activity.tech.includes("js") && (
                            <div
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: "14px",
                                            color: "#111827",
                                        }}
                                    >
                                        JavaScript
                                    </h3>
                                    {!activity.mode?.studentEditsCode && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                color: "#6b7280",
                                                background: "#f3f4f6",
                                                padding: "2px 8px",
                                                borderRadius: "999px",
                                            }}
                                        >
                                            Solo lectura
                                        </span>
                                    )}
                                </div>
                                <CodeMirror
                                    value={jsCode}
                                    height="220px"
                                    extensions={[javascript()]}
                                    editable={activity.mode?.studentEditsCode !== false}
                                    onChange={(value) => {
                                        if (activity.mode?.studentEditsCode !== false) {
                                            setJsCode(value);
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Vista previa + Validación */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                        }}
                    >
                        {/* Vista previa solo si la actividad lo pide */}
                        {activity.preview?.useHtmlAndCss && (
                            <div
                                className="preview-panel"
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                <div
                                    className="label"
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                        color: "#111827",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Vista previa
                                </div>
                                <iframe
                                    title="preview"
                                    srcDoc={previewHtml}
                                    style={{
                                        width: "100%",
                                        height: "260px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 8,
                                        background: "#ffffff",
                                    }}
                                />
                            </div>
                        )}

                        {/* Panel de validación SIEMPRE visible */}
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "12px",
                                padding: "12px 14px",
                                boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <button
                                style={{
                                    width: "100%",
                                    padding: "9px 12px",
                                    borderRadius: "999px",
                                    border: "none",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    backgroundColor: "#059669",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    marginBottom: "10px",
                                }}
                                onClick={validate}
                            >
                                Validar actividad
                            </button>

                            {result && (
                                <div
                                    style={{
                                        marginTop: 4,
                                        padding: 10,
                                        borderRadius: 8,
                                        background: result.ok ? "#ecfdf5" : "#fef2f2",
                                        border: result.ok ? "1px solid #6ee7b7" : "1px solid #fecaca",
                                        fontSize: "13px",
                                        color: "#111827",
                                    }}
                                >
                                    <strong style={{ display: "block", marginBottom: 4 }}>
                                        {result.ok ? "✔ ¡Muy bien!" : "❌ Revisemos..."}
                                    </strong>
                                    <span>{result.reason}</span>
                                </div>
                            )}

                            {!result && (
                                <p
                                    style={{
                                        margin: 0,
                                        marginTop: 4,
                                        fontSize: "12px",
                                        color: "#6b7280",
                                    }}
                                >
                                    Presioná “Validar actividad” para comprobar tu respuesta.
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
