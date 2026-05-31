import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { ReelProps, CYBER, RESULT_LABELS_ES, RESULT_COLORS, PitchBox } from "./data";
import { Pitch } from "./Pitch";
import { ShotMap } from "./ShotMap";
import { GoolOverlay, CountUp } from "./Overlays";

const { fontFamily: anton } = loadAnton();
const { fontFamily: barlow } = loadBarlow();
const { fontFamily: archivo } = loadArchivo();

// Caja de la cancha en coords del lienzo 1080x1920
const PITCH_BOX: PitchBox = { x: 90, y: 560, w: 900, h: 1150 };

// Fondo con atmósfera (gradientes + grano)
const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1000px 700px at 80% -5%, #12202a 0%, transparent 60%),
                   radial-gradient(800px 600px at -5% 105%, #0d1a16 0%, transparent 55%),
                   ${CYBER.bg}`,
    }}
  />
);

const Header: React.FC<{ data: ReelProps }> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = data.match;
  const p = data.player;
  const teamName = p.teamLabel === "Local" ? m.home : m.away;

  const slideIn = (delay: number) =>
    interpolate(frame, [delay, delay + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "60px 70px 0" }}>
      <div style={{ opacity: slideIn(2), transform: `translateY(${(1 - slideIn(2)) * -20}px)` }}>
        <div style={{ fontFamily: barlow, fontSize: 28, letterSpacing: 6, color: CYBER.silver, textTransform: "uppercase" }}>
          {m.tournament} {m.round ? `· Fecha ${m.round}` : ""}
        </div>
        <div style={{ fontFamily: archivo, fontWeight: 800, fontSize: 44, color: CYBER.white, marginTop: 6 }}>
          {m.home} <span style={{ color: CYBER.cyan }}>{m.homeScore}-{m.awayScore}</span> {m.away}
        </div>
      </div>

      <div
        style={{
          marginTop: 34,
          opacity: slideIn(10),
          transform: `translateX(${(1 - slideIn(10)) * -30}px)`,
          display: "flex",
          alignItems: "baseline",
          gap: 20,
        }}
      >
        <span style={{ fontFamily: anton, fontSize: 120, color: CYBER.cyan, lineHeight: 0.9, textShadow: `0 0 30px ${CYBER.cyan}88` }}>
          {p.number ? `#${p.number}` : ""}
        </span>
        <div>
          <div style={{ fontFamily: anton, fontSize: 64, color: CYBER.white, lineHeight: 0.95, textTransform: "uppercase" }}>
            {p.name}
          </div>
          <div style={{ fontFamily: barlow, fontSize: 32, color: CYBER.silver, letterSpacing: 2 }}>
            {p.position} · {teamName}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tarjeta de métrica que sube desde abajo
const StatStrip: React.FC<{ data: ReelProps; startFrame: number }> = ({ data, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = data.player;
  const s = p.stats;
  const local = frame - startFrame;

  const rise = spring({ frame: local, fps, config: { damping: 14, stiffness: 90 } });
  if (local < 0) return null;

  const items: { label: string; value: number; dec?: number; show: boolean }[] = [
    { label: "Goles", value: s.goals, show: data.metrics.includes("remates") },
    { label: "Remates", value: p.shots.length, show: data.metrics.includes("remates") },
    { label: "xG", value: p.shots.reduce((a, x) => a + (x.xg || 0), 0), dec: 2, show: data.metrics.includes("xg") },
    { label: "Pases clave", value: s.keyPasses, show: data.metrics.includes("pases") },
    { label: "Duelos", value: s.duelsWon, show: data.metrics.includes("duelos") },
  ].filter((i) => i.show);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 70,
        right: 70,
        transform: `translateY(${(1 - rise) * 120}px)`,
        opacity: rise,
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`,
        gap: 18,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: "rgba(12,20,26,.72)",
            border: `1px solid ${CYBER.cyan}44`,
            borderRadius: 18,
            padding: "20px 16px",
            textAlign: "center",
            backdropFilter: "blur(6px)",
          }}
        >
          <div style={{ fontFamily: anton, fontSize: 64, color: CYBER.cyan }}>
            <CountUp value={it.value} startFrame={startFrame + 4 + i * 3} decimals={it.dec ?? 0} />
          </div>
          <div style={{ fontFamily: barlow, fontSize: 24, color: CYBER.silver, letterSpacing: 2, textTransform: "uppercase" }}>
            {it.label}
          </div>
        </div>
      ))}
    </div>
  );
};

// Cierre: rating gigante
const Closing: React.FC<{ data: ReelProps; startFrame: number }> = ({ data, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;
  const pop = spring({ frame: local, fps, config: { damping: 11, stiffness: 120 } });
  const rating = data.player.stats.rating;
  if (!data.metrics.includes("rating") || !rating) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${0.8 + pop * 0.2})`,
        opacity: pop,
      }}
    >
      <div style={{ fontFamily: barlow, fontSize: 40, letterSpacing: 8, color: CYBER.silver, textTransform: "uppercase" }}>
        Rating SofaScore
      </div>
      <div style={{ fontFamily: anton, fontSize: 320, color: CYBER.cyan, lineHeight: 0.9, textShadow: `0 0 60px ${CYBER.cyan}` }}>
        <CountUp value={rating} startFrame={startFrame + 4} decimals={1} />
      </div>
    </div>
  );
};

// Leyenda de resultados presentes en el shotmap
const Legend: React.FC<{ data: ReelProps; startFrame: number }> = ({ data, startFrame }) => {
  const frame = useCurrentFrame();
  const present = Array.from(new Set(data.player.shots.map((s) => s.result)));
  const op = interpolate(frame - startFrame, [0, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", top: 470, left: 70, display: "flex", gap: 16, opacity: op, flexWrap: "wrap" }}>
      {present.map((r) => (
        <div key={r} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: barlow, fontSize: 24, color: CYBER.silver }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: RESULT_COLORS[r] ?? CYBER.cyan }} />
          {RESULT_LABELS_ES[r] ?? r}
        </div>
      ))}
    </div>
  );
};

export const Reel: React.FC<ReelProps> = (props) => {
  const { fps, durationInFrames } = useVideoConfig();
  const shots = props.player.shots;

  // ── reparto de tiempo (30s) ──
  const introEnd = Math.round(fps * 4); // 0-4s intro
  const shotsStart = introEnd;
  const shotsBudget = Math.round(fps * 16); // 4-20s shotmap
  const perShot = shots.length ? Math.max(fps * 0.7, shotsBudget / shots.length) : shotsBudget;
  const statsStart = Math.round(fps * 20.5); // 20.5-27
  const closeStart = Math.round(fps * 27); // 27-30

  // frames donde cae cada gol (para sonido)
  const golFrames: number[] = [];
  shots.forEach((s, i) => {
    if (s.result === "goal") golFrames.push(Math.round(shotsStart + i * perShot + perShot * 0.6));
  });

  return (
    <AbsoluteFill style={{ backgroundColor: CYBER.bg }}>
      <Background />

      {/* grano sutil */}
      <AbsoluteFill style={{ opacity: 0.035, mixBlendMode: "overlay", backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')" }} />

      <Header data={props} />

      {/* CANCHA + SHOTMAP */}
      <Sequence from={shotsStart - fps * 0.5}>
        <AbsoluteFill>
          <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
            <Pitch box={PITCH_BOX} />
            <ShotMap shots={shots} box={PITCH_BOX} startFrame={fps * 0.5} perShotFrames={perShot} />
          </svg>
        </AbsoluteFill>
        <Legend data={props} startFrame={0} />
      </Sequence>

      {/* GOL overlays */}
      {golFrames.map((gf, i) => (
        <GoolOverlay key={i} startFrame={gf} />
      ))}

      {/* MÉTRICAS */}
      <Sequence from={statsStart}>
        <StatStrip data={props} startFrame={0} />
      </Sequence>

      {/* CIERRE */}
      <Sequence from={closeStart}>
        <Closing data={props} startFrame={0} />
      </Sequence>

      {/* SONIDO DE GOL (archivo en public/gol.mp3) */}
      {golFrames.map((gf, i) => (
        <Sequence key={`a${i}`} from={gf} durationInFrames={Math.round(fps * 1.6)}>
          <Audio src={staticFile("gol.mp3")} volume={0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
