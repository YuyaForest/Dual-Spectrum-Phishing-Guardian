import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Zap,
  CornerDownRight,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DualSpectrumResult } from "../server/analyzeService.ts";

interface ReportViewProps {
  data: DualSpectrumResult;
}

export const ReportView: React.FC<ReportViewProps> = ({ data }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(data.report.rawMarkdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyInjection = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTierIcon = () => {
    if (data.threatTier === "Malicious")
      return <ShieldAlert className="w-5 h-5 text-red-400" />;
    if (data.threatTier === "Suspicious")
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div
      id="phishing-threat-report-panel"
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6"
    >
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ⚠️ Phishing Threat Analysis Report
            </h3>
            <p className="text-xs text-slate-400">
              Dual-Spectrum Phishing Guardian 診断レポート
            </p>
          </div>
        </div>

        <button
          id="copy-full-report-button"
          onClick={handleCopyAll}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>レポート全文をコピーしました</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Markdown形式で全文コピー</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Threat Score */}
      <div
        id="report-section-1"
        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
      >
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-mono">
            1
          </span>
          <h4>Threat Score (0-100)</h4>
        </div>
        <div className="pl-7 flex items-center space-x-3">
          {getTierIcon()}
          <span
            id="report-threat-tier-text"
            className="text-sm font-bold text-white font-mono"
          >
            {data.threatTierLabel} (スコア: {data.threatScore}/100)
          </span>
        </div>
      </div>

      {/* Section 2: Spectrum Analysis */}
      <div
        id="report-section-2"
        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3"
      >
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-mono">
            2
          </span>
          <h4>Spectrum Analysis</h4>
        </div>

        <div className="pl-7 space-y-2.5 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">
              Spectrum 1: Traditional SE & V-Triad Vectors (従来型リスク):
            </span>
            <p className="text-slate-300 leading-relaxed font-mono">
              {data.report.spectrumAnalysisSection.traditional || "None"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">
              Spectrum 2: GenAI Anomalies (生成AIリスク):
            </span>
            <p className="text-slate-300 leading-relaxed font-mono">
              {data.report.spectrumAnalysisSection.genai || "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Counter-Measure */}
      <div
        id="report-section-3"
        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-xs font-mono">
              3
            </span>
            <h4>Counter-Measure (対抗策の提案)</h4>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
            対抗策の例示モデル（判定非連動・恒久リファレンス）
          </span>
        </div>

        <p className="pl-7 text-xs text-slate-400 leading-relaxed">
          ボットかどうかを確定させるための「カマをかける返信案 (Turing Test)」や、攻撃者のシナリオ進行・スクリプトを崩す「例外インジェクション」を例示します。
        </p>

        {/* Why this is an effective counter-measure: Explanation Points */}
        {data.report.counterMeasures.explanationPoints && data.report.counterMeasures.explanationPoints.length > 0 && (
          <div className="pl-7 space-y-2.5">
            <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-800/30">
              <h5 className="text-xs font-semibold text-indigo-300 mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>なぜこれが対抗策となりうるのか？（メカニズムと要点解説）</span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {data.report.counterMeasures.explanationPoints.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] space-y-1"
                  >
                    <div className="font-semibold text-slate-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                      <span>{pt.title}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed pl-2.5">
                      {pt.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Counter Measure Table */}
        <div className="pl-7 overflow-x-auto">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">
            ▼ 例外インジェクションの対比表（例示）
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-2.5 px-3 font-semibold w-1/4">
                  攻撃者のシナリオ進行
                </th>
                <th className="py-2.5 px-3 font-semibold w-5/12 text-indigo-300">
                  進行を崩す「例外インジェクション（カマをかける・脱線）」
                </th>
                <th className="py-2.5 px-3 font-semibold w-1/3 text-rose-300">
                  攻撃者側のシステムエラー（影響）
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {data.report.counterMeasures.table.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 px-3 text-slate-300 font-medium align-top">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                      {row.attackerScenario}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-indigo-200 align-top">
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 font-medium">
                        {row.exceptionInjection}
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            handleCopyInjection(row.exceptionInjection, idx)
                          }
                          className="inline-flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">
                                コピー完了！
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>返信文言をコピー</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 leading-relaxed align-top">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] space-y-1.5">
                      <div>{row.systemImpact}</div>
                      {row.whyItWorks && (
                        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-indigo-300/80 flex items-start space-x-1">
                          <span className="font-semibold text-indigo-400 shrink-0">効く理由:</span>
                          <span>{row.whyItWorks}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
