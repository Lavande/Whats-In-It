import { getHealthScoreColor } from "@/lib/utils";

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreCircle({ score, size = 'md' }: ScoreCircleProps) {
  const sizes = {
    sm: { circle: 40, stroke: 3, text: 'text-sm' },
    md: { circle: 60, stroke: 4, text: 'text-base' },
    lg: { circle: 80, stroke: 5, text: 'text-lg' },
  };

  const config = sizes[size];
  const radius = (config.circle - config.stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FFA000'; // Orange
    if (score >= 40) return '#FF7043'; // Orange-red
    return '#E57373'; // Red
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={config.circle}
        height={config.circle}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.circle / 2}
          cy={config.circle / 2}
          r={radius}
          stroke="var(--surface-variant)"
          strokeWidth={config.stroke}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={config.circle / 2}
          cy={config.circle / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={config.stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Score text */}
      <div className={`absolute inset-0 flex items-center justify-center ${config.text} font-bold`}>
        <span className={getHealthScoreColor(score)}>
          {score}
        </span>
      </div>
    </div>
  );
}