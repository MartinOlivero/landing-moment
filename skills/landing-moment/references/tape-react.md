# La cinta — React + canvas

Una línea de tiempo que se reproduce sola delante del visitante y **frena** en los momentos que
importan, mostrando qué pasó en cada uno. En producción en el **caso 2** de la skill: una llamada de
ventas de 41 minutos con dos pistas (vendedor y prospecto) y las cinco señales donde se cayó.

---

## Cuándo sirve

- Hay algo que **transcurrió** y se perdió: una llamada, un mes, un pipeline, un proceso.
- Querés mostrar **evidencia**, no una ilustración.
- El stack es React (o cualquiera con canvas; el mecanismo no depende de React).

## Las cuatro decisiones que lo hacen funcionar

### 1. Las pausas son la mitad del efecto
Sin ellas es una barra de carga. Con ellas es **alguien escuchando y anotando**. El cabezal avanza
parejo y se detiene 1,5 s en cada marca mientras aparece lo que se dijo ahí.

```js
const VELOCIDAD = 1 / 7000;   // la cinta entera en 7 s
const PAUSA = 1500;

function paso(ahora) {
  const delta = ahora - anterior; anterior = ahora;
  if (ahora >= pausaHasta) {
    p = Math.min(1, p + delta * VELOCIDAD);
    const m = MARCAS[siguiente];
    if (m && p >= m.en) { p = m.en; pausaHasta = ahora + PAUSA; setMarca(m); siguiente++; }
    setAvance(p);
  }
  if (p < 1) pedido = requestAnimationFrame(paso); else setFin(true);
}
setTimeout(() => { pedido = requestAnimationFrame(paso); }, 900);  // primero se lee el titular
```

### 2. La asimetría lleva el diagnóstico
Las dos pistas no están para que se vea simétrico: **el prospecto habla largo justo donde el
vendedor se queda mudo**. Eso se genera armando los turnos de habla alrededor de las marcas.

```js
const cerca = MARCAS.find(m => Math.abs(m.en - t) < 0.035);
if (cerca && cerca.canal === canal) { largo = .030 + r()*.020; energia = .85 + r()*.15; }  // el que se queja habla largo
else if (cerca)                     { largo = .004 + r()*.004; energia = .18 + r()*.12; }  // y el otro apenas contesta
else                                { largo = .008 + r()*.022; energia = .40 + r()*.45; }
```

Cambiá el sustantivo y la regla sigue sirviendo: donde el dato importa, una serie se estira y la
otra se apaga.

### 3. Gris lo no visto, color lo visto
El estado inicial **todo gris** es lo que comunica "nadie llegó hasta acá". El color aparece
detrás del cabezal: el visitante lo está viendo por primera vez.

```js
if (t > avance)      g.fillStyle = 'rgba(154,161,184,.20)';   // nadie llegó hasta ahí
else if (arriba)     g.fillStyle = 'rgba(123,92,255,.85)';
else                 g.fillStyle = 'rgba(34,211,238,.80)';
```

### 4. Precalcular una vez, pintar muchas
Buscar el turno de cada barra dentro del bucle de pintado son ~70.000 comparaciones por cuadro y
el cabezal se arrastra en un celular. Calculá las alturas cuando cambia el tamaño y guardalas:

```js
const turnos = useMemo(armarTurnos, []);
const barras = useRef([]);
// medir() recorre turnos con un puntero (no find), llena barras.current y llama a pintar()
// un ResizeObserver dispara medir(); el efecto de avance sólo llama a pintar()
```

## El gesto que unifica la página

Los separadores entre secciones son tramos de **la misma** grabación, con su marca de tiempo y lo
que se dijo. Cada sección entra justo después de la objeción que responde, y la página cierra en
`41:07 — fin de la grabación` justo antes del formulario.

```tsx
<Hero />
<MarcaCinta n={0} />   {/* 03:42 «¿Y esto cuánto sale?» */}
<Calculadora />
<MarcaCinta n={1} />   {/* 11:31 «Ya probamos algo parecido...» */}
<Villano />
...
<MarcaCinta fin />     {/* 41:07 fin de la grabación */}
<Diagnostico />
```

Dos detalles que hacen la diferencia:

- **Los tiempos van en orden creciente** hacia abajo. Si van salteados se nota el truco y se cae
  la ilusión de cinta. Si una cita queda mejor en otra sección, cambiale el timestamp: los
  minutos están al servicio del orden, no al revés.
- La lista de momentos vive **en un solo lugar** y la importan los dos componentes. Si el hero y
  los separadores tienen listas distintas, la página se contradice sola.

## Antes de darlo por hecho

- El canvas va `aria-hidden`; lo que se dijo va en HTML real con `aria-live="polite"`, para que un
  lector de pantalla siga la reproducción en vez de anunciar un canvas vacío.
- `prefers-reduced-motion`: `setAvance(1); setFin(true);` y listo — se ve la cinta completa con
  todas las marcas.
- Al terminar, un botón discreto para volver a reproducir. Nunca loop automático.
- Si el contenido es inventado (una llamada de ejemplo), **decilo debajo**. Presentar una
  reconstrucción como si fuera un caso real es el tipo de detalle por el que te clavan.
- Cuidado con lo que el momento **promete**: si mostrás una llamada transcripta y el producto no
  transcribe llamadas, la página está vendiendo una función que no existe. Que el momento ilustre
  el **problema** salvo que la función exista de verdad.
