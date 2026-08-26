---
name: landing-moment
description: Use this skill to build, redesign or rescue a landing page, sales page, hero or product section so it does not read as a template. Trigger when the user says "armá una landing", "rediseñá esta página", "hacele algo épico", "que sorprenda", "que no parezca hecho con IA", "está plano", "sumale animaciones", "build me a landing page", "make this hero less generic", "my page looks AI-generated", or asks which component library to use (shadcn, Magic UI, react-bits, Aceternity, cult-ui). Contains the authored-moment method, a catalogue of seven mechanism families (translate, replay, connect, complete, compare, disassemble, filter) for when nothing comes to mind, a movement score for spreading the gesture across the whole page instead of leaving everything below the hero dead, a copy gate that stops generic headlines before any design, a mechanical craft floor with real typeface alternatives, a full worked example page, two production-tested reference components, a library/licence table, a detector for the tells of an AI-built page, and an auditor that measures the rendered page in a real browser (contrast, line measure, mobile 390px, reduced-motion, no-JS, fonts that failed to load).
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

### El catálogo: siete familias de mecanismo

Si el paso anterior te dio el sustantivo y la acción pero no sabés qué construir, entrá por acá.
La columna que manda es la primera: **qué tiene que probar la página**.

| La página tiene que probar… | La familia | El mecanismo | Dónde está |
|---|---|---|---|
| Que algo confuso se vuelve claro | **Traducir** | Un filo de luz cruza una vez y a su paso deja el contenido transformado | `references/sweep-vanilla.md` |
| Que pasó algo que nadie vio | **Reproducir** | Una cinta / línea de tiempo que se toca sola y frena en los momentos clave | `references/tape-react.md` |
| Que piezas sueltas se vuelven un sistema | **Conectar** | Cajas que viajan a su lugar y cables que se dibujan solos | `references/graph-react.md` |
| Que falta algo que no se está viendo | **Completar** | Una grilla con lo que sí está, y lo que falta apareciendo encima con un contador que sube | `references/example-page.html` |
| Que hay dos caminos y uno cuesta caro | **Comparar** | Dos carriles sincronizados con el mismo hecho: arriba sin el producto, abajo con él. Cuidado con la escala — tres segundos al lado de treinta y dos horas necesitan eje logarítmico y rotulado | caso 3 |
| Que adentro de la caja negra hay partes | **Desarmar** | El objeto se abre en capas separadas, cada una rotulada, y vuelve a cerrarse | — |
| Que de mucho ruido sale una sola decisión | **Filtrar** | Muchos elementos, la mayoría se apaga, queda uno encendido con su razón al lado | — |

Las dos últimas todavía no tienen componente de referencia escrito: el mecanismo está descrito, el
código es tuyo. Y si tu página necesita algo que no está en la tabla, **no fuerces una familia**:
la tabla es un atajo cuando no aparece nada, no un menú del que hay que elegir.

### Paso 0 — la puerta del copy (obligatorio, antes de tocar CSS)

**Es la causa número uno de que una página salga genérica**, y no se arregla diseñando. Pasá el
titular por estos tres filtros antes de escribir una línea de código:

| Filtro | Pasa | No pasa |
|---|---|---|
| **Un sustantivo concreto**: algo que se pueda dibujar | *una llamada de USD 8.000*, *el lead de las 23:47*, *nueve herramientas sueltas* | *tu negocio*, *tu productividad*, *tus procesos* |
| **Un número, una hora o un nombre propio** que alguien pueda reconocer | *5 minutos*, *32 h*, `avg_view_duration` | *rápido*, *eficiente*, *escalable* |
| **Una tensión**: dos estados, uno malo y uno bueno | *nadie lo tradujo* → traducido | *la mejor plataforma para X* |

Si el titular no pasa los tres, **frená y decilo**, con estas palabras o parecidas:

> *"Este titular no tiene de dónde agarrarse: no hay ningún objeto concreto para hacer visible.
> Cualquier efecto que le ponga va a ser decoración. Contame en una frase el peor día de tu
> cliente sin el producto — con el objeto, la hora y el número — y de ahí sale el titular y el
> momento."*

Después reescribí el titular **con el usuario** y recién ahí seguí. Una página con copy flojo y
una animación cara sigue siendo una página floja; una página con un buen titular y cero animación
ya vende. El orden importa y es éste.

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

⚠️ Esto **no** quiere decir que el resto de la página vaya muerta. Un hero espectacular seguido de
cuatro pantallas de texto plano falla igual. Cómo se reparte el movimiento sin caer en el circo
está en *La partitura de movimiento*, más abajo — leelo junto con la regla 2.

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

## La partitura de movimiento

La regla 1 dice *un momento, no seis efectos*, y se malinterpreta fácil: **no significa que el
resto de la página tenga que estar muerta**. Significa que hay **un** golpe y que todo lo demás
habla su idioma. Una página con un hero espectacular y cuatro pantallas de texto plano abajo es
tan plantilla como una con seis animaciones distintas — en la primera te quedaste sin nafta en la
sección dos.

Repartilo en tres papeles, y no más de tres:

| Papel | Cuántos | Cuánto pesa | Qué es |
|---|---|---|---|
| **El momento** | Uno | 60-70% del esfuerzo | El golpe del hero. Dura 1 a 2 segundos, pasa una vez, y es el argumento ejecutándose |
| **Los ecos** | Uno por sección, como máximo | 25-30% | El **mismo gesto**, más chico y más barato, haciendo un trabajo local: el filo que revela cada captura, un cable que se dibuja al lado de un título, el contador que sube cuando entra la sección de precio |
| **El hilo** | Uno | 5-10% | Lo continuo y **mudo**: el separador que es un tramo de la onda, la marca de tiempo corriendo, la superficie de instrumentos de fondo. No cambia mientras leés, por eso no compite |

### Cómo se saca un eco del momento

Un eco no se inventa: se **degrada** del momento mayor. Tomá su gesto y bajale una dimensión.

- Momento: un barrido que traduce nueve términos → Eco: el mismo barrido revelando **una** captura.
- Momento: una cinta que se reproduce entera → Eco: **un tramo** de esa cinta como separador, con
  su timestamp.
- Momento: nueve nodos que se cablean → Eco: **dos** nodos y un cable dibujándose al lado del
  título de la sección.

Si el eco necesita un mecanismo nuevo para funcionar, no es un eco: es un segundo momento, y eso
es lo que la regla 1 prohíbe.

### El ritmo del scroll

Recorré la página como una partitura, sección por sección, y preguntate qué pasa en cada una.
**Dos bloques de texto largo seguidos sin que ocurra nada es el punto donde se abandona la
página.** No hace falta una animación cara: alcanza con que algo entre, se revele o cambie de
estado cuando esa sección llega.

Tres cosas que se leen como vida y cuestan poco:
1. **Material real que aparece con el gesto del momento** (una captura del producto revelada por el
   filo, en vez de una card con un ícono).
2. **Un número que se cuenta al entrar** — pero sólo si el número importa, y escrito en el HTML,
   no arrancando en cero (si la pestaña está en segundo plano, `requestAnimationFrame` no corre y
   el visitante encuentra un cero).
3. **Un estado que cambia bajo el cursor** en algo que ya es del mundo de la página: una fila que
   se ilumina, una pieza que se levanta, un tramo de la onda que se marca.

### Lo que NO cuenta como movimiento

- **El fade-up idéntico en cada bloque al scrollear.** Es la firma de plantilla más común que
  existe: si todo entra igual, nada entra. Si vas a usarlo, que sea el gesto del momento, no un
  `fade-in-up` genérico repetido veinte veces.
- **Un fondo que se mueve solo para siempre.** Cansa y compite con el texto.
- **Parallax por el parallax.** Mover algo a otra velocidad no dice nada salvo que la profundidad
  sea parte del argumento.
- **Micro-animaciones en todos los botones.** El movimiento es un idioma: si todo lo habla, deja de
  significar.

### Por qué esto funciona (y no es "porque queda lindo")

Una animación bien elegida hace tres cosas que un párrafo no puede:

1. **Demuestra en vez de afirmar.** "Conectamos tus herramientas" es una promesa. Ver las nueve
   herramientas cablearse es una prueba. La página deja de pedir que le crean.
2. **Baja el costo de entender.** Una relación entre nueve cosas se agarra de un vistazo; en texto
   son tres párrafos que hay que sostener en la cabeza. Lo que el dibujo explica, el copy ya no
   tiene que explicar — y la página se acorta.
3. **Le da progreso al scroll.** Cuando algo cambia porque avanzaste, avanzar tiene sentido. Una
   página que no reacciona se lee como un PDF largo, y un PDF largo se cierra.

Por eso el filtro sigue siendo el de la regla 4: **si la forma se puede cambiar por cualquier otra
sin perder nada, es relleno**. El movimiento que no prueba, no explica y no marca progreso, sólo
consume atención — y encima carga la batería del que te está leyendo en el celular.

---

## El piso mecánico

El momento es la dirección; esto es el piso. Una buena idea con la tipografía y el espaciado
flojos sigue siendo una página floja. Está en `references/craft-floor.md` — **leelo antes de dar
por cerrada la página** y verificá sobre el resultado renderizado, no sobre la intención.

Buena parte de ese piso se mide sola. `audit.mjs` abre la página en el Chrome que ya tenés
instalado (cero dependencias, no instala nada) y mide **contraste real** componiendo las capas
translúcidas, **medida de línea**, **desborde en 390px**, si la página **degrada sin JS y con
reduced-motion**, si la **tipografía cargó de verdad**, y los **errores de consola**:

```bash
AUD=$(find ~/.claude/plugins -maxdepth 8 -name audit.mjs -path '*landing-moment*' 2>/dev/null | head -1)
node "${AUD:-scripts/audit.mjs}" pagina.html        # o http://localhost:5173
```

Recorre la página entera antes de medir, así que ve las secciones que se revelan al bajar. Lo que
marca como **falla** es un número contra un mínimo: se arregla. Lo que marca como **aviso** es una
decisión: puede estar bien y lo decidís vos.

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

Corré el detector cuando termines. El script vive adentro del plugin instalado, así que la
primera línea lo busca; si clonaste el repo, cae solo al camino relativo:

```bash
DET=$(find ~/.claude/plugins -maxdepth 8 -name detect.mjs -path '*landing-moment*' 2>/dev/null | head -1)
node "${DET:-scripts/detect.mjs}" <archivo o carpeta>
```

⚠️ No escribas `node ${CLAUDE_PLUGIN_ROOT}/scripts/detect.mjs`: esa variable **sólo** se sustituye
en hooks y en configs de MCP, no en la terminal, así que ahí llega vacía y el comando falla con
`Cannot find module '/scripts/detect.mjs'`.

**No lo obedezcas ciegamente.** Si marca algo que es intencional y justificado por el mundo visual
de la página, dejalo y decíselo al usuario en vez de romper el diseño para apagar una alerta. En
producción, dos de sus hallazgos fueron descartados a propósito: un halo cyan que *era* el lenguaje
HUD de la página, y una grilla de fondo que *era* la superficie de instrumentos del producto.

---

## El orden de trabajo

1. **Leé la página entera antes de tocar nada** — el copy, el CSS, los componentes. En una página
   trabajada, romper el copy cuesta más que el efecto que agregás.
2. **Pasá el titular por la puerta del copy.** Si no la pasa, frená ahí: no empieces a diseñar
   sobre un titular vacío.
3. Encontrá el momento. Si hay dos caminos válidos, **preguntá** con opciones concretas antes de
   construir: es una decisión de dirección, no un detalle.
4. Construí. Comentarios explicando **por qué**, no qué.
5. **Verificá en un navegador de verdad**, desktop y mobile. Dos caminos, y el segundo no es
   opcional:
   - Si tenés control del navegador (la extensión *Claude in Chrome*, Playwright, lo que sea):
     mirá el momento **en movimiento**. Una captura del estado final no prueba nada.
   - Tengas eso o no: **corré `audit.mjs`**. Mide en 1440 y en 390, sin JS y con reduced-motion,
     y ve cosas que a ojo se escapan (un desborde de 9px, un gris que quedó en 3.8:1).
6. Corré el **detector** (código fuente) y el **auditor** (página renderizada). Si hay TypeScript,
   `tsc -b` y el build antes de publicar.
7. **No publiques sin permiso.** En muchos repos un `git push` es un deploy a producción.

---

## Las referencias

| Necesito… | Leé |
|---|---|
| El piso de calidad mecánica: contraste, medida, escala tipográfica, tipografías con carácter, estados | `references/craft-floor.md` |
| Una página entera de ejemplo, con su momento, que pasa el detector y el auditor | `references/example-page.html` |
| Un barrido de luz que revela o transforma algo, en HTML/CSS/JS sin build | `references/sweep-vanilla.md` |
| Una cinta / línea de tiempo que se reproduce sola y frena en puntos clave (React + canvas) | `references/tape-react.md` |
| Piezas sueltas que se ordenan en un sistema: cajas que viajan y cables que se dibujan (SVG + CSS) | `references/graph-react.md` |
| Qué librería de componentes usar, y cuál evitar por licencia | `references/libraries.md` |

Adaptá el **mecanismo**, no copies el contenido: el momento tiene que salir del argumento de la
página nueva.

Chequeá el stack **antes** de proponer nada: la mitad de las librerías que existen son React, y
meter React en una página HTML plana para conseguir una animación es cambiar la casa para colgar
un cuadro.
