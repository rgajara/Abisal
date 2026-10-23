# 🌊 Abisal · Trivia de rareza (PWA offline · ES/EN)

Da una respuesta **correcta pero lo más rara posible** para descender al abismo.
3 inmersiones de 25 s. Pregunta del día (cambia a medianoche, hora local) + modo **Aleatoria 🎲** ilimitado.
Botón **ES | EN** para cambiar el idioma. Funciona 100 % offline una vez cargada.

## 📁 Archivos
```
.nojekyll  README.md  index.html  styles.css  generator.js  app.js
questions.json  service-worker.js  manifest.json  icons/icon.svg
```

## 🧠 De dónde salen las preguntas
1. **generator.js**: cientos de preguntas automáticas combinando bancos de datos
   (animales, países, capitales, frutas, colores, deportes, elementos…) con plantillas
   ("que empiece por…", "de exactamente N letras", "un país de África"…). Sin internet.
2. **questions.json**: preguntas escritas a mano. Formato:
   ```json
   { "id": "mi-pregunta",
     "category": { "es": "Tema", "en": "Topic" },
     "prompt":   { "es": "Nombra un…", "en": "Name a…" },
     "answers":  ["Común=Common", "Rara/Sinónimo=Rare/Synonym"] }
   ```
   Respuestas **ordenadas de la más común a la más rara**: los metros se calculan solos.

## 🚀 Subir a GitHub
Desde el navegador:
1. Crea un repositorio público en https://github.com/new (ej. `abisal`).
2. Por cada archivo: **Add file → Create new file**, escribe el nombre exacto
   (para el icono: `icons/icon.svg`), pega el contenido y pulsa **Commit changes**.
3. `.nojekyll` se crea igual, pero con el contenido vacío.

Con Git:
```bash
cd abisal
git init && git add . && git commit -m "Abisal PWA"
git branch -M main
git remote add origin https://github.com/USUARIO/abisal.git
git push -u origin main
```

## 🌐 Activar GitHub Pages
**Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `(root)` → Save.**
En 1–2 minutos: `https://USUARIO.github.io/abisal/`

## 📱 Instalar en iPhone
Safari → **Compartir → Añadir a pantalla de inicio**. Ábrela una vez con conexión.

## 🔄 Actualizar el código
Si cambias HTML/CSS/JS, sube `CACHE_VERSION` en `service-worker.js` (ej. `abisal-v2.0.1`).
No hace falta para `questions.json`: siempre se pide primero a la red.

## 🧪 Probar en local
```bash
python3 -m http.server 8080   # → http://localhost:8080
```
