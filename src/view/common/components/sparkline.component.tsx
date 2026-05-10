interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Minimal SVG sparkline — single polyline, no axis, no labels.
 * Pass an array of numbers; the component scales them to the viewbox.
 */
export function Sparkline({
  data,
  color = 'currentColor',
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  className,
}: SparklineProps) {
  if (!data.length) {
    return <svg width={width} height={height} className={className} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} className={className} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
