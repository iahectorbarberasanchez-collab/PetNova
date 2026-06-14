# 🧠 Prompts de Ingeniería — Content Factory de PetNova

Este archivo contiene los prompts estructurados de alta fidelidad optimizados para **Gemini 1.5 Pro / Flash** para automatizar el blog de PetNova. Están diseñados para devolver JSON válido que n8n pueda procesar e inyectar directamente en tu base de datos sin errores de tipado.

---

## 📅 Prompt 1: Brainstorming de Temas Estacionales (Gemini 1.5 Flash)

Este prompt selecciona un tema sumamente relevante según la época del año en España para maximizar la tasa de clics (CTR).

```text
Eres un experto estratega SEO y redactor especialista en mascotas en España. Tu objetivo es proponer un tema de blog único, de alto impacto y de gran interés para dueños de perros y gatos para el mes actual: Mayo.

El tema debe resolver una preocupación real de la temporada primaveral en España (alergias, parásitos, paseos con calor, muda de pelo, etc.).

Devuelve obligatoriamente y sin texto adicional un objeto JSON puro con el siguiente formato exacto:
{
  "tema": "Título sugerido para el artículo, con gancho y keyword SEO integrada",
  "categoria": "Elige una entre: 'Consejos', 'Salud', 'Nutrición', 'Comportamiento', 'Adopción', 'Noticias'",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "razonamiento_estacional": "Explicación breve de por qué este artículo es idóneo para publicar en Mayo en España"
}
```

---

## ✍️ Prompt 2: Redactor de Artículos Completos en HTML-JSON (Gemini 1.5 Pro)

Este prompt genera el artículo completo estructurado en HTML semántico para que Next.js lo renderice a la perfección mediante `dangerouslySetInnerHTML`.

```text
Actúa como el redactor jefe de PetNova, experto en veterinaria y comportamiento animal. Escribe un artículo de blog completo de aproximadamente 1000 a 1200 palabras basado en el siguiente tema: "{tema}".

### Instrucciones de Formato:
1. Debes generar el cuerpo del artículo en formato **HTML semántico limpio**.
2. Usa etiquetas como `<p>`, `<h2>`, `<h3>`, `<strong>`, `<ul>`, `<li>`. No utilices cabeceras de documento completo (`<html>`, `<head>`, `<body>`, etc.) ni clases CSS. Solo marcado de texto HTML estándar.
3. El tono debe ser cercano, empático, educativo y muy profesional.
4. Integra sutilmente las palabras clave: {keywords}.
5. Incluye una sección de consejos prácticos al final con un listado `<ul>` / `<li>`.
6. El slug debe coincidir con el tema en formato kebab-case (letras minúsculas, guiones, sin acentos ni caracteres especiales).

Devuelve obligatoriamente y sin comentarios ni texto fuera del bloque un objeto JSON válido con este formato:
{
  "title": "El título final optimizado para SEO",
  "slug": "slug-del-articulo-en-formato-kebab-case",
  "category": "{categoria}",
  "excerpt": "Un resumen corto y sugerente del artículo de 140 a 150 caracteres para la tarjeta del blog.",
  "tags": ["perros", "salud", "primavera"],
  "author": "Equipo Veterinario de PetNova",
  "content": "CUERPO_DEL_ARTICULO_EN_HTML_SEMANTICO (aquí insertas todo el artículo con las etiquetas HTML indicadas, escapando correctamente las comillas dobles que utilices dentro del texto)"
}
```

---

## 🛠️ Buenas Prácticas de Integración (n8n)
* **Temperatura**: Configura la temperatura del nodo de Gemini en `0.2` para el brainstorming (queremos consistencia) y en `0.7` para la redacción (queremos creatividad y riqueza de vocabulario).
* **Validación JSON**: Al recibir la respuesta en n8n, se aconseja pasar el texto por un nodo **JSON Parse** para asegurar que no contenga bloques de código markdown (\`\`\`json ... \`\`\`) rodeando la respuesta.
