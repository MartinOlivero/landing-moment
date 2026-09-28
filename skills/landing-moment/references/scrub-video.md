# Video que avanza con el scroll (vanilla, sin build, sin costo)

El visitante scrollea y el video avanza; scrollea para arriba y retrocede. **El scroll es la
manija del tiempo.** Es la técnica de las páginas de producto de Apple: la cámara se mueve de
verdad, el scroll sólo decide en qué cuadro estamos.

Sirve para dos familias del catálogo:

- **Recorrer** — la página tiene que probar *que hay un camino de A a B* (del lead que entra al
  cierre, del grano a la taza, del archivo crudo al reporte). El visitante lo recorre a su ritmo.
- **Reproducir**, con material real — una grabación de pantalla del producto haciendo su trabajo,
  que el visitante adelanta y rebobina. Es prueba, no promesa.

## De dónde sale el video (las tres primeras son gratis)

| Fuente | Costo | Cuándo |
|---|---|---|
| **Grabación de pantalla del producto** | $0 | Casi siempre. Es material real: lo que se compra, haciendo lo que promete |
| **Una animación propia renderizada** (Remotion, HyperFrames, After Effects, Blender) | $0 | Cuando el proceso no se puede filmar: datos que se ordenan, piezas que se arman |
| **Video filmado** (el local, el producto en la mano, la fábrica) | $0 | Negocios físicos |
| **Un mundo generado con IA** — el plugin [scroll-world](https://github.com/oso95/scroll-world) | ~USD 11-27 por página (Higgsfield / Monid) | Sólo si el argumento pide un mundo que no existe. Pasá igual su página por la puerta del copy y el detector: de fábrica pone un rótulo en mayúsculas arriba de cada título |

**Filtro antes de construirlo** (la regla 4 del método): el scroll tiene que ser el tiempo **de
algo**. Si el video es una toma linda que no cuenta un antes y un después, moverla con el scroll
es decoración cara — y pesa megas.

## Codificar el video

Ésta es la parte que casi todos hacen mal. Dos claves:

1. **No hace falta un video "todo cuadros clave"** (pesa 3× más). Alcanza con un cuadro clave
   cada 8, porque el motor carga el archivo entero en memoria (ver trampas).
2. **No achiques la calidad para que scrubee suave.** Resolución nativa, `crf 20`.

```bash
# Escritorio: nativo, un cuadro clave cada 8, sin audio, arranque rápido
ffmpeg -i crudo.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart recorrido.mp4

# Celular: 720 de ancho y un cuadro clave cada 4 (el decodificador del teléfono sufre al saltar)
ffmpeg -i crudo.mp4 -an -vf "scale=720:-2" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart recorrido-m.mp4

# Los pósters: el cuadro final (lo que ve quien no tiene movimiento) y el inicial
ffmpeg -sseof -0.1 -i recorrido.mp4 -frames:v 1 -q:v 2 final.jpg
ffmpeg -ss 0      -i recorrido.mp4 -frames:v 1 -q:v 2 inicio.jpg
```

Largo razonable: **6 a 10 segundos**. Un clip de 8 s en 1080p con estos parámetros pesa
~5-8 MB; más largo, partilo en dos secciones.

## El HTML y el CSS

```html
<section class="scrub" style="--largo: 300">
  <div class="scrub__fijo">
    <!-- El póster es el cuadro FINAL: sin JS o con reduced-motion, se ve el estado terminado -->
    <img class="scrub__poster" src="final.jpg" data-inicio="inicio.jpg"
         alt="El lead de las 23:47 ya asignado a un vendedor, con la respuesta enviada a los 3 segundos">
    <video class="scrub__video" data-src="recorrido.mp4" data-src-movil="recorrido-m.mp4"
           muted playsinline preload="none" aria-hidden="true"></video>
  </div>
</section>
```

```css
/* --largo = cuánto scroll dura el recorrido, en alturas de pantalla (300 = tres pantallas) */
.scrub { position: relative; height: calc(var(--largo, 300) * 1vh); height: calc(var(--largo, 300) * 1svh); }
/* svh y no dvh: dvh cambia cuando aparece la barra del navegador en el celular y la página salta */
.scrub__fijo { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
.scrub__poster, .scrub__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.scrub__video { opacity: 0; }
.scrub.con-video .scrub__video { opacity: 1; }

/* Sin JS o sin movimiento: nada de sección de tres pantallas vacía, sólo la imagen final */
html:not(.js) .scrub { height: auto; }
html:not(.js) .scrub__fijo { position: relative; height: auto; aspect-ratio: 16 / 9; }
html:not(.js) .scrub__video { display: none; }
@media (prefers-reduced-motion: reduce) {
  .scrub { height: auto; }
  .scrub__fijo { position: relative; height: auto; aspect-ratio: 16 / 9; }
  .scrub__video { display: none; }
}
```

## El motor (~50 líneas)

```js
// Video movido por el scroll. Los arreglos de celular e iOS vienen de scroll-world
// (github.com/oso95/scroll-world, MIT, © 2026 cyw) — ver "Trampas" para el porqué de cada uno.
document.documentElement.classList.add('js');
(function () {
  // Con reduced-motion no se carga ningún video: queda el póster, que es el estado final.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const movil = matchMedia('(hover: none) and (pointer: coarse), (max-width: 860px)').matches;
  const entre01 = x => Math.min(1, Math.max(0, x));
  let tocado = false;

  const escenas = [...document.querySelectorAll('.scrub')].map(sec => {
    const img = sec.querySelector('.scrub__poster');
    const v = sec.querySelector('.scrub__video');
    if (img.dataset.inicio) img.src = img.dataset.inicio;   // con movimiento, se arranca del principio
    return { sec, v, url: (movil && v.dataset.srcMovil) || v.dataset.src,
             cargando: false, listo: false, actual: 0 };
  });

  function cargar(e) {
    e.cargando = true;
    // El archivo entero a memoria (Blob): así se puede saltar a cualquier cuadro
    // aunque el hosting no sirva pedidos por rangos.
    fetch(e.url).then(r => r.ok ? r.blob() : Promise.reject(r.status)).then(blob => {
      e.v.addEventListener('loadedmetadata', () => { e.listo = true; }, { once: true });
      // Recién cuando el video pintó un cuadro se esconde el póster (iOS muestra negro antes).
      e.v.addEventListener('seeked', () => e.sec.classList.add('con-video'), { once: true });
      e.v.addEventListener('loadeddata', () => { if (tocado) cebar(e.v); }, { once: true });
      e.v.src = URL.createObjectURL(blob);
    }).catch(() => { e.cargando = false; });   // si falla, queda el póster y la página sigue entera
  }

  function cuadro() {
    const vh = innerHeight;
    for (const e of escenas) {
      const r = e.sec.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2.5) continue;   // lejos de la pantalla: no gasta nada
      if (!e.cargando) cargar(e);
      // Nunca pedir un salto mientras el anterior no terminó: en el celular se apilan y el video se congela.
      if (!e.listo || e.v.seeking) continue;
      const meta = entre01(-r.top / (r.height - vh));
      e.actual += (meta - e.actual) * 0.18;              // suavizado: el video persigue al scroll
      const t = Math.min(e.actual, 0.999) * e.v.duration;
      if (Math.abs(e.v.currentTime - t) > (movil ? 0.02 : 0.008)) e.v.currentTime = t;
    }
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);

  // iOS no pinta un video mudo que nunca se reprodujo: al primer toque, play→pause a cada uno.
  function cebar(v) { const p = v.play(); if (p) p.then(() => v.pause()).catch(() => {}); }
  addEventListener('pointerdown', () => {
    tocado = true;
    escenas.forEach(e => e.v.src && cebar(e.v));
  }, { once: true, passive: true });
})();
```

El texto de la sección va **encima** del `.scrub__fijo` (posicionado dentro de él) o al costado;
si querés que aparezca en un tramo del recorrido, leé el mismo `meta` y prendelo por umbral —
pero ojo con el fade-up genérico: que el texto entre con el gesto del momento, no con el de todas
las plantillas.

## Trampas (todas pisadas por alguien)

- **El video queda congelado en el cuadro 0.** El hosting no sirve pedidos por rangos (pasa con
  `python -m http.server` y con varios hostings estáticos) y el navegador no deja saltar. Por eso
  el motor baja el archivo entero como Blob: un Blob siempre se puede recorrer.
- **Pantalla negra en iPhone.** Un video mudo que nunca se reprodujo no pinta el cuadro al que
  saltaste. Dos arreglos juntos: el póster queda puesto hasta el primer `seeked`, y al primer
  toque se hace play→pause. No saques `muted` ni `playsinline`.
- **Se congela al scrollear rápido en el celular.** Los saltos se apilan. El motor no pide uno
  nuevo mientras `v.seeking` es verdadero, y en el celular usa el archivo liviano (`-g 4`, 720).
- **La página salta cuando aparece la barra del navegador.** Usá `svh`, nunca `dvh`, para el alto.
- **Archivos enormes.** Codificaste todo cuadros clave. Con `-g 8` y Blob alcanza.
- **Se ve blando.** Lo achicaste o lo comprimiste de más: nativo, `crf ≤ 20`, y el `unsharp`.
- **El video está en otro dominio.** `fetch` necesita CORS. Servilo desde el mismo sitio.

## Verificar

1. Scrolleá lento de punta a punta y volvé: el video tiene que seguir al dedo en los dos sentidos.
2. Scrolleá rápido con la CPU del navegador frenada 4×: no se tiene que congelar.
3. En la consola: `document.querySelector('.scrub__video').currentTime` tiene que cambiar con el scroll.
4. Corré `audit.mjs`: con reduced-motion y sin JS tiene que quedar la imagen final, sin una
   sección de tres pantallas vacía.
