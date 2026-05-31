import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { reelSchema, ReelProps } from "./data";

// Datos demo (estructura idéntica al JSON que exporta el notebook)
const DEMO: ReelProps = {
  match: {
    home: "Independiente del Valle",
    away: "LDU Quito",
    homeScore: 3,
    awayScore: 1,
    tournament: "LigaPro Serie A",
    round: "12",
  },
  player: {
    name: "Junior Sornoza",
    number: 10,
    position: "AMF",
    teamLabel: "Local",
    shots: [
      { depth: 84, width: 42, endDepth: 100, endWidth: 48, result: "goal", body: "left foot", minute: 23, jersey: "10", xg: 0.12 },
      { depth: 78, width: 55, endDepth: 96, endWidth: 40, result: "saved", body: "right foot", minute: 41, jersey: "10", xg: 0.07 },
      { depth: 88, width: 50, endDepth: 100, endWidth: 52, result: "goal", body: "left foot", minute: 67, jersey: "10", xg: 0.34 },
      { depth: 74, width: 36, endDepth: 90, endWidth: 30, result: "missed", body: "left foot", minute: 79, jersey: "10", xg: 0.05 },
    ],
    stats: { rating: 8.4, goals: 2, assists: 1, keyPasses: 4, duelsWon: 6, passAcc: 89 },
  },
  metrics: ["remates", "xg", "pases", "duelos", "rating"],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={30 * 30} // 30 s a 30 fps
      fps={30}
      width={1080}
      height={1920}
      schema={reelSchema}
      defaultProps={DEMO}
    />
  );
};
