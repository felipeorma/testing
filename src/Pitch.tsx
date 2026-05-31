import React from "react";
import { CYBER, PitchBox } from "./data";

// Cancha vertical, medio campo de ataque, estilo opta — réplica del mplsoccer VerticalPitch
export const Pitch: React.FC<{ box: PitchBox }> = ({ box }) => {
  const { x, y, w, h } = box;
  const line = CYBER.line;
  const sw = 3;

  // medidas proporcionales (opta-like sobre medio campo)
  const penW = w * 0.58;
  const penH = h * 0.36;
  const penX = x + (w - penW) / 2;
  const sixW = w * 0.28;
  const sixH = h * 0.14;
  const sixX = x + (w - sixW) / 2;
  const goalW = w * 0.18;
  const goalX = x + (w - goalW) / 2;

  return (
    <g opacity={0.92}>
      <defs>
        <filter id="pitchGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g stroke={line} strokeWidth={sw} fill="none" filter="url(#pitchGlow)">
        {/* borde del medio campo */}
        <rect x={x} y={y} width={w} height={h} />
        {/* línea de medio campo (abajo) con círculo central parcial */}
        <line x1={x} y1={y + h} x2={x + w} y2={y + h} />
        <path
          d={`M ${x + w / 2 - w * 0.13} ${y + h} A ${w * 0.13} ${w * 0.13} 0 0 1 ${
            x + w / 2 + w * 0.13
          } ${y + h}`}
        />
        {/* área grande (arriba = arco rival) */}
        <rect x={penX} y={y} width={penW} height={penH} />
        {/* área chica */}
        <rect x={sixX} y={y} width={sixW} height={sixH} />
        {/* arco */}
        <line x1={goalX} y1={y} x2={goalX + goalW} y2={y} strokeWidth={sw * 2} />
        {/* punto de penal */}
        <circle cx={x + w / 2} cy={y + penH * 0.72} r={2.5} fill={line} stroke="none" />
        {/* arco del área */}
        <path
          d={`M ${x + w / 2 - w * 0.12} ${y + penH} A ${w * 0.12} ${w * 0.12} 0 0 0 ${
            x + w / 2 + w * 0.12
          } ${y + penH}`}
        />
      </g>
    </g>
  );
};
