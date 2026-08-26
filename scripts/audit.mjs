#!/usr/bin/env node
// audit.mjs — el piso mecánico, verificado sobre la página RENDERIZADA.
//
// El detector (detect.mjs) lee el código fuente y marca clichés. Éste abre la página
// en un Chrome de verdad y mide lo que el código no dice: contraste real, medida de
// línea, desborde en mobile, si degrada sin JS y con reduced-motion, y si la
// tipografía que elegiste llegó a cargar.
//
// Cero dependencias: usa el Chrome que ya está instalado y le habla por CDP con el
// WebSocket nativo de Node (18+). No instala nada.
//
//   node audit.mjs pagina.html
//   node audit.mjs http://localhost:5173
//   node audit.mjs --autotest

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, extname, basename } from 'node:path';

// ── Dónde vive Chrome en cada sistema ────────────────────────────────────────
const CANDIDATOS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/usr/bin/microsoft-edge',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

const buscarChrome = () => CANDIDATOS.find(p => existsSync(p));

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm' };

// Servimos por HTTP en vez de file:// : con file:// fallan los módulos ES, el fetch
// y las fuentes locales, y aparecerían errores que en producción no existen.
function servir(raiz) {
  return new Promise(ok => {
    const s = createServer(async (req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const archivo = resolve(raiz, '.' + rel);
      if (!archivo.startsWith(raiz)) { res.writeHead(403).end(); return; }
      try {
        const cuerpo = await readFile(archivo);
        res.writeHead(200, { 'content-type': TIPOS[extname(archivo).toLowerCase()] || 'application/octet-stream' });
        res.end(cuerpo);
      } catch { res.writeHead(404).end('no está'); }
    });
    s.listen(0, '127.0.0.1', () => ok({ puerto: s.address().port, cerrar: () => s.close() }));
  });
}

// ── CDP mínimo: lo justo para navegar, emular y evaluar ──────────────────────
class Sesion {
  constructor(ws) { this.ws = ws; this.n = 0; this.pendientes = new Map(); this.eventos = new Map();
    ws.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pendientes.has(m.id)) {
        const { ok, mal } = this.pendientes.get(m.id); this.pendientes.delete(m.id);
        m.error ? mal(new Error(m.error.message)) : ok(m.result);
      } else if (m.method) (this.eventos.get(m.method) || []).forEach(f => f(m.params));
    });
  }
  enviar(method, params = {}) {
    const id = ++this.n;
    return new Promise((ok, mal) => { this.pendientes.set(id, { ok, mal }); this.ws.send(JSON.stringify({ id, method, params })); });
  }
  al(method, f) { this.eventos.set(method, [...(this.eventos.get(method) || []), f]); }
  esperar(method, ms = 15000) {
    return new Promise(ok => { const t = setTimeout(() => ok(null), ms); this.al(method, p => { clearTimeout(t); ok(p); }); });
  }
  async evaluar(fn) {
    const r = await this.enviar('Runtime.evaluate', {
      expression: `(${fn.toString()})()`, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  }
}

async function abrirChrome() {
  const bin = buscarChrome();
  if (!bin) throw new Error(
    'No encontré Chrome/Chromium/Edge. Instalá uno, o pasá la ruta:\n' +
    '  CHROME_PATH="/ruta/al/navegador" node audit.mjs pagina.html');
  const perfil = await mkdtemp(join(tmpdir(), 'lm-audit-'));
  const proc = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-gpu', '--hide-scrollbars',
    '--force-color-profile=srgb', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

  const url = await new Promise((ok, mal) => {
    let buf = '';
    const t = setTimeout(() => mal(new Error('Chrome no respondió en 20s')), 20000);
    proc.stderr.on('data', d => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); ok(m[0]); }
    });
    proc.on('exit', c => { clearTimeout(t); mal(new Error('Chrome se cerró (código ' + c + ')')); });
  });

  const ws = new WebSocket(url);
  await new Promise((ok, mal) => { ws.addEventListener('open', ok); ws.addEventListener('error', () => mal(new Error('no pude conectar a Chrome'))); });
  const nav = new Sesion(ws);
  const { targetId } = await nav.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await nav.enviar('Target.attachToTarget', { targetId, flatten: true });

  // Un wrapper que ruta los mensajes de la pestaña por su sessionId.
  const pagina = new Sesion({
    addEventListener: (_, f) => ws.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.sessionId === sessionId) f({ data: JSON.stringify(m.params ? m : m) });
    }),
    send: txt => ws.send(JSON.stringify({ ...JSON.parse(txt), sessionId })),
  });
  await pagina.enviar('Page.enable');
  await pagina.enviar('Runtime.enable');
  await pagina.enviar('Log.enable');

  // El perfil vive en /tmp: si Chrome todavía está escribiendo cuando lo borramos, el
  // error no importa — lo limpia el sistema. Nunca debe tumbar la auditoría.
  return { pagina, cerrar: async () => {
    try { proc.kill(); } catch {}
    await new Promise(ok => { proc.once('exit', ok); setTimeout(ok, 1500); });
    await rm(perfil, { recursive: true, force: true }).catch(() => {});
  } };
}

// ── Lo que se mide adentro de la página ──────────────────────────────────────
// Se serializa y corre en el navegador, así que no puede usar nada de este archivo.
function medir() {
  const lum = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    if (n.length < 3) return null;
    const [r, g, b] = n.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
    return .2126 * r + .7152 * g + .0722 * b;
  };
  const rgba = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    return n.length >= 3 ? { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 } : null;
  };
  // Compone frente sobre fondo como lo hace el navegador. Sin esto, un panel con
  // background rgba(147,51,234,.08) se leería como violeta pleno y el contraste daría
  // 1.08:1 cuando en pantalla es perfectamente legible. Es el falso positivo clásico.
  const sobre = (frente, fondo) => ({
    r: frente.r * frente.a + fondo.r * (1 - frente.a),
    g: frente.g * frente.a + fondo.g * (1 - frente.a),
    b: frente.b * frente.a + fondo.b * (1 - frente.a), a: 1,
  });
  const texto = c => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

  // Junta TODAS las capas semitransparentes hasta la primera opaca y las compone.
  // { pintado: true } si en el camino hay un gradiente o una imagen: ahí el contraste
  // no se deduce de los colores computados. Reportarlo como falla sería mentir.
  const fondoDe = el => {
    const capas = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') return { pintado: true };
      const c = rgba(s.backgroundColor);
      if (!c || c.a === 0) continue;
      capas.push(c);
      if (c.a === 1) break;
    }
    if (!capas.length || capas[capas.length - 1].a !== 1) capas.push({ r: 255, g: 255, b: 255, a: 1 });
    let acumulado = capas.pop();
    while (capas.length) acumulado = sobre(capas.pop(), acumulado);
    return { color: texto(acumulado) };
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)];
    if (x == null || y == null) return null;
    const [alto, bajo] = x > y ? [x, y] : [y, x];
    return (alto + .05) / (bajo + .05);
  };
  // Visibilidad EFECTIVA: la opacidad de los padres no se hereda como valor computado,
  // así que un h3 adentro de una sección en opacity:0 se computa opacity:1. Hay que subir.
  const visible = el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false;
    }
    return true;
  };
  const donde = el => {
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
    return `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}${t ? ` "${t}"` : ''}`;
  };

  const conTexto = [...document.querySelectorAll('body *')].filter(el =>
    [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2) && visible(el));

  // 1. Contraste
  const contraste = [], noMedible = [];
  for (const el of conTexto) {
    const s = getComputedStyle(el);
    // Texto pintado con un gradiente (background-clip:text): no tiene color propio.
    // De eso ya se ocupa el detector estático, que lo marca como cliché.
    if (s.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || /text/.test(s.backgroundClip || '')) continue;
    const px = parseFloat(s.fontSize), grande = px >= 24 || (px >= 18.66 && +s.fontWeight >= 700);
    const fondo = fondoDe(el);
    if (fondo.pintado) { noMedible.push(donde(el)); continue; }
    const cTexto = rgba(s.color);
    if (!cTexto) continue;
    const colorReal = cTexto.a < 1 ? texto(sobre(cTexto, rgba(fondo.color))) : s.color;
    const r = ratio(colorReal, fondo.color);
    if (r == null) continue;
    const minimo = grande ? 3 : 4.5;
    if (r < minimo) contraste.push({ el: donde(el), ratio: +r.toFixed(2), minimo, px: +px.toFixed(0),
                                     clase: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') });
  }

  // 2. Medida de línea (caracteres por renglón, medidos de verdad)
  const medida = [];
  for (const el of conTexto) {
    const txt = (el.textContent || '').trim();
    if (txt.length < 120) continue;
    const s = getComputedStyle(el);
    const rects = el.getClientRects();
    if (!rects.length) continue;
    // ancho de un carácter ≈ ancho del "0" en esa tipografía
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    const ch = cv.measureText('0').width || parseFloat(s.fontSize) * .5;
    const ancho = el.getBoundingClientRect().width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    const cpl = Math.round(ancho / ch);
    if (cpl > 90) medida.push({ el: donde(el), cpl });
  }

  // 3. Escala tipográfica: tamaños casi iguales = indecisión
  const tamaños = [...new Set([...document.querySelectorAll('body *')].filter(visible)
    .map(el => Math.round(parseFloat(getComputedStyle(el).fontSize) * 10) / 10))].sort((a, b) => a - b);
  // Si la página usa tipografía fluida (clamp/vw), los tamaños caen en decimales a
  // propósito y medirlos como "escala" no dice nada. Se salta el chequeo y se avisa.
  let fluida = false;
  for (const hoja of [...document.styleSheets]) {
    let reglas; try { reglas = [...hoja.cssRules]; } catch { continue; }
    if (reglas.some(r => /font-size[^;]*(clamp\(|vw|vmin)/i.test(r.cssText || ''))) { fluida = true; break; }
  }
  const pegados = [];
  if (!fluida) for (let i = 1; i < tamaños.length; i++) {
    const d = tamaños[i] - tamaños[i - 1];
    if (d > 0 && d < 1.5 && tamaños[i] < 40) pegados.push(`${tamaños[i - 1]}px / ${tamaños[i]}px`);
  }

  // 4. Foco de teclado
  const focoRoto = [];
  for (const hoja of [...document.styleSheets]) {
    let reglas; try { reglas = [...hoja.cssRules]; } catch { continue; }
    for (const r of reglas) {
      const t = r.cssText || '';
      if (/outline\s*:\s*(none|0)/.test(t) && !/box-shadow|outline-offset|border-color/.test(t))
        focoRoto.push(t.slice(0, 90));
    }
  }

  // 5. ¿La tipografía que pediste llegó a cargar?
  const declaradas = new Set();
  for (const el of [document.body, ...document.querySelectorAll('h1,h2,h3,p,a,button')].filter(Boolean))
    getComputedStyle(el).fontFamily.split(',').forEach(f => {
      const n = f.trim().replace(/^["']|["']$/g, '');
      if (n && !/^(ui-|system-ui|-apple-system|sans-serif|serif|monospace|cursive|fantasy|inherit|initial|BlinkMacSystemFont|Segoe UI|Helvetica|Arial|Menlo|Consolas|SFMono-Regular|SF Mono|Roboto Mono|Courier)/i.test(n))
        declaradas.add(n);
    });
  const cargadas = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/^["']|["']$/g, '')));
  const faltantes = [...declaradas].filter(f => !cargadas.has(f));

  // 6. Genéricas (la lista que la propia skill desaconseja)
  const genericas = [...declaradas].filter(f =>
    /^(Inter|Roboto|Geist|Plus Jakarta Sans|Fraunces|Space Grotesk|Poppins|Montserrat|Open Sans|Lato)$/i.test(f));

  const hero = document.querySelector('h1');
  return {
    contraste, noMedible: [...new Set(noMedible)].slice(0, 8), medida, pegados, focoRoto: focoRoto.slice(0, 5),
    faltantes, genericas,
    tamaños: tamaños.length, fluida,
    scrollWidth: document.documentElement.scrollWidth,
    heroVisible: hero ? visible(hero) : null,
    heroTexto: hero ? (hero.textContent || '').trim().slice(0, 90) : null,
    animando: [...document.querySelectorAll('body *')].filter(el => {
      const s = getComputedStyle(el);
      return s.animationName !== 'none' && s.animationIterationCount === 'infinite' && visible(el);
    }).slice(0, 5).map(donde),
    ocultosGrandes: [...document.querySelectorAll('body *')].filter(el => {
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return +s.opacity < .05 && r.width * r.height > 40000 && (el.textContent || '').trim().length > 20;
    }).slice(0, 5).map(donde),
  };
}

// ── Correr los cinco pasos sobre la misma página ─────────────────────────────
async function auditar(url) {
  const { pagina, cerrar } = await abrirChrome();
  const errores = [];
  // Un favicon ausente aparece como error de red en toda página local: es ruido,
  // no un defecto de la página.
  const ruido = t => /favicon\.(ico|png|svg)/i.test(t);
  pagina.al('Log.entryAdded', p => {
    if (p.entry.level === 'error' && !ruido(p.entry.url || '') && !ruido(p.entry.text || ''))
      errores.push(p.entry.text.slice(0, 160));
  });
  pagina.al('Runtime.exceptionThrown', p => errores.push((p.exceptionDetails.text || 'excepción') + ' ' + (p.exceptionDetails.exception?.description || '').slice(0, 120)));

  // Cargar y RECORRER: casi toda landing revela secciones con IntersectionObserver.
  // Medir sin scrollear sería medir una página que nadie ve así, y todo lo de abajo
  // del fold aparecería como invisible o sin contraste. Bajamos, volvemos y medimos.
  const cargar = async () => {
    const listo = pagina.esperar('Page.loadEventFired');
    await pagina.enviar('Page.navigate', { url }); await listo;
    await new Promise(r => setTimeout(r, 700));      // el momento del hero corre una vez
    // El scroll se maneja desde acá y no con una promesa adentro de la página: una
    // promesa larga en Runtime.evaluate se la lleva el recolector ("Promise was collected").
    const alto = await pagina.evaluar(() => document.documentElement.scrollHeight);
    const paso = await pagina.evaluar(() => Math.round(innerHeight * .8));
    for (let y = 0; y < alto; y += paso) {
      await pagina.enviar('Runtime.evaluate', { expression: `scrollTo(0, ${y})` });
      await new Promise(r => setTimeout(r, 110));
    }
    await pagina.enviar('Runtime.evaluate', { expression: 'scrollTo(0, 0)' });
    await new Promise(r => setTimeout(r, 400));
  };

  // Desktop
  await pagina.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cargar();
  const desktop = await pagina.evaluar(medir);

  // Mobile 390 (iPhone 14/15)
  await pagina.enviar('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await cargar();
  const mobile = await pagina.evaluar(medir);

  // prefers-reduced-motion
  await pagina.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await pagina.enviar('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await cargar();
  const reducido = await pagina.evaluar(medir);
  await pagina.enviar('Emulation.setEmulatedMedia', { features: [] });

  // Sin JavaScript
  await pagina.enviar('Emulation.setScriptExecutionDisabled', { value: true });
  await cargar();
  const sinJs = await pagina.evaluar(() => {
    const h = document.querySelector('h1');
    const vis = el => { if (!el) return null; const s = getComputedStyle(el), r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > .05 && r.height > 0; };
    return { heroVisible: vis(h), texto: document.body.innerText.trim().length };
  }).catch(() => null);
  await pagina.enviar('Emulation.setScriptExecutionDisabled', { value: false });

  await cerrar();
  return { desktop, mobile, reducido, sinJs, errores };
}

// ── Informe ──────────────────────────────────────────────────────────────────
const C = { rojo: s => `\x1b[31m${s}\x1b[0m`, ambar: s => `\x1b[33m${s}\x1b[0m`,
  verde: s => `\x1b[32m${s}\x1b[0m`, gris: s => `\x1b[90m${s}\x1b[0m` };

function informe(r) {
  const fallas = [], avisos = [];
  const F = (t, d) => fallas.push({ t, d });
  const A = (t, d) => avisos.push({ t, d });

  // Agrupamos: veinte veces el mismo span con el mismo gris es UN problema, no veinte.
  const agrupar = (lista, clave) => {
    const m = new Map();
    for (const x of lista) { const k = clave(x); m.set(k, [...(m.get(k) || []), x]); }
    return [...m.values()];
  };
  for (const grupo of agrupar(r.desktop.contraste, c => `${c.clase}|${c.ratio}`)) {
    const c = grupo[0], veces = grupo.length > 1 ? ` ${C.gris(`(×${grupo.length})`)}` : '';
    F('contraste', `${c.ratio}:1 (mínimo ${c.minimo}) · ${c.px}px · ${c.el}${veces}`);
  }
  if (r.desktop.noMedible.length)
    A('contraste', `${r.desktop.noMedible.length} elemento(s) sobre un gradiente o una imagen: el contraste ahí no se calcula, miralo a ojo · ${r.desktop.noMedible.slice(0, 3).join(' · ')}`);
  for (const m of r.desktop.medida)
    A('medida de línea', `${m.cpl} caracteres por renglón (máximo 75) · ${m.el}`);
  if (r.desktop.pegados.length)
    A('escala tipográfica', `tamaños casi iguales, eso no es escala: ${r.desktop.pegados.slice(0, 6).join(', ')}`);
  for (const f of r.desktop.focoRoto)
    F('foco de teclado', `outline suprimido sin reemplazo visible · ${f}`);
  for (const f of r.desktop.faltantes)
    F('tipografía', `"${f}" está declarada pero NO cargó (mirá la CSP o el @import) — se está viendo con la fuente de respaldo`);
  for (const g of r.desktop.genericas)
    A('tipografía', `"${g}" es una de las fuentes que delatan una página hecha con IA`);
  if (r.desktop.animando.length)
    A('movimiento', `animación en loop infinito (el momento pasa una vez): ${r.desktop.animando.join(' · ')}`);

  if (r.mobile.scrollWidth > 391)
    F('mobile', `la página se va al costado en 390px (scrollWidth ${r.mobile.scrollWidth}px)`);
  const soloMobile = r.mobile.contraste.filter(c => !r.desktop.contraste.some(d => d.el === c.el));
  for (const grupo of agrupar(soloMobile, c => `${c.clase}|${c.ratio}`)) {
    const c = grupo[0], veces = grupo.length > 1 ? ` ${C.gris(`(×${grupo.length})`)}` : '';
    F('mobile · contraste', `${c.ratio}:1 (mínimo ${c.minimo}) · ${c.el}${veces}`);
  }
  if (r.mobile.heroVisible === false)
    F('mobile', 'el h1 no se ve en 390px');

  if (r.reducido.ocultosGrandes.length)
    F('reduced-motion', `con reduced-motion queda contenido invisible (mostrá el estado FINAL, no una versión mocha): ${r.reducido.ocultosGrandes.join(' · ')}`);
  if (r.reducido.animando.length)
    A('reduced-motion', `sigue habiendo animación en loop: ${r.reducido.animando.join(' · ')}`);

  if (r.sinJs && r.sinJs.heroVisible === false)
    F('sin JavaScript', 'el h1 desaparece sin JS: el estado escondido está en el CSS base en vez de detrás de la clase .js');
  if (r.sinJs && r.desktop.heroTexto && r.sinJs.texto < 40)
    F('sin JavaScript', 'la página queda casi vacía sin JS');

  for (const e of r.errores.slice(0, 6)) F('consola', e);

  console.log('');
  if (!fallas.length && !avisos.length) {
    console.log(C.verde('✓ El piso mecánico está en verde.'));
    console.log(C.gris('  Contraste, medida, mobile 390, reduced-motion, sin-JS y consola: sin hallazgos.'));
  }
  if (fallas.length) {
    console.log(C.rojo(`✗ ${fallas.length} ${fallas.length === 1 ? 'falla' : 'fallas'} — esto se arregla, no se discute:`));
    for (const f of fallas.slice(0, 14)) console.log(`  ${C.rojo('•')} ${C.ambar(f.t)}  ${f.d}`);
    if (fallas.length > 14) console.log(C.gris(`    … y ${fallas.length - 14} más del mismo tipo`));
    console.log('');
  }
  if (avisos.length) {
    console.log(C.ambar(`▲ ${avisos.length} ${avisos.length === 1 ? 'aviso' : 'avisos'} — decidilos, pueden ser a propósito:`));
    for (const a of avisos) console.log(`  ${C.ambar('•')} ${C.gris(a.t)}  ${a.d}`);
    console.log('');
  }
  console.log(C.gris(`  medido en 1440px y 390px, recorriendo la página entera · ${r.desktop.tamaños} tamaños de letra${r.desktop.fluida ? ' (tipografía fluida: no se evalúa la escala)' : ''}`));
  console.log('');
  return fallas.length;
}

// ── Autotest: una página deliberadamente rota tiene que ser detectada ────────
const PAGINA_ROTA = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
  body{margin:0;background:#0b0b0b;color:#e8e8e8;font:400 16px/1.6 system-ui}
  .apagado{color:#3a3a3a}                                   /* contraste al piso */
  .ancho{max-width:none;padding:0 8px}                      /* medida larguísima */
  h1{opacity:0}                                             /* muere sin JS */
  button:focus{outline:none}                                /* foco suprimido */
  @keyframes late{to{transform:scale(1.02)}}
  .late{animation:late 2s infinite}                         /* loop infinito */
  .fuera{width:1600px;height:20px}                          /* desborde mobile */
</style></head><body>
<h1>Un titular que arranca invisible</h1>
<p class="apagado ancho">Texto secundario en un gris que no llega al mínimo de contraste, y además
puesto a todo el ancho de la pantalla para que el renglón salga larguísimo y el ojo pierda la línea
cuando vuelve al principio, que es exactamente lo que el piso mecánico no deja pasar nunca.</p>
<div class="late">late para siempre</div><div class="fuera"></div>
<button>Enviar</button>
<script>document.querySelector('h1').style.opacity=1<\/script></body></html>`;

async function autotest() {
  const dir = await mkdtemp(join(tmpdir(), 'lm-autotest-'));
  await writeFile(join(dir, 'index.html'), PAGINA_ROTA);
  const { puerto, cerrar } = await servir(dir);
  const r = await auditar(`http://127.0.0.1:${puerto}/index.html`);
  cerrar(); await rm(dir, { recursive: true, force: true });

  const esperado = [
    ['contraste', r.desktop.contraste.length > 0],
    ['medida de línea', r.desktop.medida.length > 0],
    ['foco de teclado', r.desktop.focoRoto.length > 0],
    ['loop infinito', r.desktop.animando.length > 0],
    ['desborde en 390px', r.mobile.scrollWidth > 391],
    ['muere sin JS', r.sinJs?.heroVisible === false],
  ];
  let mal = 0;
  for (const [nombre, ok] of esperado) {
    console.log(`${ok ? C.verde('✓') : C.rojo('✗')} detecta: ${nombre}`);
    if (!ok) mal++;
  }
  console.log(mal ? C.rojo(`\n${mal} de ${esperado.length} chequeos NO detectaron su falla.`)
                  : C.verde(`\n${esperado.length} chequeos OK.`));
  return mal;
}

// ── Entrada ──────────────────────────────────────────────────────────────────
const arg = process.argv[2];
if (!arg || arg === '--help' || arg === '-h') {
  console.log(`
El piso mecánico, medido sobre la página renderizada.

  node audit.mjs pagina.html            un archivo local (lo sirve por HTTP solo)
  node audit.mjs http://localhost:5173  un sitio ya levantado (Vite, Next, el que sea)
  node audit.mjs --autotest             se verifica a sí mismo contra una página rota

Necesita Chrome, Chromium, Edge o Brave instalado. Si está en otro lado:
  CHROME_PATH="/ruta/al/navegador" node audit.mjs pagina.html
`);
  process.exit(0);
}

try {
  if (arg === '--autotest') process.exit((await autotest()) ? 1 : 0);

  let url = arg, cerrarServidor = null;
  if (!/^https?:\/\//.test(arg)) {
    const ruta = resolve(arg);
    if (!existsSync(ruta)) throw new Error(`no encuentro ${ruta}`);
    const { puerto, cerrar } = await servir(dirname(ruta));
    cerrarServidor = cerrar;
    url = `http://127.0.0.1:${puerto}/${basename(ruta)}`;
  }
  console.log(C.gris(`\n  auditando ${arg}`));
  const r = await auditar(url);
  cerrarServidor?.();
  process.exit(informe(r) ? 1 : 0);
} catch (e) {
  console.error(C.rojo('\n✗ ' + e.message + '\n'));
  process.exit(2);
}
