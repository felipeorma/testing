# ═══════════════════════════════════════════════════════════════════════════
#  CELL 7 — EXPORTAR match.json para Remotion (Pitch Stories Reel)
#  Pegá al final de sofascore_final.ipynb. Reusa CELLS 1-4.
#
#  USO:  exportar_para_remotion(MATCH_URL, "Visita", "Javier Correa",
#                               metricas=["remates","xg","rating"])
#  → escribe match.json (copialo a remotion-reel/public/)
# ═══════════════════════════════════════════════════════════════════════════
import json

def exportar_para_remotion(url, equipo, jugador, metricas=None,
                           out="match.json"):
    """
    equipo: "Local" o "Visita"
    jugador: nombre exacto SofaScore
    metricas: subconjunto de ["remates","xg","pases","duelos","rating"]
    """
    if metricas is None:
        metricas = ["remates", "xg", "rating"]

    info = fetch_match_info(url)
    sm   = fetch_shotmap_for_vertical_half(url)

    # remates del jugador en ese equipo, ya con las coords transformadas (_depth/_width)
    pl = sm[(sm["_team"] == equipo) & (sm["_player"] == jugador)].copy()

    def body_en(b):
        return {"head": "head", "left foot": "left foot", "right foot": "right foot"}.get(b, "right foot")

    shots = []
    for _, r in pl.iterrows():
        shots.append({
            "depth":    round(float(r["_depth"]), 2),
            "width":    round(float(r["_width"]), 2),
            "endDepth": round(float(r.get("_end_depth", 100)), 2),
            "endWidth": round(float(r.get("_end_width", 50)), 2),
            "result":   r["_result"],
            "body":     body_en(r.get("_body", "right foot")),
            "minute":   int(r["_minute"]) if pd.notna(r["_minute"]) else None,
            "jersey":   str(r.get("_jersey", "")).strip(),
            "xg":       round(float(r["xg"]), 3) if "xg" in pl.columns and pd.notna(r.get("xg")) else 0.0,
        })

    # stats del jugador desde sus eventos
    goals = sum(1 for s in shots if s["result"] == "goal")
    key_passes = duels_won = assists = 0
    pass_acc = 0.0
    try:
        ev = fetch_player_events_clean(url, jugador)
        if not ev.empty:
            passes = ev[ev["_action"] == "pass"]
            if len(passes):
                pass_acc = round(100 * passes["_outcome"].mean(), 1)
            key_passes = int((passes["_outcome"] & passes.get("_assist", False)).sum()) if "_assist" in ev.columns else 0
            assists = int(ev["_assist"].sum()) if "_assist" in ev.columns else 0
            dz = ev[ev["_action"].isin(["tackle", "dribble", "ball-recovery", "interception"])]
            duels_won = int(dz["_outcome"].sum()) if not dz.empty else 0
    except Exception as e:
        print(f"[eventos no disponibles] {e}")

    rating = 0.0  # si tu lineup trae rating por jugador, asignalo acá

    data = {
        "match": {
            "home":      info["home"],
            "away":      info["away"],
            "homeScore": info["home_score"],
            "awayScore": info["away_score"],
            "tournament": info.get("tournament", ""),
            "round":     str(info.get("round", "")),
        },
        "player": {
            "name":      jugador,
            "number":    int(shots[0]["jersey"]) if shots and shots[0]["jersey"].isdigit() else 0,
            "position":  "",
            "teamLabel": equipo,
            "shots":     shots,
            "stats": {
                "rating":    rating,
                "goals":     goals,
                "assists":   assists,
                "keyPasses": key_passes,
                "duelsWon":  duels_won,
                "passAcc":   pass_acc,
            },
        },
        "metrics": metricas,
    }

    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ {out} — {len(shots)} remates, {goals} goles. Copialo a remotion-reel/public/")
    return data

print("OK — exportar_para_remotion() lista")
# exportar_para_remotion(MATCH_URL, "Visita", "Javier Correa", ["remates","xg","duelos","rating"])
