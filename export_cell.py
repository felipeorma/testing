# ═══════════════════════════════════════════════════════════════════════════
#  CELDA EXPORT → JSON para Pitch Stories (la web animadora)
#  Pegá esto al final de tu sofascore_final.ipynb
# ═══════════════════════════════════════════════════════════════════════════
import json, pandas as pd

URL_PARTIDO = "https://www.sofascore.com/.../#id:XXXXXXX"   # ← tu link

def export_pitchstories(url, out="match.json"):
    md   = sofascore.get_match_data(url)
    shot = pd.DataFrame(sofascore.get_match_shotmap(url))
    ids  = pd.DataFrame(sofascore.get_player_ids(url))
    home, away = sofascore.get_team_names(url)

    # --- marcador (ajustá las llaves según tu get_match_data) ---
    def g(d,*ks,default=None):
        for k in ks:
            d = d.get(k,{}) if isinstance(d,dict) else {}
        return d or default
    home_score = g(md,"homeScore","current", default="")
    away_score = g(md,"awayScore","current", default="")

    # SofaScore shotmap: x,y son 0..100 (x=profundidad hacia arco rival, y=ancho)
    def shots_for(player_name):
        s = shot[shot["player"].apply(lambda p: isinstance(p,dict) and p.get("name")==player_name)] \
            if "player" in shot.columns else shot[shot.get("playerName","")==player_name]
        out=[]
        for _,r in s.iterrows():
            pc = r.get("playerCoordinates",{}) or {}
            gm = r.get("goalMouthCoordinates",{}) or {}
            st = r.get("shotType","")          # goal / save / miss / block / post
            out.append({
                "x": pc.get("x", r.get("x",80)),
                "y": pc.get("y", r.get("y",50)),
                "endX": gm.get("x", pc.get("x",100)),
                "endY": gm.get("y", pc.get("y",50)),
                "xg": float(r.get("xg", r.get("expectedGoals",0)) or 0),
                "minute": int(r.get("time", r.get("minute",0)) or 0),
                "type": "goal" if st=="goal" else ("saved" if st in("save","block") else "miss"),
                "bodyPart": (r.get("bodyPart","") or "").lower().replace("-foot","").replace("-"," ").split()[0] if r.get("bodyPart") else "right"
            })
        return out

    def players_for(team):
        team_ids = ids[ids.get("teamName","")==team] if "teamName" in ids.columns else ids
        plist=[]
        for _,p in team_ids.iterrows():
            nm = p.get("name") or p.get("playerName")
            if not nm: continue
            plist.append({
                "id": int(p.get("id",0) or 0),
                "name": nm,
                "number": int(p.get("shirtNumber", p.get("jerseyNumber",0)) or 0),
                "position": p.get("position","") or "",
                "shots":  shots_for(nm),
                "passes": [],   # llenar con get_player_match_events si trae pases
                "duels":  [],   # idem duelos
                "stats":  {"rating":float(p.get("rating",0) or 0),
                           "goals":0,"assists":0,"passAcc":0}
            })
        # solo jugadores con acciones (opcional): plist=[p for p in plist if p["shots"]]
        return plist

    data = {
        "match": {
            "home": home, "away": away,
            "homeScore": home_score, "awayScore": away_score,
            "tournament": "", "round": "", "date": ""
        },
        "players": {"home": players_for(home), "away": players_for(away)}
    }
    with open(out,"w",encoding="utf-8") as f:
        json.dump(data,f,ensure_ascii=False,indent=2)
    print(f"✅ {out} — {len(data['players']['home'])} local / {len(data['players']['away'])} visita")
    return data

# export_pitchstories(URL_PARTIDO)   # ← descomentá y corré
