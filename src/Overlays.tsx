import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { CYBER } from "./data";

// "¡GOOOL!" a pantalla completa con escala elástica + shake
export const GoolOverlay: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0 || local > fps * 1.4) return null;

  const pop = spring({ frame: local, fps, config: { damping: 9, stiffness: 200, mass: 0.7 } });
  const out = interpolate(local, [fps * 0.9, fps * 1.4], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shake = local < fps * 0.5 ? Math.sin(local * 2.2) * 6 * (1 - local / (fps * 0.5)) : 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: out,
      }}
    >
      <div
        style={{
          fontFamily: "Anton, sans-serif",
          fontSize: 200,
          color: CYBER.red,
          transform: `scale(${pop}) translateX(${shake}px)`,
          textShadow: `0 0 40px ${CYBER.red}, 0 0 80px ${CYBER.red}aa`,
          letterSpacing: 4,
          WebkitTextStroke: `3px ${CYBER.white}`,
        }}
      >
        ¡GOOOL!
      </div>
    </div>
  );
};

// número que cuenta de 0 al valor con easing
export const CountUp: React.FC<{
  value: number;
  startFrame: number;
  decimals?: number;
  style?: React.CSSProperties;
}> = ({ value, startFrame, decimals = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = interpolate(frame - startFrame, [0, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return <span style={style}>{(value * t).toFixed(decimals)}</span>;
};
