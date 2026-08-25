# Librerías de componentes: cuál usar y para qué

**Respuesta corta: ninguna, para el momento de la página.** Los momentos de los cuatro casos de la
skill son código propio de entre 60 y 250 líneas, sin una sola dependencia nueva. El más elaborado
—la cinta de audio— vive en un proyecto cuyo `package.json` tiene tres dependencias: React,
React-DOM y el widget de agenda. Cero librerías de animación.

Eso no es ideología, es lo que pasó: cuando el efecto tiene que decir algo específico de *esta*
página, ninguna librería lo tiene, porque las librerías son genéricas por definición. Un fondo
"Aurora" puesto porque quedaba lindo es exactamente lo que hace que una página se lea como
plantilla.

**Dónde sí sirven**: en el andamiaje de alrededor. Botones, formularios, tablas, diálogos,
acordeones, tabs, toasts. Ahí no hay nada que expresar y reinventarlos es perder el día.

---

## La tabla (verificada el 19/08/2026 — revisá antes de confiar)

| Librería | ⭐ | Licencia | Para qué |
|---|---|---|---|
| **shadcn/ui** | 121k | MIT | La base. Botones, forms, tablas, dialogs. Es el estándar del que casi todas las demás son compatibles |
| **Magic UI** | 22k | MIT | Efectos de landing: marquees, beams, números animados. Compatible con shadcn |
| cult-ui | 6k | MIT | Correcta pero más chica y con menos mantenimiento que Magic UI. Sólo si tiene algo puntual que las otras no |
| motion-primitives | 6k | MIT | Prolija, pero venía parada hacía 5 meses |
| **react-bits** | 46k | **MIT + Commons Clause** | 54 fondos WebGL. Ver la advertencia abajo |
| origin-ui / coss | 10k | **AGPL-3.0** | **Evitar** en cualquier cosa que se venda: la AGPL es contagiosa |

Todas son React. Ninguna sirve tal cual en una página HTML plana.

## La trampa de react-bits

Su licencia **no es MIT a secas**. Dice, textual, que podés usarla con fines comerciales *"siempre
que no vendas, sublicencies ni redistribuyas los componentes en sí — solos, en un paquete, o como
una versión porteada"*.

Traducido:

- ✅ Usarla en **tu propia landing** — es un producto, está permitido.
- ❌ Meterla dentro de **lo que le entregás a un cliente** o de un template que vendés. Ahí estarías
  redistribuyendo el componente dentro de un bundle.
- ❌ Portarla a vanilla para esquivar lo anterior: la licencia nombra explícitamente las versiones
  porteadas.

Los fondos son shaders GLSL sobre `ogl` (MIT, 20 KB). Si hace falta un shader en una página sin
React, el camino limpio es escribir el shader propio con `ogl`, no portar el de ellos.

---

## Instalación (por proyecto, nunca global)

No tiene sentido "instalar" estas librerías de antemano: son copy-paste, se agregan al proyecto que
las necesita.

```bash
npx shadcn@latest init          # una vez por proyecto
npx shadcn@latest add button dialog
npx shadcn@latest add "https://magicui.design/r/<componente>.json"
```

Después de agregar cualquier componente de librería, **revisalo**: vienen con `border-left` de
colores, gradientes en el texto y glows por defecto. Eso es justo lo que esta skill pide sacar.

---

## Librerías vs. criterio

Una librería de componentes no es lo mismo que una skill de diseño. La analogía: la skill es el
arquitecto que decide dónde va la ventana; la librería es la ventana ya fabricada. Comprar ventanas
no reemplaza al arquitecto — y es justamente por eso que las webs armadas 100% con componentes de
librería se parecen todas entre sí.

El orden es: **el momento** (esta skill) decide qué se construye → **el piso mecánico**
(`craft-floor.md`) sostiene la calidad → shadcn/Magic UI resuelven lo aburrido.
