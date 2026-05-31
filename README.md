# ⚽ Pitch Stories — Reel (Remotion)

Reels de fútbol estilo *storytelling* con **shotmap animado fluido**, a partir de datos de **SofaScore**. Cancha vertical opta + paleta CYBER (idénticas a tu notebook), animación con `spring()` y easing, "¡GOOOL!" con sonido. Salida `.mp4` 1080×1920, 30 s.

## Flujo

```
Tu notebook (scraping)  →  match.json  →  Remotion (React anima)  →  out/reel.mp4
```

## Requisitos (una vez)

- **Node.js 18+** → https://nodejs.org (instalá la versión LTS)
- En la primera ejecución, Remotion descarga Chrome Headless solo (necesita internet).

## Instalación

```bash
cd remotion-reel
npm install
```

## Generar un reel

**1. Exportá el JSON desde tu notebook.** Pegá `notebook_export_cell.py` como última celda de `sofascore_final.ipynb`, corré todo en orden y ejecutá:

```python
exportar_para_remotion(
    MATCH_URL,
    "Visita",                 # "Local" o "Visita"
    "Javier Correa",          # jugador exacto SofaScore
    metricas=["remates","xg","duelos","rating"]   # qué narrar en 30 s
)
```

Genera `match.json`. Copialo a `remotion-reel/public/match.json`.

**2. Previsualizá (estudio interactivo, recomendado):**

```bash
npm run dev
```

Abre Remotion Studio en el navegador. Ahí ves la animación en vivo, podés editar `match.json` y los props en tiempo real.

**3. Renderizá el mp4:**

```bash
npm run render:player
```

Sale en `out/reel.mp4`, listo para Instagram.

## Cómo elegís equipo / jugador / métricas

Todo vive en `match.json` (lo genera el notebook). El campo `metrics` controla qué se muestra/narra:

| valor | muestra |
|---|---|
| `remates` | goles + total de remates |
| `xg` | suma de goles esperados |
| `pases` | pases clave |
| `duelos` | duelos/defensivo ganados |
| `rating` | rating gigante en el cierre |

## Estructura del reel (30 s)

| Tramo | Tiempo | Contenido |
|---|---|---|
| Intro | 0–4 s | Nombre, dorsal, posición, marcador |
| Shotmap | 4–20 s | Cada remate con trayectoria + balón + gol |
| Métricas | 20.5–27 s | Las que elegiste, con números que cuentan |
| Cierre | 27–30 s | Rating SofaScore en grande |

## Archivos

- `src/data.ts` — schema del JSON + paleta + geometría opta (replica tu `to_100`, `_depth`, `_width`)
- `src/Pitch.tsx` — cancha vertical media (opta)
- `src/ShotMap.tsx` — animación de remates (spring + easing + trail + gol)
- `src/Overlays.tsx` — "¡GOOOL!" + contadores
- `src/Reel.tsx` — composición y timing de 30 s
- `src/Root.tsx` — registro + datos demo
- `public/gol.mp3` — sonido de gol
- `public/match.json` — tus datos (lo reemplazás)
- `notebook_export_cell.py` — celda para tu notebook

## Notas

- Si querés cambiar duración: `durationInFrames` en `src/Root.tsx` (frames = segundos × 30).
- Para mover la cancha: `PITCH_BOX` en `src/Reel.tsx`.
- Voz: la dejamos fuera por ahora. Cuando quieras, se agrega un `<Audio>` con el mp3 de gTTS/ElevenLabs sincronizado por escena.
- `preview_shotmap.png` es solo una muestra estática de la geometría; el render real es animado y con mejor tipografía.
