# ⚽ Pitch Stories

Plataforma web para crear **reels de Instagram** tipo *storytelling* de un futbolista, a partir de datos de **SofaScore**: shotmap animado, pases, duelos, narración por voz IA en español y sonido de gol. Salida en formato vertical 9:16 grabable a video.

## Cómo funciona (flujo)

```
SofaScore  →  notebook Python (scraping)  →  match.json  →  esta web (anima + narra + graba)
```

El navegador **no puede** scrapear SofaScore directamente (CORS + Cloudflare). Por eso el scraping vive en tu notebook y la web solo consume el JSON.

## Uso

1. En tu `sofascore_final.ipynb`, pegá la celda de `export_cell.py`, poné el link del partido y corréla → genera `match.json`.
2. Abrí la web → **subir JSON del notebook** → elegí **equipo** (local/visita) → elegí **jugador**.
3. **▶ Generar reel** para previsualizar. **● Grabar** para exportar el video, **↓ Descargar**.
4. Activá/desactivá capas (shotmap, pases, duelos, voz, gol) y ajustá el ritmo.

## Deploy en GitHub Pages

```bash
git init
git add index.html export_cell.py README.md
git commit -m "Pitch Stories"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/pitch-stories.git
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: Deploy from a branch → main / root → Save**.
Queda en `https://TU_USUARIO.github.io/pitch-stories/`.

## Notas

- **Voz**: usa la Web Speech API del navegador (español). Funciona mejor en Chrome/Edge.
- **Grabación**: `MediaRecorder` exporta `.mp4` donde el navegador lo soporta, si no `.webm` (convertible con HandBrake/ffmpeg).
- El formato del JSON está documentado en `export_cell.py`. Los campos `passes`/`duels` quedan listos para llenar desde `get_player_match_events`.
