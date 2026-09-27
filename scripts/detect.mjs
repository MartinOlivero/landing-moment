#!/usr/bin/env node
// Detector de clichés de landing. Sin dependencias: sólo node.
//   node detect.mjs <archivo|carpeta> [...]
// Marca los tells de una página hecha con IA. NO es un linter de correctitud:
// cada hallazgo puede ser intencional. Decidí, no obedezcas.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// .js/.ts/.mjs también: un motor vanilla que inyecta su propio CSS desde un string
// (como el de scroll-world) quedaba invisible y el detector decía "sin señales".
const EXT = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.ts', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const SALTAR = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'vendor']);
// Los scripts del propio plugin nombran todo lo que buscan: escanearlos da falsos positivos.
const PROPIOS = path.dirname(fileURLToPath(import.meta.url));

// Cada regla: qué buscar y por qué molesta. `umbral` = cuántas veces hace falta para reportar.
const REGLAS = [
  { id: 'gradient-text', umbral: 1,
    re: /(background-clip|-webkit-background-clip)\s*:\s*text|\bbg-clip-text\b/gi,
    dice: 'Texto con gradiente. La jerarquía sale del peso y del tamaño.' },

  { id: 'fuente-generica', umbral: 1,
    re: /\b(Inter|Roboto|Geist|Plus Jakarta Sans|Fraunces|Space Grotesk|Poppins|Montserrat)\b/g,
    salvoLinea: /system-ui|-apple-system/,   // el stack nativo nombra Roboto: no es una eleccion
    dice: 'Fuente que aparece en casi toda página generada con IA. Elegí una con carácter.' },

  { id: 'kicker', umbral: 1,
    // En el HTML (class="eyebrow") o en el selector CSS, incluido BEM (.hero__eyebrow):
    // \b no sirve después de "__" porque el guion bajo cuenta como letra.
    re: /(?:class=["'][^"']*|\.)[\w-]*?(?<![a-z])(kicker|eyebrow|overline|pre-?title)\b/gi,
    dice: 'Kicker/eyebrow arriba del título. El título se sostiene solo.' },

  { id: 'glow-plano', umbral: 3,
    re: /box-shadow\s*:\s*(?:0\s+){2,3}[\d.]+(?:px|rem)\s+(?:[\d.]+(?:px|rem)\s+)?(?:rgba?\(|#|var\()/gi,
    dice: 'Halo de color sin offset. Un glow se gana cuando el objeto ES luz; en una card es disfraz.' },

  { id: 'sombra-hard', umbral: 1,
    re: /box-shadow\s*:\s*-?[\d.]+(?:px|rem)\s+-?[\d.]+(?:px|rem)\s+0(?:px)?\s+(?:rgba?\(|#)/gi,
    dice: 'Sombra dura sin blur. Sólo pertenece a un mundo neobrutalista elegido a propósito.' },

  { id: 'border-color-grueso', umbral: 2,
    re: /border-(left|right)\s*:\s*(?:[2-9]|\d\d)(?:px|rem)?\s+solid/gi,
    dice: 'border-left de color >1px. Es el acento por defecto de toda plantilla.' },

  { id: 'numeros-seccion', umbral: 3,
    re: />\s*0[1-9]\s*</g,
    dice: 'Numeritos de sección 01/02/03. Sólo si la secuencia le aporta algo al lector.' },

  { id: 'emoji-icono', umbral: 4,
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu,
    dice: 'Emojis haciendo de sistema de íconos. Los íconos se dibujan.' },

  { id: 'em-dash', umbral: 12,
    re: /—/g,
    dice: 'Muchos em-dashes: suele ser cadencia de IA. Ojo en español, donde la raya de inciso es puntuacion legitima.' },

  { id: 'random-en-carga', umbral: 1,
    re: /Math\.random\s*\(/g,
    dice: 'Math.random() se lee como ruido de fondo. Con semilla fija se lee como evidencia.' },

  { id: 'sin-reduced-motion', umbral: 0,   // 0 = regla invertida: falta algo
    re: /prefers-reduced-motion/g,
    requiere: /@keyframes|\.animate\s*\(|transition\s*:|requestAnimationFrame/,
    dice: 'Hay animación y ningún prefers-reduced-motion. Mostrá el estado final, no una versión mocha.' },

  { id: 'google-fonts-con-csp', umbral: 0,
    re: /fonts\.googleapis\.com/g,
    dice: 'Google Fonts por @import/link: si el proyecto tiene CSP con font-src self, se bloquea en silencio.' },
];

function archivos(objetivo) {
  const st = fs.statSync(objetivo);
  if (path.resolve(st.isFile() ? path.dirname(objetivo) : objetivo) === PROPIOS) return [];
  if (st.isFile()) return [objetivo];
  return fs.readdirSync(objetivo, { withFileTypes: true }).flatMap(d => {
    if (SALTAR.has(d.name) || d.name.startsWith('.')) return [];
    const p = path.join(objetivo, d.name);
    return d.isDirectory() ? archivos(p) : (EXT.has(path.extname(d.name)) ? [p] : []);
  });
}

function linea(texto, indice) {
  return texto.slice(0, indice).split('\n').length;
}

function analizar(texto) {
  const hallazgos = [];
  const lineas = texto.split('\n');
  for (const r of REGLAS) {
    let hits = [...texto.matchAll(r.re)];
    if (r.salvoLinea) hits = hits.filter(h => !r.salvoLinea.test(lineas[linea(texto, h.index) - 1]));

    if (r.umbral === 0) {
      // regla invertida: reportar cuando NO aparece (y, si hay `requiere`, solo si aplica)
      const aplica = r.requiere ? r.requiere.test(texto) : true;
      if (r.id === 'google-fonts-con-csp') {
        if (hits.length) hallazgos.push({ id: r.id, n: hits.length, ln: linea(texto, hits[0].index), dice: r.dice });
      } else if (aplica && !hits.length) {
        hallazgos.push({ id: r.id, n: 0, ln: 1, dice: r.dice });
      }
      continue;
    }

    if (hits.length >= r.umbral) {
      const enLineas = new Set(hits.map(h => linea(texto, h.index)));
      hallazgos.push({ id: r.id, n: enLineas.size, ln: Math.min(...enLineas), dice: r.dice });
    }
  }
  return hallazgos;
}

// ── autotest ─────────────────────────────────────────────────────────────────
// `node detect.mjs --autotest` — chequea que cada regla dispare con su caso y
// calle con el caso limpio. Sin frameworks: si algo falla, sale con codigo 1.
function autotest() {
  const casos = [
    ['gradient-text',   '.t { background-clip: text; color: transparent; }', true],
    ['gradient-text',   '.t { color: #fff; }', false],
    ['fuente-generica', 'body { font-family: Inter, sans-serif; }', true],
    ['fuente-generica', 'body { font-family: Archivo, sans-serif; }', false],
    ['fuente-generica', 'body { font-family: system-ui, -apple-system, Roboto, Arial, sans-serif; }', false],
    ['kicker',          '<p class="kicker">NOVEDAD</p>', true],
    ['kicker',          '.sw-copy__eyebrow{text-transform:uppercase}', true],
    ['kicker',          '.hero__title{font-weight:700}', false],
    ['kicker',          "sections: [{ eyebrow: 'From leaf to last sip' }]", false],
    ['sombra-hard',     '.c { box-shadow: 4px 4px 0 #000; }', true],
    ['sombra-hard',     '.c { box-shadow: 0 8px 24px rgba(0,0,0,.12); }', false],
    ['glow-plano',      '.a{box-shadow:0 0 20px rgba(0,0,0,.5)}.b{box-shadow:0 0 20px #fff}.c{box-shadow:0 0 8px var(--x)}', true],
    ['emoji-icono',     '<i>🚀</i><i>📊</i><i>🔥</i><i>✨</i>', true],
    ['random-en-carga', 'const x = Math.random();', true],
    // regla invertida: hay animacion y falta prefers-reduced-motion
    ['sin-reduced-motion', '@keyframes entrar { from { opacity: 0 } }', true],
    ['sin-reduced-motion', '@keyframes entrar { from { opacity: 0 } } @media (prefers-reduced-motion: reduce) { * { animation: none } }', false],
    // sin animacion, la regla no aplica: no debe reportar
    ['sin-reduced-motion', '.c { color: red; }', false],
  ];

  let fallos = 0;
  for (const [id, fuente, esperado] of casos) {
    const obtenido = analizar(fuente).some(h => h.id === id);
    if (obtenido !== esperado) {
      fallos++;
      console.error(`FALLO  ${id}: esperaba ${esperado ? 'disparar' : 'callar'} con  ${fuente.slice(0, 60)}`);
    }
  }
  console.log(fallos ? `\n${fallos}/${casos.length} fallaron.` : `${casos.length} casos OK.`);
  process.exit(fallos ? 1 : 0);
}

const objetivos = process.argv.slice(2);
if (objetivos[0] === '--autotest') autotest();
if (!objetivos.length) {
  console.error('uso: node detect.mjs <archivo|carpeta> [...]');
  console.error('     node detect.mjs --autotest');
  process.exit(2);
}

let total = 0;
for (const objetivo of objetivos.flatMap(archivos)) {
  const hallazgos = analizar(fs.readFileSync(objetivo, 'utf8'));
  if (hallazgos.length) {
    console.log(`\n${objetivo}`);
    for (const h of hallazgos) {
      const veces = h.n > 1 ? ` (${h.n}\u00d7)` : '';
      console.log(`  L${h.ln}  ${h.id}${veces}\n        ${h.dice}`);
    }
    total += hallazgos.length;
  }
}

console.log(total
  ? `\n${total} se\u00f1al(es). Ninguna es un error: si una es intencional y la justifica el mundo visual de la p\u00e1gina, dejala y decilo.`
  : '\nSin se\u00f1ales de plantilla.');
