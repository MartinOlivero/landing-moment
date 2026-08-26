# El grafo que se conecta — SVG + CSS (React o vanilla)

Nueve cosas sueltas y apagadas se ordenan en **un sistema con entrada y salida**. Las cajas viajan
a su lugar, los cables se dibujan solos y un barrido pasa una vez encendiéndolo todo.

En producción en el **caso 4** de la skill: el titular promete *"no te enseño a usar herramientas,
te enseño a pensar sistemas"* — así que arriba están las herramientas desparramadas, y al final
están cableadas. El efecto no es decoración: si lo sacás, la frase se queda sin prueba.

---

## Cuándo sirve

- La página promete **orden, integración o método**: "conectamos tus herramientas", "un sistema, no
  una app", "todo en un solo lugar", "de X aislado a Y integrado".
- Hay **piezas identificables** que el visitante ya conoce (WhatsApp, tu ERP, tu planilla) — el
  reconocimiento es la mitad del efecto.
- Podés nombrar **qué entra y qué sale**. Si no, el dibujo va a ser un diagrama bonito sin tesis.

No sirve para "somos innovadores" ni para conectar conceptos abstractos. Un grafo cuyos nodos son
*Eficiencia*, *Escalabilidad* y *Confianza* es el organigrama de una consultora, no una prueba.

---

## El mecanismo, en cinco piezas

### 1. El estado base es el FINAL, no el inicial

Esto es lo que hace que la página funcione sin JS, con `prefers-reduced-motion` y si el script
falla: el HTML entrega **el sistema ya armado**. El desorden es un estado al que el JS lo lleva
después, no el punto de partida.

```
quieto  →  suelto  →  cableando
(el sistema     (las piezas       (viajan a su lugar,
 armado:         desparramadas)    los cables se dibujan,
 el HTML)                          pasa el barrido)
```

```jsx
const [fase, setFase] = useState("quieto");

useEffect(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;  // se queda en "quieto"
  const t1 = setTimeout(() => setFase("suelto"), 260);
  const t2 = setTimeout(() => setFase("cableando"), 260 + 900);
  return () => { clearTimeout(t1); clearTimeout(t2); };
}, []);
```

Sin React es lo mismo con dos `setTimeout` y `classList.add`.

### 2. Las coordenadas son datos, no dibujo

Cada nodo lleva su lugar **en el sistema** (`x`, `y`) y su lugar **suelto** (`dx`, `dy`, `rot`).
Valores fijos escritos a mano: nunca `Math.random()`. Un desorden al azar se lee como ruido de
fondo; el mismo desorden en cada visita se lee como un plano.

```js
// x,y = centro de la caja dentro del viewBox. dx,dy,rot = de dónde viene.
// esp = su lugar en el escalonado (0 a 1): las de arriba primero.
const NODOS = [
  { id: 'wa',  x:  85, y:  45, w: 150, h: 40, t: 'WhatsApp', dx:  245, dy: 275, rot: -11, esp: .10 },
  { id: 'hub', x: 260, y: 155, w: 200, h: 52, t: 'n8n', sub: 'ORQUESTADOR',
                                              dx: 140, dy: 240, rot:  -4, esp: .42, hub: true },
  // …
];
```

El `esp` (escalonado) es lo que convierte nueve animaciones simultáneas en **una sola cosa que
avanza**: cada nodo entra un poco después que el anterior, siguiendo el recorrido del barrido.

```css
.nodo { transition: transform .9s cubic-bezier(.16,1,.3,1) calc(var(--esp) * .5s); }
.suelto .nodo { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); }
/* en "cableando" no hace falta regla: vuelve al transform por defecto, o sea a su lugar */
```

### 3. Los cables salen de las coordenadas, no del ojo

Cada curva arranca en el borde de una caja y termina en el borde de otra, calculada contra los
mismos números de arriba. Por eso el dibujo **dice algo**: entra por tres lados, pasa por un solo
orquestador, sale por tres.

```js
const CABLES = [
  { d: 'M85 65 C 85 105, 190 96, 200 129', esp: 1.10 },   // WhatsApp → hub
  { d: 'M260 65 V 129',                    esp: 1.16 },   // Formulario → hub (recto)
  // …
];
```

Regla corta: si movés una caja y el cable sigue apuntando al lugar viejo, el dibujo dejó de ser un
plano y pasó a ser una ilustración.

### 4. El cable se dibuja preguntándole su largo al navegador

El truco clásico de `stroke-dasharray` necesita el largo exacto del trazo. **Medilo, no lo
estimes**: así, el día que muevas una caja, el trazo sigue saliendo perfecto.

```jsx
useEffect(() => {
  cables.current.forEach(p => {
    if (p) p.style.setProperty('--largo', `${Math.ceil(p.getTotalLength())}`);
  });
}, []);
```

```css
.cable {
  stroke-dasharray: var(--largo, 0);
  stroke-dashoffset: 0;                                   /* dibujado = estado base */
  transition: stroke-dashoffset .8s ease calc(var(--esp) * .35s), opacity .4s;
}
.suelto .cable { stroke-dashoffset: var(--largo, 0); opacity: 0; }   /* sin dibujar */
```

Ojo con el orden: la transición va en `.cable`, no en `.suelto .cable`. Si la ponés en el estado
suelto, el trazo **se borra** con animación al ir al desorden y **aparece de golpe** al volver, que
es exactamente al revés de lo que querés.

### 5. El barrido enciende, y hay forma de volver a verlo

El mismo filo de luz del hero (`references/sweep-vanilla.md`) cruza la pantalla una vez, sincronizado
con el escalonado. Y un botón discreto — *"↻ verlo de nuevo"* — devuelve el control sin poner la
animación en loop:

```jsx
const reproducir = useCallback(() => {
  relojes.current.forEach(clearTimeout);
  relojes.current = [];
  setFase("suelto");
  relojes.current.push(setTimeout(() => setFase("cableando"), 900));
}, []);
```

Ese botón vale más de lo que parece: la mitad de la gente llega a la sección mirando otra cosa y se
pierde el momento. Sin botón, se lo perdió para siempre.

---

## El cuerpo importa tanto como el grafo

En producción el sistema vive **dentro de un monitor** dibujado con CSS — el mismo monitor que
aparece en las portadas de los módulos del producto. El grafo suelto en la página sería un
diagrama; adentro de un objeto del mundo del producto, es una pantalla que se está encendiendo.

Si el producto tiene un mundo visual, el momento necesita un cuerpo de ese mundo (ver la sección
correspondiente en `SKILL.md`).

---

## Verificación específica

Además del piso mecánico general (`audit.mjs`), en este mecanismo mirá:

- **Sin JS**: tiene que verse el sistema **cableado**, no las piezas sueltas.
- **Reduced motion**: idem — se queda en `quieto` y no pasa nada más.
- **Mobile**: el viewBox escala solo, pero el texto adentro del SVG no puede quedar en 9px.
  Subí `font-size` en el breakpoint chico, no reduzcas el viewBox.
- **El `aria-label` del SVG cuenta el sistema entero en una frase**: quien usa lector de pantalla
  tiene que recibir el argumento, no "gráfico".
- Que los cables **no crucen cajas**. Si cruzan, movés la caja, no el cable.
