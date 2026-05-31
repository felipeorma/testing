import { z } from "zod";

// ── PALETA CYBER (idéntica al notebook) ──────────────────────────────
export const CYBER = {
  bg: "#06080d",
  pitch: "#06080d",
  line: "#f4f7ff",
  text: "#f7fbff",
  cyan: "#00e5ff",
  green: "#72ff7e",
  yellow: "#ffe66d",
  gold: "#ffd700",
  orange: "#ff9f1c",
  pink: "#ff4da6",
  red: "#ff2b2b",
  purple: "#c77dff",
  silver: "#b7c0cc",
  white: "#f8fbff",
} as const;

// Colores por resultado de remate (igual que RESULT_COLORS del notebook)
export const RESULT_COLORS: Record<string, string> = {
  goal: CYBER.green,
  saved: CYBER.red,
  blocked: CYBER.yellow,
  missed: CYBER.pink,
  post: CYBER.purple,
  owngoal: CYBER.orange,
  unknown: CYBER.cyan,
};

export const RESULT_LABELS_ES: Record<string, string> = {
  goal: "Gol",
  saved: "Atajado",
  blocked: "Bloqueado",
  missed: "Desviado",
  post: "Palo",
  owngoal: "Gol en contra",
  unknown: "Otro",
};

export const BODY_LABELS_ES: Record<string, string> = {
  head: "Cabeza",
  "left foot": "Pie izquierdo",
  "right foot": "Pie derecho",
};

// ── SCHEMA del JSON que exporta el notebook ──────────────────────────
const shotSchema = z.object({
  // coords opta 0..100 ya transformadas en el notebook:
  // depth = avance hacia el arco, width = ancho
  depth: z.number(),
  width: z.number(),
  endDepth: z.number().default(100),
  endWidth: z.number().default(50),
  result: z.enum(["goal", "saved", "blocked", "missed", "post", "owngoal", "unknown"]),
  body: z.enum(["head", "left foot", "right foot"]).default("right foot"),
  minute: z.number().nullable().default(null),
  jersey: z.string().default(""),
  xg: z.number().default(0),
});

export const playerSchema = z.object({
  name: z.string(),
  number: z.number().default(0),
  position: z.string().default(""),
  teamLabel: z.enum(["Local", "Visita"]),
  shots: z.array(shotSchema).default([]),
  stats: z
    .object({
      rating: z.number().default(0),
      goals: z.number().default(0),
      assists: z.number().default(0),
      keyPasses: z.number().default(0),
      duelsWon: z.number().default(0),
      passAcc: z.number().default(0),
    })
    .default({}),
});

export const reelSchema = z.object({
  match: z.object({
    home: z.string(),
    away: z.string(),
    homeScore: z.union([z.number(), z.string()]),
    awayScore: z.union([z.number(), z.string()]),
    tournament: z.string().default(""),
    round: z.union([z.number(), z.string()]).default(""),
  }),
  player: playerSchema,
  // qué métricas narrar/mostrar (vos las elegís en match.json)
  metrics: z.array(z.enum(["remates", "xg", "pases", "duelos", "rating"]))
    .default(["remates", "xg", "rating"]),
});

export type ReelProps = z.infer<typeof reelSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type Player = z.infer<typeof playerSchema>;

// ── GEOMETRÍA DE LA CANCHA (opta, vertical, medio campo) ─────────────
// Replica VerticalPitch(pitch_type="opta", half=True) del notebook.
// opta: x 0..100 a lo ancho, y 0..100 a lo largo. half = solo mitad de ataque.
// En el notebook: _depth = avance (eje vertical en pantalla, abajo→arriba)
//                 _width = ancho  (eje horizontal)
// Mapeamos depth 50..100 (medio campo de ataque) al alto del lienzo.
export interface PitchBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function makePitchGeometry(box: PitchBox) {
  // depth 50..100 → y (abajo a arriba). width 0..100 → x (izq a der)
  const depthMin = 50;
  const depthMax = 100;
  const wx = (width: number) => box.x + (width / 100) * box.w;
  const wy = (depth: number) =>
    box.y + box.h - ((depth - depthMin) / (depthMax - depthMin)) * box.h;
  return { wx, wy, box };
}
