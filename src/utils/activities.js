import { html } from "@codemirror/lang-html";

//activities.js
export const activities = [

  // --- HTML 01 ------------------------------------------
  {
    id: "html-01",
    title: "Crear un H1 con 'Bienvenido a mi web'",
    tech: ["html"],

    mode: {
      studentWritesPrompt: true,
      aiGeneratesCode: true,
      studentEditsCode: false,
    },

    promptHint:
      "Pedí a la IA un documento HTML con un <h1> que diga exactamente 'Bienvenido a mi web'.",

    htmlTemplate: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Web</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- INSERT_HTML_HERE -->
</body>
</html>`,

    htmlTemplateAlum: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Web</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Agregá aquí el <h1> -->
</body>
</html>`,

    validator: {
      htmlMustContain: ["<h1>Bienvenido a mi web</h1>"],
      h1TextEquals: "Bienvenido a mi web",
      promptMustContain: ["h1", "bienvenido", "html"],
    },
    insertMarker: "<!-- INSERT_HTML_HERE -->",
  },

  // --- HTML 02 ------------------------------------------
  {
    id: "html-02",
    title: "Lista con exactamente 3 ítems",
    tech: ["html"],

    // MODO: solo código del alumno, sin IA ni prompt del alumno
    mode: {
      studentWritesPrompt: false,
      aiGeneratesCode: false,
      studentEditsCode: true,
    },

    // Prompt que el alumno LEE (no escribe)
    instruction:
      "Generá exactamente 3 ítems en formato <li> para un menú de navegación de página web (Inicio, Servicios, Contacto). No agregues texto fuera de los <li>.",

    // Lo que usa internamente el engine (podés dejarlo igual que el del alumno)
    htmlTemplate: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Web</title>
</head>
<body>
  <ul>
    <!-- Agregá aquí exactamente 3 ítems <li> -->
  </ul>
</body>
</html>`,

    // Lo que ve el alumno en el editor
    htmlTemplateAlum: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mi Web</title>
</head>
<body>
  <ul>
    <!-- Agregá aquí exactamente 3 ítems <li> -->
  </ul>
</body>
</html>`,

    validator: {
      minLi: 3,          // al menos 3 <li>
      maxLi: 3,          // como mucho 3 <li>
      liOnlyInUl: true,  // que no haya texto fuera de los <li> dentro del <ul>
      liExactItems: ["Inicio", "Servicios", "Contacto"]
    },
  },


  // --- CSS 01 ------------------------------------------
  {
    id: "css-01",
    title: "Cambiar color de fondo a lightblue",
    tech: ["html", "css"],

    mode: {
      studentWritesPrompt: true,   // el alumno escribe el prompt
      aiGeneratesCode: true,       // la IA genera el CSS
      studentEditsCode: false,
    },

    promptHint:
      "Pedí solo CSS para cambiar el color de fondo del body a lightblue. No incluyas etiquetas HTML.",

    // HTML que se usa para la vista previa (lo que se va a “pintar” con CSS)
    htmlTemplate: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Actividad CSS 01</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="box">¡Hola!</div>
  </body>
</html>`,
    htmlTemplateAlum: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Actividad CSS 01</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="box">¡Hola!</div>
  </body>
</html>`,

    // CSS base (arranca vacío, lo llena la IA)
    cssTemplate: `
/* Escribí tu CSS acá o dejá que la IA lo genere */
`,

    // Marca que esta actividad usa vista previa HTML+CSS
    preview: {
      useHtmlAndCss: true,
    },

    validator: {
      cssMustContain: ["background-color: lightblue"],
      promptMustContain: ["css", "fondo", "lightblue"],
    },
  },


  // --- CSS 02 ------------------------------------------
  {
    id: "css-02",
    title: "Aumentar tamaño del texto del párrafo",
    tech: ["html", "css"],

    mode: {
      studentWritesPrompt: false,
      aiGeneratesCode: false,
      studentEditsCode: true,
    },

    // Prompt que el alumno LEE (no escribe)
    instruction: `Escribí la regla CSS para aumentar el tamaño del texto del párrafo a 50px.

    Usá únicamente el selector p`,

    htmlTemplate: `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Actividad CSS 02</title>
        <link rel="stylesheet" href="styles.css" />
        </head>
        <body>
          <div>
            <p>Este es un párrafo de ejemplo.</p> 
          </div>
        </body>
    </html>`,

    htmlTemplateAlum: `<!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Actividad CSS 02</title>
        <link rel="stylesheet" href="styles.css" />
        </head>
        <body>
          <div>
            <p>Este es un párrafo de ejemplo.</p> 
          </div>
        </body>
    </html>`,

    cssTemplate: `/* Escribí acá tu CSS */`,

    // Marca que esta actividad usa vista previa HTML+CSS
    preview: {
      useHtmlAndCss: true,
    },

    validator: {
      cssMustContain: ["p", "font-size", "50px"],
    },
  },

  // --- JS 01 ------------------------------------------
  {
    id: "js-01",
    title: "Crear función saludo()",
    tech: ["js"],

    mode: {
      studentWritesPrompt: true,
      aiGeneratesCode: true,
      studentEditsCode: false,
    },

    promptHint:
      "Pedí una función JavaScript llamada saludo(nombre) que devuelva 'Hola ' + nombre.",

    htmlTemplate: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actividad JS 01</title>
        <style>
          /* No es necesario modificar el código CSS */
          @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Tilt+Neon&display=swap");

          body{
            background-image: url("https://assets.digitalhouse.com/content/ar/sch/trama-schools-clara.jpeg");
              background-size: 100%;
              background-color: white;
              background-position-y: 50px;
              margin: 0;
          }
          header{
              background: black;
              padding: 3px 25px;
              margin-bottom: 15px;
              align-items: center;
              text-align: center;
          }
          header, main{
              text-align: center;
          }

          h1{
              font-family: "Tilt Neon", sans-serif;
              color: white;
              font-size: 25px;
          }

          header p{
              font-size: 30px;
              color: rgb(255, 255, 255);
          }

          p{
              font-family: 'Roboto', sans-serif;
              font-size: 30px;
              margin: 15px

          }

          img{
              border: 3px solid #f2a71b;
              background-color: white;
              width: 30%;
          }

          button{
              padding: 20px 30px;
              border-radius: 2px 2px 20px 2px;
              font-size: 20px;
              font-family: sans-serif;
              background-color: rgb(255, 255, 255);
              text-transform: uppercase;
              font-weight: bold;
              color: #16525a;
              border: none;
          }

          button:hover {
              background-color: rgb(216, 216, 216);
          }
        </style>
      </head>
      <body>
        <header>
        <h1>Introducción a Funciones</h1>
    </header>
    <main>
        <img src="https://media3.giphy.com/media/tIeCLkB8geYtW/giphy.gif" alt="Excelente">
        <h2 id="saludo">---</h2>
    </main>
       
      </body>
      </html>
    `,
    htmlTemplateAlum: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actividad JS 01</title>
      </head>
      <body>
        
      </body>
      </html>
    `,
    jsTemplate: `// Escribí tu función acá`,


    // Marca que esta actividad usa vista previa HTML+CSS
    preview: {
      useHtmlAndCss: true,
    },

    validator: {
      jsMustContain: ["function saludo"],
      promptMustContain: ["saludo", "función", "javascript"],
    },
  },

  // --- JS 02 ------------------------------------------
  {
    id: "js-02",
    title: "Detectar clic y mostrar alerta",
    tech: ["html", "js"],

    mode: {
      studentWritesPrompt: false,
      aiGeneratesCode: false,
      studentEditsCode: true,
    },

    instruction:
      "Generá el código JavaScript necesario para que, al hacer clic en un botón con id miBoton, se muestre una alerta con el mensaje '¡Botón clickeado!'.",

    htmlTemplate: `
      <!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Botón Estilizado</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #74ebd5, #ACB6E5);
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
    }

    #miBoton {
      padding: 15px 30px;
      font-size: 18px;
      border: none;
      border-radius: 10px;
      background: #ffffff;
      color: #333;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #miBoton:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.25);
    }

    #miBoton:active {
      transform: translateY(0);
      box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>

  <button id="miBoton">Clic aquí</button>

</body>
</html>
    `,
    htmlTemplateAlum: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Botón</title>
</head>
<body>

  <button id="miBoton">Clic aquí</button>

  <script src="script.js"></script>
</body>
</html>
`,

    jsTemplate: `// Hacé que este botón muestre una alerta al hacer clic`,

    // Marca que esta actividad usa vista previa HTML+CSS
    preview: {
      useHtmlAndCss: true,
    },

    validator: {
      jsMustContainEvent: true,
    },
  },

];
