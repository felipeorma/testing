import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { CYBER, RESULT_COLORS, Shot, makePitchGeometry, PitchBox } from "./data";

// marcador por parte del cuerpo (forma del punto)
const bodyShape = (body: string) => {
  if (body === "head") return "circle";
  if (body === "left foot") return "triangle";
  return "diamond"; // right foot
};

const ShotMarker: React.FC<{
  cx: number;
  cy: number;
  color: string;
  body: string;
  r: number;
  jersey: string;
}> = ({ cx, cy, color, body, r, jersey }) => {
  const shape = bodyShape(body);
  let node: React.ReactNode;
  if (shape === "circle") {
    node = <circle cx={cx} cy={cy} r={r} fill={color} stroke={CYBER.white} strokeWidth={2} />;
  } else if (shape === "triangle") {
    const p = `${cx},${cy - r * 1.2} ${cx - r * 1.1},${cy + r} ${cx + r * 1.1},${cy + r}`;
    node = <polygon points={p} fill={color} stroke={CYBER.white} strokeWidth={2} />;
  } else {
    const p = `${cx},${cy - r * 1.3} ${cx + r * 1.3},${cy} ${cx},${cy + r * 1.3} ${cx - r * 1.3},${cy}`;
    node = <polygon points={p} fill={color} stroke={CYBER.white} strokeWidth={2} />;
  }
  return (
    <g>
      {/* halo glow */}
      <circle cx={cx} cy={cy} r={r * 2.1} fill={color} opacity={0.14} />
      {node}
      {jersey ? (
        <text
          x={cx}
          y={cy}
          fontSize={r * 1.1}
          fontWeight={800}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#0a0a0a"
          stroke={CYBER.white}
          strokeWidth={0.6}
          fontFamily="Barlow Condensed, sans-serif"
        >
          {jersey}
        </text>
      ) : null}
    </g>
  );
};

// Un disparo individual: aparece, el balón viaja del origen al destino con easing,
// deja trail, y al final queda el marcador. Si es gol, dispara el burst.
const AnimatedShot: React.FC<{
  shot: Shot;
  startFrame: number;
  durFrames: number;
  geo: ReturnType<typeof makePitchGeometry>;
}> = ({ shot, startFrame, durFrames, geo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;

  const color = RESULT_COLORS[shot.result] ?? CYBER.cyan;
  const sx = geo.wx(shot.width);
  const sy = geo.wy(shot.depth);
  const ex = geo.wx(shot.endWidth);
  const ey = geo.wy(shot.endDepth);

  // progreso del balón con easing suave (ease-in-out cúbico)
  const travel = durFrames * 0.6;
  const t = interpolate(local, [0, travel], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.25, 1),
  });
  const bx = sx + (ex - sx) * t;
  const by = sy + (ey - sy) * t;

  // marcador final aparece con spring (rebote sutil) tras llegar el balón
  const markerProgress = spring({
    frame: local - travel,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.6 },
  });
  const markerR = 12 * markerProgress;

  // burst de gol
  const isGoal = shot.result === "goal";
  const burstStart = travel;
  const burstT = interpolate(local, [burstStart, burstStart + fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const trailOpacity = interpolate(t, [0, 0.1, 1], [0, 0.9, 0.5]);

  return (
    <g>
      {/* trail con gradiente de ancho */}
      <line
        x1={sx}
        y1={sy}
        x2={bx}
        y2={by}
        stroke={color}
        strokeWidth={interpolate(t, [0, 1], [1, 4])}
        strokeLinecap="round"
        opacity={trailOpacity}
        filter="url(#shotGlow)"
      />
      {/* punto de origen */}
      <circle cx={sx} cy={sy} r={4} fill={color} opacity={0.8} />

      {/* balón viajando (oculto al llegar) */}
      {t < 1 && (
        <g>
          <circle cx={bx} cy={by} r={9} fill={CYBER.white} stroke={color} strokeWidth={2} />
          <circle cx={bx} cy={by} r={14} fill={color} opacity={0.25} />
        </g>
      )}

      {/* marcador final persistente */}
      {markerProgress > 0.01 && (
        <ShotMarker
          cx={ex}
          cy={ey}
          color={color}
          body={shot.body}
          r={markerR}
          jersey={shot.jersey}
        />
      )}

      {/* GOL: anillo expansivo */}
      {isGoal && burstT > 0 && burstT < 1 && (
        <circle
          cx={ex}
          cy={ey}
          r={10 + burstT * 90}
          fill="none"
          stroke={CYBER.red}
          strokeWidth={interpolate(burstT, [0, 1], [6, 0.5])}
          opacity={1 - burstT}
        />
      )}
    </g>
  );
};

export const ShotMap: React.FC<{
  shots: Shot[];
  box: PitchBox;
  startFrame: number;
  perShotFrames: number;
}> = ({ shots, box, startFrame, perShotFrames }) => {
  const geo = makePitchGeometry(box);
  return (
    <g>
      <defs>
        <filter id="shotGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {shots.map((s, i) => (
        <AnimatedShot
          key={i}
          shot={s}
          startFrame={startFrame + i * perShotFrames}
          durFrames={perShotFrames}
          geo={geo}
        />
      ))}
    </g>
  );
};
