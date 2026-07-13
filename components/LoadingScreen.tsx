"use client";

import { useEffect, useRef, useState } from "react";
import "./LoadingScreen.css";

interface LoadingScreenProps {
  onDone: () => void;
}

const PANELS: { points: string; fill: "cw-primary" | "cw-dark" | "cw-light" }[] = [
  { points: "265,120 222,98 139,149 176,170", fill: "cw-primary" }, // techo naranja
  { points: "224,147 227,196 265,170", fill: "cw-dark" }, // triángulo "play"
  { points: "136,152 136,195 220,246 220,200", fill: "cw-light" }, // brazo superior izquierdo
  { points: "136,244 222,293 221,247 178,222", fill: "cw-dark" }, // cara inferior izquierda
  { points: "269,221 223,249 223,292 268,266", fill: "cw-light" }, // brazo inferior
  { points: "270,221 270,267 310,280 311,236", fill: "cw-dark" }, // segmento de cola 1
  { points: "362,217 311,234 313,280 361,261", fill: "cw-light" }, // segmento de cola 2
];

export function LoadingScreen({ onDone }: LoadingScreenProps) {
  const [hidden, setHidden] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spinTimer = setTimeout(() => sceneRef.current?.classList.add("cw-spin"), 1900);
    const hideTimer = setTimeout(() => setHidden(true), 2600);
    const doneTimer = setTimeout(onDone, 3100);
    return () => {
      clearTimeout(spinTimer);
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className={`cw-loading-overlay ${hidden ? "cw-hide" : ""}`} aria-hidden={hidden}>
      <div className="cw-stage">
        <div className="cw-perspective">
          <div className="cw-scene" ref={sceneRef}>
            <div
              className="cw-panel"
              style={{ opacity: 1, transform: "translateZ(-6px) rotateX(0deg)", animation: "none" }}
            >
              <svg viewBox="126 88 246 215" shapeRendering="geometricPrecision">
                {PANELS.map((p, i) => (
                  <polygon key={i} points={p.points} fill={`var(--${p.fill})`} />
                ))}
              </svg>
            </div>

            {PANELS.map((p, i) => (
              <div className={`cw-panel cw-p${i + 1}`} key={i}>
                <svg viewBox="126 88 246 215">
                  <polygon
                    points={p.points}
                    fill={`var(--${p.fill})`}
                    stroke={`var(--${p.fill})`}
                    strokeWidth={4}
                    strokeLinejoin="round"
                    shapeRendering="geometricPrecision"
                  />
                </svg>
              </div>
            ))}

            <div
              className="cw-panel"
              style={{ opacity: 1, transform: "translateZ(2px)", animation: "none", pointerEvents: "none" }}
            >
              <svg viewBox="126 88 246 215">
                <defs>
                  <clipPath id="cwLogoClip" clipPathUnits="userSpaceOnUse">
                    {PANELS.map((p, i) => (
                      <polygon key={i} points={p.points} />
                    ))}
                  </clipPath>
                  <linearGradient id="cwShineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
                    <stop offset="42%" stopColor="#ffffff" stopOpacity={0} />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity={0.95} />
                    <stop offset="58%" stopColor="#ffffff" stopOpacity={0} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <g clipPath="url(#cwLogoClip)">
                  <rect
                    x={-320}
                    y={-160}
                    width={110}
                    height={620}
                    fill="url(#cwShineGrad)"
                    transform="rotate(-24 249 195)"
                    style={{ mixBlendMode: "screen" }}
                  >
                    <animate
                      attributeName="x"
                      values="-320;-320;520;520"
                      keyTimes="0;0.08;0.5;1"
                      dur="4.8s"
                      begin="2.6s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="cw-wordmark">CO-WORK</div>
      </div>
    </div>
  );
}
