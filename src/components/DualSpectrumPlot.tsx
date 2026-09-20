import React from "react";
import { ShieldAlert, Crosshair, Sparkles, AlertTriangle } from "lucide-react";

interface DualSpectrumPlotProps {
  xTraditional: number; // 0 - 100
  yGenAI: number; // 0 - 100
  quadrant: string;
  quadrantDescription: string;
  threatTier: "Safe" | "Suspicious" | "Malicious";
}

export const DualSpectrumPlot: React.FC<DualSpectrumPlotProps> = ({
  xTraditional,
  yGenAI,
  quadrant,
  quadrantDescription,
  threatTier,
}) => {
  // Constrain coordinates to 0 - 100
  const clampedX = Math.max(0, Math.min(100, xTraditional));
  const clampedY = Math.max(0, Math.min(100, yGenAI));

  // Plot area dimensions
  const width = 460;
  const height = 400;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Convert 0-100 to SVG pixels
  // Note: Y is inverted in SVG (0 at bottom, 100 at top)
  const markerPxX = padding.left + (clampedX / 100) * plotWidth;
  const markerPxY = padding.top + plotHeight - (clampedY / 100) * plotHeight;
  const midX = padding.left + 0.45 * plotWidth;
  const midY = padding.top + plotHeight - 0.45 * plotHeight;

  const getMarkerColor = () => {
    if (threatTier === "Malicious") return "#ef4444";
    if (threatTier === "Suspicious") return "#f59e0b";
    return "#10b981";
  };

  return (
    <div
      id="dual-spectrum-plot-container"
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-base">
            Dual-Spectrum 2D 散布プロット
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">現在プロット値:</span>
          <span
            id="coordinates-badge"
            className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-indigo-300 border border-slate-700"
          >
            X: {clampedX}% (SE) / Y: {clampedY}% (AI)
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        横軸に「従来型ソーシャルエンジニアリング(V-Triad/不自然さ)」、縦軸に「生成AI特有の異常(無菌トーン/構造的硬直性)」をプロットし、攻撃の性質を4象限で特定します。
      </p>

      {/* SVG Canvas Plot */}
      <div className="relative w-full flex justify-center items-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-w-[460px] select-none"
        >
          <defs>
            {/* Gradients for Quadrants */}
            <linearGradient id="quadSafe" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#064e3b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="quadAI" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#581c87" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#581c87" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="quadTraditional" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#881337" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#881337" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="quadDual" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.2" />
            </linearGradient>

            {/* Pulse Glow Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="#0b1120"
            rx="6"
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Quadrant Shading */}
          {/* Bottom-Left: Safe */}
          <rect
            x={padding.left}
            y={midY}
            width={midX - padding.left}
            height={padding.top + plotHeight - midY}
            fill="url(#quadSafe)"
          />
          {/* Top-Left: Stealth AI Disguise */}
          <rect
            x={padding.left}
            y={padding.top}
            width={midX - padding.left}
            height={midY - padding.top}
            fill="url(#quadAI)"
          />
          {/* Bottom-Right: Traditional SE / Fraud */}
          <rect
            x={midX}
            y={midY}
            width={padding.left + plotWidth - midX}
            height={padding.top + plotHeight - midY}
            fill="url(#quadTraditional)"
          />
          {/* Top-Right: Dual Threat (Advanced AI Spear Phishing) */}
          <rect
            x={midX}
            y={padding.top}
            width={padding.left + plotWidth - midX}
            height={midY - padding.top}
            fill="url(#quadDual)"
          />

          {/* Quadrant Partition Lines (Threshold at 45) */}
          <line
            x1={midX}
            y1={padding.top}
            x2={midX}
            y2={padding.top + plotHeight}
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <line
            x1={padding.left}
            y1={midY}
            x2={padding.left + plotWidth}
            y2={midY}
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Grid Sub-lines */}
          {[20, 40, 60, 80].map((val) => {
            const gx = padding.left + (val / 100) * plotWidth;
            const gy = padding.top + plotHeight - (val / 100) * plotHeight;
            return (
              <g key={val} opacity="0.3">
                <line
                  x1={gx}
                  y1={padding.top}
                  x2={gx}
                  y2={padding.top + plotHeight}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <line
                  x1={padding.left}
                  y1={gy}
                  x2={padding.left + plotWidth}
                  y2={gy}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Quadrant Watermark Labels */}
          <text
            x={padding.left + 12}
            y={padding.top + 20}
            fill="#a855f7"
            fontSize="10"
            fontWeight="bold"
            opacity="0.85"
          >
            象限II: 生成AI偽装型 (Vanilla AI)
          </text>
          <text
            x={midX + 12}
            y={padding.top + 20}
            fill="#f87171"
            fontSize="10"
            fontWeight="bold"
            opacity="0.9"
          >
            象限I: 複合型標的脅威 (Dual-Threat)
          </text>
          <text
            x={padding.left + 12}
            y={padding.top + plotHeight - 12}
            fill="#34d399"
            fontSize="10"
            fontWeight="bold"
            opacity="0.85"
          >
            象限III: 安全・低リスク (Safe Zone)
          </text>
          <text
            x={midX + 12}
            y={padding.top + plotHeight - 12}
            fill="#fb923c"
            fontSize="10"
            fontWeight="bold"
            opacity="0.85"
          >
            象限IV: 従来型SE / 特殊詐欺
          </text>

          {/* Axes labels and ticks */}
          {/* Y Axis (GenAI Anomalies) */}
          <text
            x={padding.left - 10}
            y={padding.top + plotHeight / 2}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
            transform={`rotate(-90 ${padding.left - 30} ${padding.top + plotHeight / 2})`}
          >
            生成AI異常度 (GenAI Anomalies) ↑
          </text>

          {/* Y Ticks */}
          {[0, 25, 50, 75, 100].map((val) => {
            const gy = padding.top + plotHeight - (val / 100) * plotHeight;
            return (
              <text
                key={val}
                x={padding.left - 8}
                y={gy + 3}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                {val}
              </text>
            );
          })}

          {/* X Axis (Traditional SE) */}
          <text
            x={padding.left + plotWidth / 2}
            y={height - 12}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            従来型ソーシャルエンジニアリング (Traditional SE) →
          </text>

          {/* X Ticks */}
          {[0, 25, 50, 75, 100].map((val) => {
            const gx = padding.left + (val / 100) * plotWidth;
            return (
              <text
                key={val}
                x={gx}
                y={padding.top + plotHeight + 16}
                fill="#64748b"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {val}
              </text>
            );
          })}

          {/* Target Plot Point Marker */}
          {/* Pulsing halo */}
          <circle
            cx={markerPxX}
            cy={markerPxY}
            r="16"
            fill={getMarkerColor()}
            opacity="0.25"
            className="animate-ping"
          />
          {/* Outer circle */}
          <circle
            cx={markerPxX}
            cy={markerPxY}
            r="9"
            fill={getMarkerColor()}
            opacity="0.4"
          />
          {/* Core circle */}
          <circle
            cx={markerPxX}
            cy={markerPxY}
            r="5"
            fill="#ffffff"
            stroke={getMarkerColor()}
            strokeWidth="2.5"
            filter="url(#glow)"
          />

          {/* Interactive Callout on current plot */}
          <g transform={`translate(${markerPxX > width - 130 ? markerPxX - 110 : markerPxX + 12}, ${markerPxY < 60 ? markerPxY + 24 : markerPxY - 20})`}>
            <rect
              x="-4"
              y="-12"
              width="106"
              height="24"
              rx="4"
              fill="#0f172a"
              stroke={getMarkerColor()}
              strokeWidth="1.5"
              filter="url(#glow)"
            />
            <text
              x="49"
              y="4"
              fill="#f8fafc"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              SE: {clampedX}% | AI: {clampedY}%
            </text>
          </g>
        </svg>
      </div>

      {/* Quadrant Legend & Description Bar */}
      <div
        id="quadrant-info-card"
        className="mt-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start space-x-3"
      >
        <div className="p-1.5 rounded-md bg-slate-700 text-indigo-400 mt-0.5">
          {threatTier === "Malicious" ? (
            <ShieldAlert className="w-4 h-4 text-red-400" />
          ) : threatTier === "Suspicious" ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300">
              判定象限:
            </span>
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
              {quadrant}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {quadrantDescription}
          </p>
        </div>
      </div>
    </div>
  );
};
