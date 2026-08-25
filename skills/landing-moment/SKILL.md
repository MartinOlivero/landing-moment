---
name: landing-moment
description: Use this skill to build, redesign or rescue a landing page, sales page, hero or product section so it does not read as a template. Trigger when the user says "armá una landing", "rediseñá esta página", "hacele algo épico", "que sorprenda", "que no parezca hecho con IA", "está plano", "sumale animaciones", "build me a landing page", "make this hero less generic", "my page looks AI-generated", or asks which component library to use (shadcn, Magic UI, react-bits, Aceternity, cult-ui). Contains the authored-moment method, a mechanical craft floor, two production-tested reference components, a library/licence table, and a detector for the tells of an AI-built page.
---

# Landing moment

Una landing no se salva con más efectos. Se salva con **uno solo**, que sea el argumento de la
página ejecutándose. Esta skill es el método para encontrarlo y construirlo.

---

## La regla que ordena todo lo demás

**El momento sale del argumento, no del catálogo.**

Antes de escribir una línea de CSS, leé el titular y preguntate: *¿qué frase es la promesa?* El
efecto que vale es el que hace **visible esa frase**. Todo lo demás es decoración, y la decoración
es exactamente lo que hace que una página huela a plantilla.

### Cuatro casos que funcionaron

| La frase | El momento |
|---|---|
| *"Tus redes ya te dijeron qué hacer. **Nadie te lo tradujo.**"* | Alrededor del título flotan los nombres crudos que devuelven las APIs (`reach`, `impressions`, `avg_view_duration`). Una línea de luz baja **una vez** y los deja traducidos. |
| *"Tu closer cortó una llamada de USD 8.000 y **nadie sabe qué pasó adentro**"* | Esa llamada dibujada como la ve un editor de audio. Arranca gris —nadie la escuchó— y un cabezal la reproduce frenando en los cinco momentos donde se cayó la venta. |
| *"El lead que no contestás en cinco minutos **ya está hablando con otra empresa**"* | La misma consulta de las 23:47 en dos carriles. Arriba un reloj no para hasta las 32 h del lunes y el lead se enfría a gris; abajo el sistema lo frena en 0:03 y le pone dueño. Eje logarítmico y rotulado: en lineal, tres segundos al lado de treinta y dos horas no se ven. |
| *"No te enseño a usar IA. **Te enseño a pensar sistemas** con IA."* | Dentro de un monitor CRT hay nueve herramientas sueltas y apagadas. Un filo de luz baja una vez y a su paso las deja **cableadas** en un sistema. El cartel de abajo pasa de "nueve herramientas sueltas" a "un sistema". |

Ninguno es "un fondo animado". Todos son **el argumento, ejecutándose**.
Si el efecto se puede sacar y la página dice lo mismo, el efecto sobraba.

### Cómo encontrarlo

1. Leé el titular y las tres primeras objeciones que la página responde.
2. Buscá el **sustantivo concreto** que ya está en el texto: una llamada, un dato, una planilla,
   una grieta, un mes perdido. El momento es ese objeto, hecho visible.
3. Preguntate qué **acción** le falta: traducirse, reproducirse, ordenarse, escucharse, sumarse.
4. Ese sustantivo + esa acción es el momento. Si no aparece nada, el problema es el copy, no el
   diseño — **decilo antes de ponerte a animar**. Ésa es la falla más común y ninguna animación
   la tapa.

### Si el producto ya tiene un mundo visual, el mundo de la página sale de ahí

Antes de inventar una paleta, preguntate si el producto **ya se ve como algo**: las portadas de
sus módulos, la UI del propio producto, el packaging, las miniaturas de sus videos. En el cuarto
caso de arriba la respuesta estaba adentro — trece portadas que eran todas el mismo universo
(madera en sombra, lámpara ámbar, CRT verde fósforo) mientras la landing era azul frío y no se
parecía a nada de lo que ve un cliente cuando entra.

De ahí salen tres cosas gratis:
1. **La paleta**, sacada de material real y no de una librería.
2. **Los objetos** donde apoyar el momento (un monitor, un televisor, una polaroid) — el momento
   necesita un cuerpo, y ese cuerpo tiene que ser del mundo del producto.
3. **Una sección entera de prueba**: ese material real, en fila. Es lo que se compra, ya estaba
   hecho, y no se estaba usando.

Regla corta: *el mundo de la landing es el mundo del producto*. Si el producto no tiene uno, ahí
sí se inventa.

---

## Las seis reglas de construcción

### 1. Un momento, no seis efectos
Una página tiene **un** golpe. Cinco animaciones distintas en cinco secciones se leen como una
plantilla con los complementos puestos.

### 2. Ese gesto se repite para unificar la página
Distinto de lo anterior: el momento es uno, pero **su lenguaje** se repite. El barrido que traduce
en el hero es el mismo filo de luz que revela cada captura más abajo. La cinta del hero sigue
corriendo entre secciones con su marca de tiempo. Eso convierte una lista de bloques en **una sola
cosa que avanza**.

Forma barata y muy efectiva: reemplazá los `border-t` que separan secciones por un separador que
sea parte del momento (un tramo de la onda, un timestamp, una marca).

### 3. Determinista, siempre
Nada de `Math.random()` en la carga. Usá un PRNG con semilla fija (mulberry32, seis líneas):

```js
function azar(semilla) {
  return () => {
    semilla |= 0; semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

**Por qué importa más de lo que parece**: una onda al azar se lee como *ruido de fondo*; la misma
onda en cada visita se lee como *un archivo*. Es la diferencia entre decoración y evidencia. Además
te deja capturar, comparar y depurar.

### 4. La forma tiene que llevar información
Éste es el filtro que separa el trabajo bueno del vistoso:

- El prospecto habla largo **justo donde el closer se queda mudo**. Eso no es dibujo, es el
  diagnóstico.
- Los términos flotantes son los nombres **literales** que devuelven las APIs — quien peleó con
  esas pantallas los reconoce.

Si la forma se puede cambiar por cualquier otra sin perder nada, es relleno.

### 5. Degradá bien, siempre
No es burocracia de accesibilidad: es que la página tiene que funcionar para todos.

- `prefers-reduced-motion`: mostrá el **estado final** (todo traducido, la cinta entera), no una
  versión mocha. El chiste visual se pierde, la información no.
- **Sin JavaScript**: la página se ve como antes. Poné el estado escondido detrás de una clase que
  el propio script agrega (`document.documentElement.classList.add('js')`), nunca en el CSS base.
- **Mobile**: si el efecto necesita márgenes que en 390px no existen, apagalo por media query en
  vez de encogerlo. Un efecto apretado se ve peor que ninguno.
- **Rendimiento**: precalculá una vez por tamaño y guardá el resultado; en el bucle de pintado sólo
  dibujá. Buscar dentro del loop cuesta decenas de miles de comparaciones por cuadro.

### 6. Una vez, no en loop
El momento pasa **una vez**, al entrar. Un fondo que se mueve para siempre cansa y compite con el
texto. Si vale la pena repetirlo, dale al visitante el control con un botón discreto
(*"↻ escucharla de nuevo"*), no un loop automático.

---

## El piso mecánico

El momento es la dirección; esto es el piso. Una buena idea con la tipografía y el espaciado
flojos sigue siendo una página floja. Está en `references/craft-floor.md` — **leelo antes de dar
por cerrada la página** y verificá sobre el resultado renderizado, no sobre la intención.

---

## Lo que delata una página hecha con IA

Ninguna es un pecado en sí — el problema es usarlas **por defecto**, sin haber decidido:

- Texto con gradiente. La jerarquía sale del peso y del tamaño.
- La tipografía de siempre: **Inter, Roboto, Geist, Plus Jakarta Sans, Fraunces, Space Grotesk**
  aparecen en tantas páginas generadas con IA que ya no distinguen nada. Elegí una fuente con
  carácter, y un mono de verdad para todo lo que sea un dato: hora, reloj, puntaje, patente.

  ⚠️ **Antes de elegir tipografía, mirá la CSP del proyecto.** Si tiene `style-src 'self'` o
  `font-src 'self'`, un `@import` a `fonts.googleapis.com` queda **bloqueado en silencio** y la
  página se ve con la fuente del sistema sin que nadie lo note. En Next se resuelve con
  `next/font/google` (baja los archivos en el build y los sirve desde el dominio propio); en HTML
  plano, bajando los `.woff2`. Comprobalo en el navegador:
  `[...new Set([...document.fonts].map(f => f.family))]` — si tu familia no aparece, no está
  cargando.
- Filas de cards iguales (ícono + título + párrafo) como estructura de la página.
- Emojis haciendo de sistema de íconos.
- Glow de colores en todo. Un halo se gana cuando el objeto **es** luz (un filo de radar, un
  cabezal); en una card es disfraz.
- Grilla de fondo con líneas finas… salvo que la página sea literalmente una superficie de
  instrumentos.
- Numeritos de sección 01 / 02 / 03 cuando el orden no aporta información.
- Un "kicker" en mayúsculas arriba de cada título.
- Em-dashes por todos lados en el copy — si hay más de ocho en una página, es cadencia de IA.
- Y la más importante: **efectos sacados de una librería sin relación con lo que dice la página**.

Corré el detector cuando termines:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/detect.mjs <archivos o carpeta>
```

**No lo obedezcas ciegamente.** Si marca algo que es intencional y justificado por el mundo visual
de la página, dejalo y decíselo al usuario en vez de romper el diseño para apagar una alerta. En
producción, dos de sus hallazgos fueron descartados a propósito: un halo cyan que *era* el lenguaje
HUD de la página, y una grilla de fondo que *era* la superficie de instrumentos del producto.

---

## El orden de trabajo

1. **Leé la página entera antes de tocar nada** — el copy, el CSS, los componentes. En una página
   trabajada, romper el copy cuesta más que el efecto que agregás.
2. Encontrá el momento. Si hay dos caminos válidos, **preguntá** con opciones concretas antes de
   construir: es una decisión de dirección, no un detalle.
3. Construí. Comentarios explicando **por qué**, no qué.
4. **Verificá en un navegador de verdad**, desktop y mobile. Levantá el sitio local
   (`python3 -m http.server` para estático, `npm run dev` para Vite) y sacá capturas del momento
   **en movimiento** — una captura del estado final no prueba nada.
5. Mirá la consola por errores. Corré el detector y el piso mecánico. Si hay TypeScript, `tsc -b` y
   el build antes de publicar.
6. **No publiques sin permiso.** En muchos repos un `git push` es un deploy a producción.

---

## Las referencias

| Necesito… | Leé |
|---|---|
| El piso de calidad mecánica: contraste, medida, escala tipográfica, estados | `references/craft-floor.md` |
| Un barrido de luz que revela o transforma algo, en HTML/CSS/JS sin build | `references/sweep-vanilla.md` |
| Una cinta / línea de tiempo que se reproduce sola y frena en puntos clave (React + canvas) | `references/tape-react.md` |
| Qué librería de componentes usar, y cuál evitar por licencia | `references/libraries.md` |

Adaptá el **mecanismo**, no copies el contenido: el momento tiene que salir del argumento de la
página nueva.

Chequeá el stack **antes** de proponer nada: la mitad de las librerías que existen son React, y
meter React en una página HTML plana para conseguir una animación es cambiar la casa para colgar
un cuadro.
