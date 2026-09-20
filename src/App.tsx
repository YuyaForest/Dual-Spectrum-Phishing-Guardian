import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Cpu,
  FileSearch,
  BookOpen,
  ArrowRight,
  Layers,
  Terminal,
} from "lucide-react";
import { SAMPLE_TRANSCRIPTS, SampleTranscript } from "./presets.ts";
import { DualSpectrumResult } from "./server/analyzeService.ts";
import { ThreatGauge } from "./components/ThreatGauge.tsx";
import { SpectrumBreakdown } from "./components/SpectrumBreakdown.tsx";
import { ReportView } from "./components/ReportView.tsx";
import { JevDiagnosticsDrawer } from "./components/JevDiagnosticsDrawer.tsx";

export default function App() {
  const [transcript, setTranscript] = useState<string>(
    SAMPLE_TRANSCRIPTS[0].text
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    SAMPLE_TRANSCRIPTS[0].id
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DualSpectrumResult | null>(null);

  // Auto-run analysis on initial load with the default preset
  useEffect(() => {
    handleAnalyze(SAMPLE_TRANSCRIPTS[0].text);
  }, []);

  const handleSelectPreset = (preset: SampleTranscript) => {
    setSelectedPresetId(preset.id);
    setTranscript(preset.text);
    handleAnalyze(preset.text);
  };

  const handleAnalyze = async (textToAnalyze?: string) => {
    const targetText = textToAnalyze ?? transcript;
    if (!targetText.trim()) {
      setError("分析対象のトランスクリプトまたはテキストを入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: targetText }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status} エラー`);
      }

      const data: DualSpectrumResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(
        err.message ||
          "分析処理中にエラーが発生しました。しばらく待って再試行してください。"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setSelectedPresetId("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header
        id="app-header"
        className="border-b border-slate-800/90 bg-slate-900/80 backdrop-blur sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Dual-Spectrum Phishing Guardian
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  TypeSafe JEV Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                特殊詐欺・標的型フィッシング検知 / 従来型SE × 生成AI偽装のデュアルスペクトラム分析
              </p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px]">
                Model: jev-latest
              </span>
            </div>
            <a
              href="https://github.com/typesafe-ai/skills"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/80 transition"
              title="TypeSafe AI Skills Repository"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">TypeSafe Skill</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Scenario Preset Selector */}
        <section id="preset-selector-section" className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>テスト用検証シナリオ (1クリックで読込・即時分析):</span>
            </div>
            <span className="hidden sm:inline text-slate-500">
              ※ 特殊詐欺電話、AI偽装CEOメール、国税庁フィッシング、正常文など
            </span>
          </div>

          <div
            id="preset-button-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5"
          >
            {SAMPLE_TRANSCRIPTS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`preset-btn-${preset.id}`}
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-2.5 rounded-lg border transition-all duration-200 flex flex-col justify-between group ${
                    isSelected
                      ? "bg-indigo-950/40 border-indigo-500/70 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/50"
                      : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          preset.tagColor === "red"
                            ? "bg-red-950/80 text-red-300 border border-red-800/80"
                            : preset.tagColor === "purple"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/80"
                            : preset.tagColor === "amber"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-800/80"
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {preset.title}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Input & Execution Section */}
        <section
          id="input-section"
          className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <FileSearch className="w-4 h-4 text-indigo-400" />
              <label
                htmlFor="transcript-textarea"
                className="text-sm font-semibold text-white"
              >
                分析対象のメッセージ / 特殊詐欺トランスクリプト (user_input)
              </label>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 font-mono">
                {transcript.length} 文字
              </span>
              <button
                id="clear-input-button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                クリア
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="transcript-textarea"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                setSelectedPresetId("");
              }}
              rows={5}
              placeholder="ここに特殊詐欺の通話文字起こし、不審なメール本文、SNSメッセージ、またはチャット内容を貼り付けてください..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono placeholder:text-slate-600 outline-none transition"
            />
          </div>

          {/* Action Button & Help */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                TypeSafe AI (JEV System One) が型付き判断・確率分布を即座に推論し、スコアと座標をプロットします。
              </span>
            </div>

            <button
              id="analyze-submit-button"
              onClick={() => handleAnalyze()}
              disabled={loading || !transcript.trim()}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 transition-all duration-150"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>JEV分析中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Dual-Spectrum 分析を実行</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div
              id="error-banner"
              className="p-3.5 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs flex items-start space-x-2 mt-2"
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Loading Skeleton */}
        {loading && !result && (
          <div className="p-12 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-xl">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-200">
              TypeSafe JEV モデルによる Dual-Spectrum 分析を実行中...
            </p>
            <p className="text-xs text-slate-500">
              V-Triad (権威・恐怖・切迫感) および生成AI無菌トーン・構造硬直性を推論しています
            </p>
          </div>
        )}

        {/* Results Visualizer Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Section 1: Threat Score Gauge */}
            <section id="threat-gauge-section">
              <ThreatGauge
                score={result.threatScore}
                tier={result.threatTier}
                tierLabel={result.threatTierLabel}
                confidence={result.confidence}
              />
            </section>

            {/* Section 2: Spectrum Breakdown (Spectrum 1: V-Triad & Spectrum 2: GenAI Anomalies) */}
            <section id="spectrum-breakdown-container">
              <SpectrumBreakdown data={result} />
            </section>

            {/* Section 3: Phishing Threat Analysis Report & Counter-Measures */}
            <section id="threat-report-container">
              <ReportView data={result} />
            </section>

            {/* Section 4: JEV Diagnostics Drawer (Auditability & Machine Probabilities) */}
            <section id="diagnostics-drawer-container">
              <JevDiagnosticsDrawer jevRaw={result.jevRaw} />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Dual-Spectrum Phishing Guardian &bull; Powered by TypeSafe AI (JEV System One)
          </span>
          <span className="font-mono text-[11px] text-slate-600">
            Social Engineering Detector / Incident Response Tool
          </span>
        </div>
      </footer>
    </div>
  );
}
