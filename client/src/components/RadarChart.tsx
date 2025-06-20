interface RadarChartProps {
  assessment: {
    visual: string | number;
    auditory: string | number;
    kinesthetic: string | number;
    reading: string | number;
    social: string | number;
    logical: string | number;
  };
  size?: number;
}

export default function RadarChart({ assessment, size = 200 }: RadarChartProps) {
  const values = [
    parseFloat(assessment.visual.toString()),
    parseFloat(assessment.auditory.toString()),
    parseFloat(assessment.kinesthetic.toString()),
    parseFloat(assessment.reading.toString()),
    parseFloat(assessment.social.toString()),
    parseFloat(assessment.logical.toString()),
  ];

  const labels = ['Visual', 'Auditory', 'Kinesthetic', 'Reading', 'Social', 'Logical'];
  const center = size / 2;
  const radius = size / 2 - 40;
  const angle = (2 * Math.PI) / 6;

  // Calculate polygon points for data
  const dataPoints = values.map((value, index) => {
    const x = center + Math.sin(index * angle) * (value * radius);
    const y = center - Math.cos(index * angle) * (value * radius);
    return `${x},${y}`;
  }).join(' ');

  // Calculate grid polygons
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridLevels.map(level => {
    return Array.from({ length: 6 }, (_, index) => {
      const x = center + Math.sin(index * angle) * (level * radius);
      const y = center - Math.cos(index * angle) * (level * radius);
      return `${x},${y}`;
    }).join(' ');
  });

  // Calculate label positions
  const labelPositions = labels.map((label, index) => {
    const x = center + Math.sin(index * angle) * (radius + 25);
    const y = center - Math.cos(index * angle) * (radius + 25);
    return { label, x, y };
  });

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid */}
        {gridPolygons.map((points, index) => (
          <polygon
            key={index}
            points={points}
            fill="none"
            stroke="hsl(var(--neutral-200))"
            strokeWidth="1"
            opacity={0.5}
          />
        ))}

        {/* Grid lines */}
        {Array.from({ length: 6 }, (_, index) => {
          const x = center + Math.sin(index * angle) * radius;
          const y = center - Math.cos(index * angle) * radius;
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="hsl(var(--neutral-200))"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={dataPoints}
          fill="hsl(var(--accent-lime))"
          fillOpacity="0.2"
          stroke="hsl(var(--accent-lime))"
          strokeWidth="2"
        />

        {/* Data points */}
        {values.map((value, index) => {
          const x = center + Math.sin(index * angle) * (value * radius);
          const y = center - Math.cos(index * angle) * (value * radius);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="hsl(var(--accent-lime))"
            />
          );
        })}

        {/* Labels */}
        {labelPositions.map(({ label, x, y }, index) => (
          <text
            key={index}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-neutral-600 font-medium"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
