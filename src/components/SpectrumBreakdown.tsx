import React from "react";
import { Shield, Bot, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { DualSpectrumResult } from "../server/analyzeService.ts";

interface SpectrumBreakdownProps {
  data: DualSpectrumResult;
}

export const SpectrumBreakdown: React.FC<SpectrumBreakdownProps> = ({ data }) => {
  const { spectrum1_traditional, spectrum2_genai } = data;

  const renderProgressBar = (
    label: string,
    sublabel: string,
    percent: number,
    colorClass: string
  ) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-200 font-medium">{label}</span>
          <span className="font-mono font-semibold text-slate-400">
            {clamped}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">{sublabel}</p>
      </div>
    );
  };

  return (
    <div
      id="spectrum-breakdown-section"
      className="grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {/* Spectrum 1: Traditional Heuristics Card */}
      <div
        id="spectrum-1-card"
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Spectrum 1: V-Triad & Traditional Vectors
                </h4>
                <p className="text-[11px] text-slate-400">
                  従来型ソーシャルエンジニアリング (心理誘導・恐怖・切迫感・文法不備)
                </p>
              </div>
            </div>
            <span
              id="traditional-score-badge"
              className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800 text-rose-300"
            >
              {spectrum1_traditional.score} / 100
            </span>
          </div>

          {/* V-Triad Vectors */}
          <div className="space-y-3.5 mb-5">
            {renderProgressBar(
              "V-Triad: 権威 (Authority)",
              "警察・検察・国税・銀行・役員の騙りによる心理的威圧",
              spectrum1_traditional.vtriad.authority.probability * 100,
              "bg-rose-500"
            )}
            {renderProgressBar(
              "V-Triad: 恐怖 (Fear)",
              "口座凍結・逮捕・訴訟・差押え警告によるパニック誘発",
              spectrum1_traditional.vtriad.fear.probability * 100,
              "bg-orange-500"
            )}
            {renderProgressBar(
              "V-Triad: 切迫感 (Urgency)",
              "「24時間以内」「至急」「本日中」等の期限制限による思考停止",
              spectrum1_traditional.vtriad.urgency.probability * 100,
              "bg-amber-500"
            )}
            {renderProgressBar(
              "Broken Language (不自然な言語)",
              "直訳調、不自然な敬語、助詞の破綻、機械翻訳痕跡",
              (spectrum1_traditional.brokenLanguage.score / 2) * 100,
              "bg-yellow-500"
            )}
          </div>
        </div>

        {/* Detected Summary Tag */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 mb-1 font-semibold flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>検出結果:</span>
          </div>
          <p
            id="traditional-detected-summary"
            className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800"
          >
            {spectrum1_traditional.summary}
          </p>
        </div>
      </div>

      {/* Spectrum 2: GenAI Anomalies Card */}
      <div
        id="spectrum-2-card"
        className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Spectrum 2: GenAI Anomalies
                </h4>
                <p className="text-[11px] text-slate-400">
                  生成AI特有の異常 (無菌トーン・過剰構造化・文脈欠落)
                </p>
              </div>
            </div>
            <span
              id="genai-score-badge"
              className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800 text-purple-300"
            >
              {spectrum2_genai.score} / 100
            </span>
          </div>

          {/* GenAI Anomaly Dimensions */}
          <div className="space-y-3.5 mb-5">
            {renderProgressBar(
              "Vanilla Tone (無菌状態のトーン)",
              "誤字脱字皆無、角の立たない過剰に丁寧な教科書的敬語構文",
              spectrum2_genai.vanillaTone.probability * 100,
              "bg-purple-500"
            )}
            {renderProgressBar(
              "Structural Rigidity (黄金比への固執)",
              "「挨拶→背景→3つの箇条書き→結び」というLLM定型テンプレート",
              spectrum2_genai.structuralRigidity.probability * 100,
              "bg-indigo-500"
            )}
            {renderProgressBar(
              "Temporal Blindness (時間的・文脈的ラグ)",
              "現場のリアルタイム文脈や当事者間固有の共有事実の欠落",
              spectrum2_genai.temporalBlindness.probability * 100,
              "bg-cyan-500"
            )}
            {renderProgressBar(
              "Emotional Inflation (感情と論理の乖離)",
              "整然としたビジネス文面への突如不自然な「至急指示」のインジェクト",
              spectrum2_genai.emotionalInflation.probability * 100,
              "bg-pink-500"
            )}
          </div>
        </div>

        {/* Detected Summary Tag */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-xs text-slate-400 mb-1 font-semibold flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>検出結果:</span>
          </div>
          <p
            id="genai-detected-summary"
            className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800"
          >
            {spectrum2_genai.summary}
          </p>
        </div>
      </div>
    </div>
  );
};
