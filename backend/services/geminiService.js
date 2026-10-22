/**
 * Sugerencias farmacéuticas vía Google Gemini API.
 * Requiere GEMINI_API_KEY en backend/.env
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 15000;

async function fetchGemini(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Gemini no respondió en ${GEMINI_TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonArray(text) {
  let raw = (text || '').trim();
  raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  const jsonBlock = raw.match(/\[[\s\S]*\]/);
  let toParse = jsonBlock ? jsonBlock[0] : raw;
  
  try {
    const parsed = JSON.parse(toParse);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    // Si esta truncado, intentamos forzar el cierre
    try {
      if (toParse.lastIndexOf('}') < toParse.lastIndexOf('"')) {
        toParse += '"}';
      }
      if (toParse.lastIndexOf(']') < toParse.lastIndexOf('}')) {
        toParse += ']';
      }
      const repa = JSON.parse(toParse);
      return Array.isArray(repa) ? repa : [];
    } catch(e) {
      console.error('[Gemini JSON Parse Error]:', err.message, 'Raw:', raw.substring(0, 200));
      return []; // Devolver vacio para no colapsar la app
    }
  }
}

async function generarSugerenciasFarmaceuticas(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en backend/.env');
  }

  const q = String(query || '').trim();
  if (q.length < 2) return [];

  const prompt = `Eres un farmacéutico experto y logístico. El usuario busca medicamentos con el texto: "${q}".

Devuelve ÚNICAMENTE un arreglo JSON válido (máximo 6 objetos) con sugerencias de medicamentos (principio activo, concentración y forma si aplica) y datos logísticos para registro en sistema.
Cada objeto debe tener exactamente estas claves:
- "nombre" (string, nombre completo estandarizado en español)
- "categoria" (string, categoría terapéutica)
- "laboratorio" (string, laboratorio fabricante más común o 'Genérico')
- "stock_minimo" (number, un valor prudente recomendado entre 10 y 100 según el tipo de medicamento)
- "fuente" (string, siempre "Gemini IA")

No uses markdown. No agregues texto fuera del JSON. Ejemplo de formato:
[{"nombre":"Paracetamol 500 mg Tableta","categoria":"Analgésicos","laboratorio":"Genérico","stock_minimo":50,"fuente":"Gemini IA"}]`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetchGemini(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    let msg = body?.error?.message || `Gemini HTTP ${response.status}`;
    if (msg.includes('not found') || msg.includes('supported')) {
      try {
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
        const listData = await listResp.json();
        const available = listData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name.replace('models/', '')).join(', ');
        msg += ` (Modelos que soporta tu API Key: ${available})`;
      } catch (e) {}
    }
    throw new Error(msg);
  }

  const text =
    body?.candidates?.[0]?.content?.parts?.[0]?.text ||
    body?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ||
    '';

  if (!text) throw new Error('Gemini no devolvió contenido');

  const items = parseJsonArray(text)
    .filter(x => x && typeof x.nombre === 'string')
    .map(x => ({
      nombre: x.nombre.trim(),
      categoria: (x.categoria || 'General').trim(),
      laboratorio: (x.laboratorio || 'Laboratorio Genérico').trim(),
      stock_minimo: Number(x.stock_minimo) || 20,
      fuente: 'Gemini IA',
    }))
    .slice(0, 6);

  return items;
}

async function generarVariantesFarmaceuticas(nombreBase) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY no está configurada en backend/.env');
  }

  const base = String(nombreBase || '').trim();
  if (base.length < 1) return [];

  const prompt = `Eres un farmacéutico experto. El usuario busca el medicamento: "${base}".

Devuelve ÚNICAMENTE un arreglo JSON con **EXACTAMENTE 6 opciones DISTINTAS** de ese medicamento, obligatoriamente combinando diferentes presentaciones (Tabletas, Cápsulas, Jarabe, Inyectable, Gotas, etc) y diferentes marcas/laboratorios (Pfizer, Bayer, Genfar, MK, La Sante, Genérico, etc).

REGLA DE ORO: Todas las opciones DEBEN comenzar con el texto exacto que buscó el usuario ("${base}"). No pongas la marca comercial al principio. 
Usa estrictamente este formato: "[Principio Activo] [Dosis] [Presentación] ([Marca Comercial] - [Laboratorio])".
Por ejemplo, si buscan "ibuprofeno", tus opciones deben ser así:
- "Ibuprofeno 400mg Cápsula Blanda (Advil - Pfizer)"
- "Ibuprofeno 100mg/5mL Suspensión Infantil (Motrin - J&J)"
- "Ibuprofeno 800mg Tableta (Genfar)"
- "Ibuprofeno 600mg Cápsula (Actron - Bayer)"

Cada objeto:
- "nombre" (string, el nombre formateado como se indicó en la regla de oro)
- "categoria" (string, la familia farmacológica)
- "laboratorio" (string, SOLAMENTE el nombre comercial o laboratorio, ej: "Advil", "Pfizer", "Genfar")
- "presentacion" (string, solo la forma y dosis, ej: "400mg Cápsula")
- "fuente" (string, siempre pon "Gemini IA")

Solo JSON, sin markdown.`;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetchGemini(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        maxOutputTokens: 1536,
        responseMimeType: 'application/json',
      },
    }),
  });

  const body = await response.json();
  if (!response.ok) {
    let msg = body?.error?.message || `Gemini HTTP ${response.status}`;
    if (msg.includes('not found') || msg.includes('supported')) {
      try {
        const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
        const listData = await listResp.json();
        const available = listData.models.filter(m => m.supportedGenerationMethods?.includes('generateContent')).map(m => m.name.replace('models/', '')).join(', ');
        msg += ` (Modelos que soporta tu API Key: ${available})`;
      } catch (e) {}
    }
    throw new Error(msg);
  }

  const text =
    body?.candidates?.[0]?.content?.parts?.[0]?.text ||
    body?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ||
    '';

  if (!text) throw new Error('Gemini no devolvió variantes');

  return parseJsonArray(text)
    .filter(x => x && typeof x.nombre === 'string')
    .map(x => ({
      nombre: x.nombre.trim(),
      categoria: (x.categoria || 'General').trim(),
      laboratorio: (x.laboratorio || '').trim(),
      presentacion: (x.presentacion || x.nombre).trim(),
      fuente: 'Gemini IA',
    }))
    .slice(0, 6);
}

module.exports = { generarSugerenciasFarmaceuticas, generarVariantesFarmaceuticas };
