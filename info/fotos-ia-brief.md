# Brief de imágenes IA — Pureza (provisionales)

**Regla del proyecto:** la IA solo genera *atmósfera* (plantas, bodegones, texturas,
manos sin rostro). Nunca resultados de peluquería, clientas, retratos de Virginia
ni el interior del salón — eso solo con fotografía real. Todas las imágenes IA son
marcadores: se sustituyen por la sesión de fotos real usando el mismo nombre de
archivo, sin tocar código.

## Dirección de arte común

Añadir este bloque al final de cada prompt:

> Editorial minimal photography, pure white background, soft natural daylight
> from the left, shallow depth of field, muted natural colors, Spanish Mancha
> countryside botanicals, no people's faces, no text, no logos, no watermarks.

Formato: generar en la mayor resolución posible; el destino final se recorta.
Nombres de archivo pensados para `public/images/` en el proyecto Angular.

## Las imágenes

| # | Archivo | Uso en la web | Ratio | Prompt (inglés) |
|---|---------|---------------|-------|-----------------|
| 1 | `atmosfera-romero.jpg` | Página Coloración vegetal | 4:3 | Fresh rosemary sprigs and dried botanical pigment powder in a small ceramic bowl on white linen, deep green tones |
| 2 | `atmosfera-espliego.jpg` | Página Mechas de autor | 4:3 | Spike lavender stems loosely arranged on a white marble surface, soft violet blooms, scattered petals |
| 3 | `atmosfera-esparto.jpg` | Página Rastas | 4:3 | Hand-braided esparto grass fibers coiled on white cotton fabric, golden ochre tones, artisanal texture close-up |
| 4 | `atmosfera-vid.jpg` | Página Extensiones | 4:3 | Autumn grapevine leaves in deep garnet red with a small cluster of dark grapes on white ceramic, moody natural still life |
| 5 | `atmosfera-olivo.jpg` | Página Rituales capilares | 4:3 | Olive branch with green olives and a small amber glass bottle of golden oil on white stone, Mediterranean light |
| 6 | `manos-pigmento.jpg` | Banda "El salón" / home | 3:2 | Close-up of hands mixing green botanical hair pigment paste in a copper bowl with a wooden brush, craft process, hands only, no face |
| 7 | `bodegon-botanico.jpg` | Cabecera de /precios o /diario | 3:2 | Unbranded amber glass cosmetic bottles with fresh rosemary and lavender sprigs on a white shelf, apothecary style |
| 8 | `textura-lino.jpg` | Fondos sutiles opcionales | 21:9 | Extreme close-up of natural white linen fabric texture with a single rosemary sprig casting a soft shadow |

## Qué NO generar nunca

- Melenas, coloraciones, mechas o cualquier "resultado" de peluquería.
- Personas reconocibles o rostros (tampoco "una peluquera trabajando" con cara).
- El interior del salón o su fachada.
- Nada con la marca Aveda visible (los frascos, siempre sin etiqueta).

## Integración

**Actualizado en la fase de diseño técnico (`foundation`, ago 2026):** el duotono
se descarta. Lavar toda la foto con el color de la planta compite con el trazo
de la lámina SVG, que es quien debe llevar el acento — y habría que rehacer el
tratamiento en cuanto llegue la sesión de fotos real. Las fotografías se sirven
sin tintar (`pz-picture`, AVIF/WebP/JPEG); el retrato de Virginia en el héroe es
la única excepción explícita con tratamiento propio, no una regla general.
Fuente: `openspec/changes/foundation/design.md`.

## El plan de verdad

La sesión de fotos profesional del salón sigue siendo bloqueante para el
lanzamiento: retrato de Virginia, interior, proceso de trabajo y resultados
reales. Estas imágenes IA solo evitan que la maqueta y la fase 1 esperen.
