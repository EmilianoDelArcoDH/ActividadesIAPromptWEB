# Profe IA – Llama-3.2 (React + Vite)

Proyecto de ejemplo para actividades mixtas de prompt engineering y código HTML,
usando el modelo Llama-3.2 que corre **directamente en el navegador** vía WebLLM.

## Requisitos

- Node.js 18+ recomendado
- Conexión a internet (solo para descargar el modelo y la librería desde CDN)

## Instalación

```bash
npm install
npm run dev
```

Luego abrí la URL que te indique Vite (por defecto http://localhost:5173).

## Qué incluye

- **Modo A – Evaluar prompt**:
  - El alumno escribe un prompt para la IA.
  - La IA (Llama-3.2) genera código HTML.
  - Un validador revisa si el código contiene un `<h1>` con el texto exacto "Bienvenido a mi web".

- **Modo B – Evaluar código**:
  - Se muestra una consigna fija.
  - El alumno escribe el HTML.
  - El mismo validador revisa el resultado.