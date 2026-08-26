# El piso mecánico

El momento es la dirección. Esto es el piso: lo que tiene que estar bien **aunque** el momento sea
brillante. Una buena idea con la tipografía y el espaciado flojos sigue siendo una página floja.

Dos diferencias con la parte creativa de la skill:

1. Acá **no hay criterio, hay números**. Se verifica, no se opina.
2. Se chequea sobre el **resultado renderizado** en el navegador, no sobre la intención. Leé los
   valores computados (`getComputedStyle`), no lo que dice tu CSS.

Hacelo en una sola pasada de inspección al final, no en siete viajes de capturas. **La mayoría de
esta lista está automatizada**: `audit.mjs` abre la página en un Chrome de verdad y mide contraste
real (componiendo las capas translúcidas como las compone el navegador), medida de línea, desborde
en 390px, si degrada sin JS y con `prefers-reduced-motion`, si la tipografía cargó, y los errores
de consola. Corré eso primero y revisá a ojo lo que la máquina no puede ver:

```bash
AUD=$(find ~/.claude/plugins -maxdepth 8 -name audit.mjs -path '*landing-moment*' 2>/dev/null | head -1)
node "${AUD:-scripts/audit.mjs}" pagina.html        # o http://localhost:5173
```

Lo que **no** mide y tenés que mirar vos: el espaciado, la profundidad, los estados de los
controles, el texto de interfaz, la cobertura del brief, y si el momento efectivamente se entiende.

---

## Verificar

### Contraste
Texto de cuerpo y placeholders **≥ 4.5:1** contra su fondo real. Texto grande (≥ 24px, o ≥ 19px en
negrita) **≥ 3:1**. Es el mínimo de WCAG 2.1 AA y no es negociable: abajo de eso hay gente que
literalmente no lee tu página.

El error más común: el texto secundario en gris. Sobre una superficie con color, el secundario se
tiñe **desde ese mismo tono** (bajando luminosidad o saturación), nunca con un gris neutro — el
gris sobre color se ve sucio y suele no llegar al mínimo.

Medir en consola, sin instalar nada:

```js
// Contraste real entre dos colores computados. Pegalo en la consola del navegador.
const lum = c => { const [r,g,b] = c.match(/\d+/g).map(n => { n /= 255;
  return n <= .03928 ? n/12.92 : ((n+.055)/1.055) ** 2.4; });
  return .2126*r + .7152*g + .0722*b; };
const ratio = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((p,q) => q-p);
  return ((x + .05) / (y + .05)).toFixed(2); };
// ejemplo:
const el = document.querySelector('p');
ratio(getComputedStyle(el).color, getComputedStyle(el.parentElement).backgroundColor);
```

### Medida de línea
El cuerpo de texto entre **65 y 75 caracteres** por línea. Más largo y el ojo pierde el renglón al
volver; más corto y el texto se pica. En CSS: `max-width: 65ch` sobre el contenedor del párrafo, no
sobre la sección entera.

Excepción real: una columna angosta de UI (una card, un aside) puede bajar a ~45ch. Un párrafo de
landing a ancho completo de una pantalla de 1440px, no.

### Escala tipográfica
Los tamaños salen de una escala, no de valores sueltos. Elegí una razón (1.2 mayor tercera, 1.25,
1.333) y derivá todo de ahí. Si en tu CSS conviven `15px`, `16px` y `17px`, eso no es una escala:
es indecisión, y se ve.

- **Display**: hasta 6rem. Más grande que eso rara vez mejora nada y rompe en mobile.
- **Tracking**: en tamaños grandes va negativo (piso razonable −0.04em); en cuerpo, 0. Nunca
  positivo salvo en mayúsculas chicas.
- **Peso**: los escalones tienen que ser obvios. 400 y 500 juntos no se distinguen; 400 y 700 sí.
- Corré el **copy real** en cada breakpoint y arreglá lo que desborda. Un titular que en tu
  mockup entra en dos líneas y en producción entra en cuatro es un titular roto.

### Elegir la tipografía (no dejarla para el final)

La skill desaconseja **Inter, Roboto, Geist, Plus Jakarta Sans, Fraunces, Space Grotesk, Poppins,
Montserrat**: no porque sean malas, sino porque están en tantas páginas generadas con IA que ya no
dicen nada. El problema es que "elegí otra" sin una lista termina en la misma de siempre. Éstas
tienen carácter, son gratis y están en Google Fonts:

| Si el mundo es… | Display (títulos) | Texto | Dato / número |
|---|---|---|---|
| **Editorial, autoral, de marca** | Gloock · Instrument Serif · Playfair Display | Hanken Grotesk · Source Sans 3 | JetBrains Mono |
| **Técnico, instrumentos, HUD** | Chakra Petch · Rajdhani · Archivo | IBM Plex Sans · Archivo | IBM Plex Mono · JetBrains Mono |
| **Industrial, de peso, urgente** | Anton · Archivo Black · Oswald | Barlow · Archivo | Barlow Condensed (números) |
| **Retro 70/80/90** | Monoton · Bungee · Righteous | Work Sans · Barlow | VT323 · Share Tech Mono |
| **Institucional serio** | Libre Baskerville · Bitter | Public Sans · Source Sans 3 | Roboto Mono |

Tres reglas que valen más que la elección:

1. **Dos familias, no cuatro.** Una para display, una para texto. La mono es la tercera sólo si la
   página muestra datos de verdad (horas, precios, métricas, código).
2. **Un mono de verdad para todo lo que sea un dato.** Es lo que más rápido hace que una página
   parezca hecha por alguien que sabe: la hora, el importe, la métrica y el ID en monoespaciada.
3. **Cargala bien o no la elijas.** Peso variable si existe, `font-display: swap`, y **fallback
   declarado en la misma familia** (`font-family: 'Gloock', Georgia, serif`). Y verificá que
   cargó: si la CSP del proyecto tiene `font-src 'self'`, el `@import` de Google queda bloqueado
   en silencio y estás mirando la fuente del sistema sin saberlo. El auditor te lo dice.

### Espaciado
Grupos apretados, separación generosa. La regla que más ordena de un saque: **más aire arriba de un
título que abajo** — el espacio dice a qué bloque pertenece el título, y si es simétrico el lector
tiene que adivinar.

Los valores salen de una escala también (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64). Un `padding: 27px`
suelto no lo decidió nadie.

### Profundidad
Una sombra tiene **offset y blur**. `box-shadow: 0 8px 24px rgba(0,0,0,.12)` es profundidad;
`box-shadow: 0 0 20px rgba(80,200,255,.5)` es un halo de color, que no es profundidad sino
decoración — y sólo se gana cuando el objeto **es** luz (un filo de radar, un cabezal, un neón).

La sombra hard sin blur (`4px 4px 0`) sólo pertenece a un mundo que eligió el neobrutalismo a
propósito. En cualquier otro es un disfraz.

### Estados
Toda cosa que se toca tiene: **hover, focus visible por teclado, disabled, loading, error**. Toda
lista o tabla tiene su **estado vacío**. Un formulario sin estado de error y sin estado de "se está
enviando" es un formulario a medio hacer, por lindo que se vea quieto.

El focus de teclado es el que más se olvida: si lo sacaste con `outline: none`, poné otro visible
en su lugar. Navegar una landing con Tab tiene que ser posible.

### Movimiento
- **Un** momento autoral, no efectos desperdigados ni la misma entrada idéntica en cada sección.
- Salida exponencial (`cubic-bezier(.16,1,.3,1)` funciona casi siempre) desde un estado que **ya
  es visible** — nada de elementos que arrancan invisibles y dependen de JS para existir.
- La paleta de movimiento es más ancha que `transform` y `opacity`: `clip-path`, `mask`, `filter:
  blur`, `backdrop-filter` y la sombra también animan, y suelen ser más expresivos. Verificá que
  sigan a 60fps antes de quedártelos.

### Texto de interfaz
Los controles nombran su acción ("Ver el panel", no "Enviar"). Los errores nombran el problema **y
la salida** ("Ese mail ya está registrado — iniciá sesión", no "Error de validación"). El copy usa
las palabras del producto, no las genéricas del rubro.

### Cobertura
Todo lo que el brief pedía tiene que estar presente y **encontrarse en segundos**. Una sección que
existe pero está sepultada abajo de todo no cuenta como resuelta.

---

## Lo que NO se pone por defecto

No son prohibiciones: son los valores por defecto de la categoría. Si el argumento de la página los
pide, se ganan. Agarrar uno sin haberlo decidido significa que no estabas decidiendo.

**Estructura de página**
- Filas de cards iguales (ícono + título + párrafo) como **estructura** de la página. La card es el
  contenedor perezoso; las cards anidadas están siempre mal.
- La plantilla de métricas del hero: número grande, label chico, tres stats de apoyo, color de
  acento.
- Un kicker o eyebrow en mayúsculas arriba del título. El título se sostiene solo.
- Números de sección 01 / 02 / 03 cuando la secuencia no le aporta nada al lector.
- Un modal para una tarea que no necesita interrumpir ni proteger el foco.

**Hábitos de superficie**
- Texto con gradiente. El énfasis sale del peso o del tamaño.
- Vidrio y blur como decoración en vez de como efecto específico.
- `border-left` de color de más de 1px en cards, ítems de lista o alertas.
- Sparklines, anillos de progreso y rectángulos redondeados con sombra suave haciendo de contenido.
- Monoespaciada como disfraz de "técnico" en vez de para código, datos o medidas.
- Una fuente del sistema (Impact, Arial Black, la sans de la plataforma) como voz de display de una
  página con mundo propio. La fuente más parecida que ya estaba instalada es un fracaso, no un
  fallback.
- Emojis o glifos Unicode haciendo de sistema de íconos. Los íconos se dibujan: de una librería
  real o SVG propio, con un trazo y un peso consistentes.
- Claro u oscuro elegido por categoría ("las apps de finanzas son oscuras"). Se elige por la escena
  de uso: quién, dónde, con cuánta luz alrededor.

---

Con todo esto en verde, gastá la página en el mundo que elegiste. Y cuando dudes entre refinado y
comprometido, **comprometido**.
