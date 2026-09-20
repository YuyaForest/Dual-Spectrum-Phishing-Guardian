import React from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity } from "lucide-react";

interface ThreatGaugeProps {
  score: number; // 0 - 100
  tier: "Safe" | "Suspicious" | "Malicious";
  tierLabel: string;
  confidence: number;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score,
  tier,
  tierLabel,
  confidence,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Gauge geometry (Semi-circle arc)
  const radius = 80;
  const strokeWidth = 14;
  const cx = 110;
  const cy = 100;
  const circumference = Math.PI * radius; // 180 degrees arc length
  const progressOffset = circumference - (clampedScore / 100) * circumference;

  const getTierMeta = () => {
    switch (tier) {
      case "Malicious":
        return {
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          badgeBg: "bg-red-950 text-red-300 border-red-800",
          strokeColor: "#ef4444",
          icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
          title: "Malicious (悪意あり / フィッシングの可能性大)",
          description: "深刻なソーシャルエンジニアリングまたは詐欺脅威が検出されました。",
        };
      case "Suspicious":
        return {
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          badgeBg: "bg-amber-950 text-amber-300 border-amber-800",
          strokeColor: "#f59e0b",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: "Suspicious (要警戒)",
          description: "不審な心理的誘導またはAI不自然シグナルが確認されました。",
        };
      case "Safe":
      default:
        return {
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          badgeBg: "bg-emerald-950 text-emerald-300 border-emerald-800",
          strokeColor: "#10b981",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          title: "Safe (安全)",
          description: "明白な脅威シグナルはなく、日常的な通信の範囲内です。",
        };
    }
  };

  const meta = getTierMeta();

  return (
    <div
      id="threat-gauge-card"
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-base">
            1. Threat Score (総合脅威指数)
          </h3>
        </div>
        <span
          id="confidence-tag"
          className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
          title="TypeSafe JEV 確率的確信度"
        >
          JEV信頼度: {Math.round(confidence * 100)}%
        </span>
      </div>

      {/* Semicircle Gauge Visualizer */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <svg width="220" height="130" viewBox="0 0 220 130" className="overflow-visible">
          {/* Background Track Arc */}
          <path
            d="M 30 100 A 80 80 0 0 1 190 100"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Color Band Zones (Safe 0-20, Suspicious 21-60, Malicious 61-100) */}
          <path
            d="M 30 100 A 80 80 0 0 1 190 100"
            fill="none"
            stroke="#334155"
            strokeWidth={2}
            strokeDasharray="2 4"
            className="opacity-40"
          />

          {/* Active Score Arc */}
          <path
            d="M 30 100 A 80 80 0 0 1 190 100"
            fill="none"
            stroke={meta.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Center Digital Score Counter */}
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="34"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {clampedScore}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="500"
          >
            / 100 pts
          </text>
        </svg>

        {/* Threat Level Scale Indicator */}
        <div className="w-full flex justify-between px-4 text-[10px] text-slate-500 font-mono mt-[-6px]">
          <span className="text-emerald-500/80">0 (Safe)</span>
          <span className="text-amber-500/80">21 (Suspicious)</span>
          <span className="text-red-500/80">61 (Malicious) 100</span>
        </div>
      </div>

      {/* Threat Tier Status Badge & Description */}
      <div
        id="threat-tier-summary"
        className={`p-3 rounded-lg border ${meta.bgColor} ${meta.borderColor} flex items-start space-x-3`}
      >
        <div className="mt-0.5">{meta.icon}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span
              id="threat-tier-badge"
              className={`text-xs font-bold px-2 py-0.5 rounded border ${meta.badgeBg}`}
            >
              {tierLabel}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {meta.description}
          </p>
        </div>
      </div>
    </div>
  );
};
