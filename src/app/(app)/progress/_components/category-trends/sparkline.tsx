import { cn } from "@/lib/utils";

const WIDTH = 96;
const HEIGHT = 28;
const PADDING = 3;

interface Point {
  x: number;
  y: number;
}

interface SparklineProps {
  values: (number | null)[];
  // Top of the scale; defaults to the highest value so small rates keep a shape.
  max?: number;
  className?: string;
}

// Weeks without answers break the line instead of dropping to zero.
export default function Sparkline({ values, max, className }: SparklineProps) {
  const ceiling =
    max ?? Math.max(...values.map((value) => value ?? 0), 0.05);
  const step = (WIDTH - PADDING * 2) / Math.max(values.length - 1, 1);
  const points = values.map((value, index): Point | null =>
    value === null
      ? null
      : {
          x: PADDING + index * step,
          y: HEIGHT - PADDING - (value / ceiling) * (HEIGHT - PADDING * 2),
        },
  );

  const segments: Point[][] = [];
  let current: Point[] = [];
  for (const point of points) {
    if (point) {
      current.push(point);
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);

  const last = points.at(-1);

  return (
    <svg
      data-slot="sparkline"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden
      className={cn("h-7 w-24 overflow-visible text-primary", className)}
    >
      <line
        x1={PADDING}
        x2={WIDTH - PADDING}
        y1={HEIGHT - PADDING}
        y2={HEIGHT - PADDING}
        className="stroke-border"
        strokeWidth={1}
      />
      {segments.map((segment, index) =>
        segment.length === 1 ? (
          <circle
            key={index}
            cx={segment[0].x}
            cy={segment[0].y}
            r={1.5}
            fill="currentColor"
          />
        ) : (
          <polyline
            key={index}
            points={segment.map(({ x, y }) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
      {last && <circle cx={last.x} cy={last.y} r={3} fill="currentColor" />}
    </svg>
  );
}
