# El barrido — HTML/CSS/JS sin build

Una línea de luz cruza la pantalla **una vez** y, al pasar por encima de algo, lo transforma.
En producción en el **caso 1** de la skill: los nombres crudos que devuelven las APIs quedan
traducidos al castellano, y al llegar abajo la misma luz enciende los tres contadores.

---

## Cuándo sirve

- La página es HTML plano o cualquier stack sin React.
- Hay una **transformación** que contar: de crudo a claro, de desordenado a ordenado, de apagado
  a encendido.
- Querés unificar secciones distintas con un mismo gesto.

## El mecanismo, en tres piezas

### 1. La línea

Va **por encima de todo**, con `mix-blend-mode: screen`, para que se lea como luz cruzando la
escena y no como una capa más del fondo. El filo brillante va **abajo** del gradiente, que es
donde el ojo espera el borde de un barrido.

```css
#barrido {
  position: absolute; left: 0; right: 0; top: 0; height: 150px;
  z-index: 3; pointer-events: none; opacity: 0; mix-blend-mode: screen;
  background: linear-gradient(180deg, transparent 0%, rgba(34,211,238,.05) 62%,
                              rgba(34,211,238,.22) 92%, rgba(34,211,238,.85) 100%);
}
#barrido::after {                      /* el filo */
  content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--hud) 18%, #fff 50%, var(--hud) 82%, transparent);
  box-shadow: 0 0 18px 2px rgba(34,211,238,.6);
}
```

### 2. El cruce, con regla de tres

La animación va **`linear` a propósito**. Con easing habría que integrar la curva para saber
cuándo la luz toca cada elemento; con velocidad constante, la posición se despeja de la duración
y cada cambio se programa con un `setTimeout`. Un radar barre parejo, además.

```js
const ESPERA = 1100;   // deja leer el título antes de que pase nada
const DURA   = 2600;   // lo que tarda la luz en cruzar

setTimeout(() => {
  linea.animate(
    [{ transform: 'translateY(-150px)', opacity: 0 },
     { opacity: 1, offset: .06 }, { opacity: 1, offset: .88 },
     { transform: `translateY(${alto}px)`, opacity: 0 }],
    { duration: DURA, easing: 'linear', fill: 'forwards' });

  elementos.forEach((el, i) => {
    setTimeout(() => transformar(el), (posicionY[i] / 100) * DURA);
  });
}, ESPERA);
```

### 3. Enganchar lo que ya existía

Éste es el paso que convierte "dos efectos" en "un momento": lo que antes se disparaba solo
(contadores por IntersectionObserver, entradas por scroll) pasa a dispararlo **la luz**.

El observer sigue existiendo como red de seguridad para cuando el barrido no corre (mobile,
`reduced-motion`). Marcá los elementos reservados y que el observer los saltee:

```js
cifras.forEach(el => el.dataset.espera = '1');            // los reserva el barrido
// en el observer:  if (!e.isIntersecting || e.target.dataset.espera) continue;
// al cruzar:       cifras.forEach(el => { delete el.dataset.espera; contar(el); });
```

Ojo con el orden: el flag tiene que ponerse **sólo** si el barrido realmente va a correr. Si la
función que lo dibuja sale temprano (pantalla chica, `reduced-motion`), no marques nada o los
números se quedan en cero.

## El mismo gesto, más abajo

Para revelar imágenes con el mismo lenguaje, animá `clip-path` en la imagen y poné el filo pegado
al borde del recorte. Con **keyframes, no transiciones**: dos transiciones peleando por `opacity`
dejan el filo prendido en el borde de abajo, como un subrayado que nadie pidió.

```css
.js .revela .pantalla img { clip-path: inset(0 0 100% 0); }
.js .revela.visible .pantalla img { clip-path: inset(0 0 0 0); transition: clip-path 1s cubic-bezier(.16,1,.3,1) .1s; }

.pantalla::after {                     /* el filo, pegado al borde del clip */
  content: ''; position: absolute; inset: 0; z-index: 2; pointer-events: none;
  opacity: 0; mix-blend-mode: screen; clip-path: inset(0 0 100% 0);
  background: linear-gradient(180deg, rgba(34,211,238,0) 0%, rgba(34,211,238,.07) 86%,
                              rgba(34,211,238,.5) 99.3%, #9df6ff 100%);
}
.js .revela.visible .pantalla::after { animation: escanear 1.35s cubic-bezier(.16,1,.3,1) .1s both; }
@keyframes escanear {
  0%   { opacity: 0; clip-path: inset(0 0 100% 0); }
  8%   { opacity: 1; }
  74%  { opacity: 1; clip-path: inset(0 0 0 0); }
  100% { opacity: 0; clip-path: inset(0 0 0 0); }
}
```

El ancestro necesita `position: relative` o el `::after` se ancla en el lugar equivocado.

## Antes de darlo por hecho

- `@media (min-width: 1180px)`: abajo de eso no hay márgenes libres y el texto flotante ensucia
  el título. Apagalo, no lo encojas.
- `prefers-reduced-motion`: sin línea, todo ya transformado.
- Sin JS: el prefijo `.js` en el selector es lo que garantiza que la página se vea entera.
- Si el bloque está oculto por CSS, salí antes de crear nodos y timers:
  `if (getComputedStyle(caja).display === 'none') return;`
