import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Terminal, CheckCircle2 } from "lucide-react";

interface JevDiagnosticsDrawerProps {
  jevRaw: {
    model: string;
    answers: Record<string, any>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
}

export const JevDiagnosticsDrawer: React.FC<JevDiagnosticsDrawerProps> = ({ jevRaw }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      id="jev-diagnostics-drawer"
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
    >
      <button
        id="toggle-jev-diagnostics-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition border-b border-transparent data-[open=true]:border-slate-800"
        data-open={isOpen}
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              TypeSafe JEV (System One) 診断データ
            </h4>
            <p className="text-xs text-slate-400">
              JEVモデルによる型付き推論結果と確率分布 (Calibrated Probabilities)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800 text-sky-300">
            Model: {jevRaw.model || "jev-latest"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 bg-slate-950 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1.5 text-sky-300">
              <Terminal className="w-3.5 h-3.5" />
              <span>TypeSafe SDK SystemOne Response Payload</span>
            </span>
            {jevRaw.usage && (
              <span>
                Tokens: {jevRaw.usage.input_tokens ?? 0} in / {jevRaw.usage.output_tokens ?? 0} out
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {Object.entries(jevRaw.answers || {}).map(([key, val]: [string, any]) => {
              return (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-300 font-semibold border-b border-slate-800 pb-1">
                    <span className="text-indigo-300">{key}</span>
                    <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-800">
                      {val?.type || "primitive"}
                    </span>
                  </div>

                  {val?.score != null && (
                    <div className="flex justify-between text-slate-400">
                      <span>Score:</span>
                      <span className="text-white font-bold">{val.score.toFixed(2)}</span>
                    </div>
                  )}

                  {val?.confidence != null && (
                    <div className="flex justify-between text-slate-400">
                      <span>Confidence:</span>
                      <span className="text-sky-300">{(val.confidence * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {val?.noul != null && (
                    <div className="flex justify-between text-slate-400">
                      <span>Noul (Yes Prob):</span>
                      <span className="text-emerald-400 font-bold">{(val.noul * 100).toFixed(1)}%</span>
                    </div>
                  )}

                  {val?.choice != null && (
                    <div className="flex justify-between text-slate-400">
                      <span>Selected Choice:</span>
                      <span className="text-amber-300 font-bold">{val.choice}</span>
                    </div>
                  )}

                  {val?.probabilities && (
                    <div className="pt-1 mt-1 border-t border-slate-800/60 text-[10px] space-y-0.5">
                      <span className="text-slate-500 block">Probabilities:</span>
                      {Object.entries(val.probabilities).map(([pk, pv]: [string, any]) => (
                        <div key={pk} className="flex justify-between text-slate-400">
                          <span className="truncate max-w-[180px]">
                            Level {pk} ({val?.legend?.[pk] || ""}):
                          </span>
                          <span className="text-slate-300">{(Number(pv) * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
            ※ TypeSafe JEVは自然言語と状態から直接「型定義された判断と確率分布」を高速に抽出するSystem Oneモデルです。コード側で正規化とデュアルスペクトラム合成重み付け（Composite Scoring）を実行しています。
          </div>
        </div>
      )}
    </div>
  );
};
