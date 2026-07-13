const PANELS: { points: string; fill: "primary" | "dark" | "light" }[] = [
  { points: "265,120 222,98 139,149 176,170", fill: "primary" },
  { points: "224,147 227,196 265,170", fill: "dark" },
  { points: "136,152 136,195 220,246 220,200", fill: "light" },
  { points: "136,244 222,293 221,247 178,222", fill: "dark" },
  { points: "269,221 223,249 223,292 268,266", fill: "light" },
  { points: "270,221 270,267 310,280 311,236", fill: "dark" },
  { points: "362,217 311,234 313,280 361,261", fill: "light" },
];

const COLORS: Record<string, string> = {
  primary: "var(--color-primary)",
  dark: "var(--color-on-surface)",
  light: "var(--color-on-surface-variant)",
};

export function CoworkLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="126 88 246 215" className={className} aria-hidden="true">
      {PANELS.map((p, i) => (
        <polygon key={i} points={p.points} fill={COLORS[p.fill]} />
      ))}
    </svg>
  );
}
