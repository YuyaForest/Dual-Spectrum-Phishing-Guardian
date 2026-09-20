/**
 * Dual-Spectrum Phishing Guardian
 * Server-side analysis service using TypeSafe AI (JEV System One) only.
 * High-speed inference without Gemini API dependencies.
 */
import { TypeSafeClient, score, noul, choice } from "@typesafe-ai/sdk";

export interface AnalysisRequest {
  transcript: string;
}

export interface JevScoreAnswer {
  score: number;
  confidence: number;
  legend: Record<string, string>;
  probabilities: Record<string, number>;
}

export interface JevNoulAnswer {
  noul: number;
}

export interface JevChoiceAnswer {
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface DualSpectrumResult {
  threatScore: number; // 0 - 100
  threatTier: "Safe" | "Suspicious" | "Malicious";
  threatTierLabel: string; // e.g. "[61-100] Malicious (悪意あり / フィッシングの可能性大)"
  confidence: number; // 0.0 - 1.0

  // Dual-Spectrum Coordinates for Plotting (0 - 100 each)
  coordinates: {
    xTraditional: number; // 0 - 100 (Traditional SE Vectors)
    yGenAI: number; // 0 - 100 (GenAI Anomalies)
    quadrant: string;
    quadrantDescription: string;
  };

  // Detailed breakdowns for each spectrum
  spectrum1_traditional: {
    score: number; // 0 - 100
    detectedVectors: string[];
    vtriad: {
      authority: { score: number; label: string; probability: number };
      fear: { score: number; label: string; probability: number };
      urgency: { score: number; label: string; probability: number };
    };
    brokenLanguage: { score: number; label: string };
    genericTargeting: { detected: boolean; probability: number };
    summary: string;
  };

  spectrum2_genai: {
    score: number; // 0 - 100
    detectedAnomalies: string[];
    vanillaTone: { score: number; label: string; probability: number };
    structuralRigidity: { score: number; label: string; probability: number };
    temporalBlindness: { score: number; label: string; probability: number };
    emotionalInflation: { score: number; label: string; probability: number };
    summary: string;
  };

  primaryArchetype: string;

  // Complete Report (#1, #2, #3, #4)
  report: {
    rawMarkdown: string;
    threatScoreSection: string;
    spectrumAnalysisSection: {
      traditional: string;
      genai: string;
    };
    verdict: string;
    quadrantVerdict: {
      quadrantId: "Q1" | "Q2" | "Q3" | "Q4";
      quadrantTitle: string;
      coordinatesText: string;
      patternName: string;
      verdictText: string;
    };
    counterMeasures: {
      strategy: string;
      explanationPoints: Array<{
        title: string;
        explanation: string;
      }>;
      table: Array<{
        attackerScenario: string;
        exceptionInjection: string;
        systemImpact: string;
        whyItWorks: string;
      }>;
    };
  };

  // Raw JEV payload for auditing & diagnostic inspect
  jevRaw: {
    model: string;
    answers: Record<string, any>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
}

export async function analyzeTranscript(transcript: string): Promise<DualSpectrumResult> {
  const trimmed = transcript.trim();
  if (!trimmed) {
    throw new Error("Transcript text cannot be empty.");
  }

  const apiKey = process.env.TYPESAFE_API_KEY;
  if (!apiKey) {
    throw new Error("TYPESAFE_API_KEY environment variable is not configured.");
  }

  const client = new TypeSafeClient({ apiKey });

  // 1. Evaluate with TypeSafe JEV System One model (Single fast typed inference)
  const jevResponse = await client.systemOne({
    state: trimmed,
    model: "jev-latest",
    questions: {
      // Overall Threat level
      threat_tier: score(
        "Evaluate the overall phishing, social engineering, or fraudulent threat level of this text.",
        [
          "Safe (0-20): Normal legitimate communication with no deceitful or fraudulent intent",
          "Suspicious (21-60): Unusual elements, questionable claims, mild urgency, or abnormal patterns requiring caution",
          "Malicious (61-100): Clear indicators of phishing, fraudulent extortion, false authority, or social engineering exploit"
        ]
      ),

      is_phishing_or_scam: noul(
        "Is this communication a social engineering exploit, fraudulent attempt, or phishing attack?"
      ),

      // Spectrum 1: Traditional SE Vectors
      s1_broken_language: score(
        "Evaluate presence of broken language, translation artifacts, stiff honorifics, or unnatural phrasing.",
        [
          "Fluent and natural native phrasing with expected natural cadence",
          "Subtle awkward phrasing, translation-like syntax, or stiff honorifics",
          "Obvious grammatical errors, unnatural machine translation, or broken phrasing"
        ]
      ),

      s1_vtriad_authority: score(
        "Evaluate presence and intensity of false authority (impersonating police, prosecutors, tax bureau, bank security, Microsoft/tech support engineer, or executive).",
        [
          "None: No false authority claim or legitimate identified context",
          "Moderate: Generic institutional pressure, vague official claim, or tech support agent",
          "High: Aggressive authority posturing (police investigator, Microsoft/IT official engineer, criminal case, asset freeze, executive decree)"
        ]
      ),

      s1_vtriad_fear: score(
        "Evaluate presence and intensity of intimidation, computer virus panic, data loss, arrest, legal threat, asset seizure, or fear triggers.",
        [
          "None: No intimidation or fear triggers",
          "Moderate: Mild warning of account restriction or service limit",
          "High: Severe intimidation (immediate virus infection alert, data destruction, criminal charges, asset freeze, police warrant)"
        ]
      ),

      s1_vtriad_urgency: score(
        "Evaluate presence and intensity of artificial urgency or panic deadlines (e.g. do not turn off PC, call immediately, within 24 hours, today by 3pm).",
        [
          "None: Realistic, relaxed, or normal timeframe",
          "Moderate: Stated deadline within a few days",
          "High: Extreme artificial panic deadline (do not turn off PC, call immediately, within 24 hours, do not delay)"
        ]
      ),

      s1_generic_targeting: noul(
        "Is this message using generic impersonal targeting (lacking personal connection, blanket blast)?"
      ),

      // Spectrum 2: GenAI Anomalies
      s2_vanilla_tone: score(
        "Evaluate presence of sterile 'Vanilla Tone' (sanitized, zero-defect politeness, lack of human colloquialism, textbook perfection).",
        [
          "Organic human voice with natural quirks, warmth, or informal cadence",
          "Standard formal business Japanese",
          "Sterile zero-defect 'Vanilla Tone' - sanitized textbook perfection lacking all human idiosyncrasies"
        ]
      ),

      s2_structural_rigidity: score(
        "Evaluate structural rigidity (formulaic LLM layout: Greeting -> Context -> structured bullet points -> formal wrap-up).",
        [
          "Fluid organic conversational flow",
          "Standard business format",
          "Rigid textbook LLM structure (formulaic opening, numbered/bulleted list of 3 items, unvarying cadence)"
        ]
      ),

      s2_temporal_blindness: score(
        "Evaluate temporal or situational blindness (absence of immediate real-world recent context, internal project nuance, or shared current facts).",
        [
          "Grounded in specific real-world timeline, recent internal context, or verified shared history",
          "General context",
          "Noticeable contextual void: detached from recent company/personal facts, relying on generic assertions"
        ]
      ),

      s2_emotional_inflation: score(
        "Evaluate emotional-logical mismatch (sterile corporate wording suddenly disrupted by high-stress panicked demands or financial transfers).",
        [
          "Tonal and emotional consistency throughout",
          "Mild urgency aligned with content",
          "Striking dissonance: polished textbook prose abruptly demanding urgent secrecy, money transfer, or emergency compliance"
        ]
      ),

      // Attack archetype
      primary_archetype: choice(
        "Which threat archetype best describes the core scenario of this text?",
        {
          special_fraud_police: "Special fraud / phone scam impersonating police, prosecutor, or government claiming criminal investigation or account freeze",
          tech_support_scam: "Tech support scam / fake security alarm claiming malware infection, locking PC, or demanding gift cards/remote access",
          bank_account_phishing: "Bank or service phishing claiming unauthorized access, security suspension, or credential verification",
          ai_ceo_spear_phishing: "Polished AI spear-phishing or CEO fraud requesting urgent confidential fund transfer or confidential handling",
          tax_or_fine_scam: "Tax bureau or penalty scam threatening asset seizure or overdue charges",
          it_security_mfa_scam: "Internal IT, MFA re-sync, or SSO credential reset alert threatening access cutoff",
          generic_phishing_link: "Generic phishing notification directing to external login or payment site",
          legitimate_safe: "Normal benign communication, interpersonal note, or standard operational notice"
        }
      )
    }
  });

  const answers = jevResponse.answers as Record<string, any>;

  // Helper to extract normalized 0.0 - 1.0 probability of presence from Jev 3-level score
  const extractScoreIntensity = (answer: any): number => {
    if (!answer) return 0;
    if (answer.probabilities) {
      const p1 = Number(answer.probabilities["1"] ?? 0);
      const p2 = Number(answer.probabilities["2"] ?? 0);
      return Math.min(1.0, p1 * 0.5 + p2 * 1.0);
    }
    const val = Number(answer.score ?? 0);
    return Math.min(1.0, val / 2.0);
  };

  // Spectrum 1: Traditional Signals
  const s1AuthorityNorm = extractScoreIntensity(answers.s1_vtriad_authority);
  const s1FearNorm = extractScoreIntensity(answers.s1_vtriad_fear);
  const s1UrgencyNorm = extractScoreIntensity(answers.s1_vtriad_urgency);
  const s1BrokenNorm = extractScoreIntensity(answers.s1_broken_language);
  const s1GenericNorm = Number(answers.s1_generic_targeting?.noul ?? 0);

  // Spectrum 2: GenAI Signals
  const s2VanillaNorm = extractScoreIntensity(answers.s2_vanilla_tone);
  const s2RigidityNorm = extractScoreIntensity(answers.s2_structural_rigidity);
  const s2BlindnessNorm = extractScoreIntensity(answers.s2_temporal_blindness);
  const s2InflationNorm = extractScoreIntensity(answers.s2_emotional_inflation);

  // Traditional SE composite score (0 - 100)
  const traditionalComposite =
    s1AuthorityNorm * 0.32 +
    s1FearNorm * 0.28 +
    s1UrgencyNorm * 0.24 +
    s1BrokenNorm * 0.10 +
    s1GenericNorm * 0.06;
  const traditionalScore = Math.min(100, Math.max(0, Math.round(traditionalComposite * 100)));

  // GenAI Anomaly composite score (0 - 100)
  const genaiComposite =
    s2VanillaNorm * 0.30 +
    s2RigidityNorm * 0.25 +
    s2BlindnessNorm * 0.25 +
    s2InflationNorm * 0.20;
  const genaiScore = Math.min(100, Math.max(0, Math.round(genaiComposite * 100)));

  // JEV Threat Tier & Threat Score
  const rawTierScore = Number(answers.threat_tier?.score ?? 0);
  const tierProbs = answers.threat_tier?.probabilities ?? {};
  const pSafe = Number(tierProbs["0"] ?? 0);
  const pSuspicious = Number(tierProbs["1"] ?? 0);
  const pMalicious = Number(tierProbs["2"] ?? 0);

  const isPhishingProb = Number(answers.is_phishing_or_scam?.noul ?? 0);
  const confidence = Number(answers.threat_tier?.confidence ?? 0.85);

  let rawCalculatedScore: number;
  if (pMalicious > 0.4 || isPhishingProb > 0.7) {
    const base = 61 + (pMalicious * 25 + isPhishingProb * 14);
    rawCalculatedScore = Math.min(100, base);
  } else if (pSuspicious > 0.35 || isPhishingProb > 0.3) {
    const base = 21 + (pSuspicious * 25 + isPhishingProb * 14);
    rawCalculatedScore = Math.min(60, base);
  } else {
    rawCalculatedScore = Math.max(0, Math.min(20, (1 - pSafe) * 20));
  }

  const threatScore = Math.round(rawCalculatedScore);

  let threatTier: "Safe" | "Suspicious" | "Malicious";
  let threatTierLabel: string;
  if (threatScore <= 20) {
    threatTier = "Safe";
    threatTierLabel = "[0-20] Safe (安全)";
  } else if (threatScore <= 60) {
    threatTier = "Suspicious";
    threatTierLabel = "[21-60] Suspicious (要警戒)";
  } else {
    threatTier = "Malicious";
    threatTierLabel = "[61-100] Malicious (悪意あり / フィッシングの可能性大)";
  }

  // 2D Scatter Quadrant Assignment
  let quadrant: string;
  let quadrantDescription: string;
  let quadrantId: "Q1" | "Q2" | "Q3" | "Q4";
  const isHighTraditional = traditionalScore >= 45;
  const isHighGenAI = genaiScore >= 45;

  if (isHighTraditional && isHighGenAI) {
    quadrantId = "Q1";
    quadrant = "第1象限: Dual-Threat Vector (複合標的脅威)";
    quadrantDescription = "生成AI偽装（Vanilla Tone/硬直構成）× 従来型V-Triad（権威・恐怖・切迫感）の複合高度標的型攻撃";
  } else if (!isHighTraditional && isHighGenAI) {
    quadrantId = "Q2";
    quadrant = "第2象限: Stealth AI Disguise (生成AI偽装型)";
    quadrantDescription = "無菌状態の整った構文や定型箇条書きにより人間らしさを模倣したAI生成フィッシング";
  } else if (isHighTraditional && !isHighGenAI) {
    quadrantId = "Q4";
    quadrant = "第4象限: Classic Social Engineering (従来型SE / 特殊詐欺)";
    quadrantDescription = "警察・検察騙り、口座凍結の脅迫、または機械翻訳調など、典型的なソーシャルエンジニアリング";
  } else {
    quadrantId = "Q3";
    quadrant = "第3象限: Safe Zone (安全領域)";
    quadrantDescription = "重大な心理的誘導および生成AIの異常パターンが検出されない通常通信";
  }

  // Formulate List of Detected Vectors
  const traditionalVectors: string[] = [];
  if (s1AuthorityNorm > 0.4) {
    traditionalVectors.push(
      `V-Triad [権威の騙り] (強度: ${Math.round(s1AuthorityNorm * 100)}%) - 警察・検察・役員・金融機関等の権威を偽装`
    );
  }
  if (s1FearNorm > 0.4) {
    traditionalVectors.push(
      `V-Triad [恐怖・脅迫] (強度: ${Math.round(s1FearNorm * 100)}%) - 口座凍結・法的処罰・資産差押えの示唆`
    );
  }
  if (s1UrgencyNorm > 0.4) {
    traditionalVectors.push(
      `V-Triad [切迫感・時間的制約] (強度: ${Math.round(s1UrgencyNorm * 100)}%) - 24時間以内や即時対応の心理的強制`
    );
  }
  if (s1BrokenNorm > 0.4) {
    traditionalVectors.push(
      `Broken Language (不自然な言語) (強度: ${Math.round(s1BrokenNorm * 100)}%) - 直訳調または不自然な日本語構文`
    );
  }
  if (s1GenericNorm > 0.6) {
    traditionalVectors.push(`Generic Targeting (一般的宛名) (確率: ${Math.round(s1GenericNorm * 100)}%) - 固有宛先情報の欠如`);
  }

  const genaiAnomalies: string[] = [];
  if (s2VanillaNorm > 0.4) {
    genaiAnomalies.push(
      `Vanilla Tone (無菌状態のトーン) (強度: ${Math.round(s2VanillaNorm * 100)}%) - 誤字脱字のない過剰に整った教科書的敬語`
    );
  }
  if (s2RigidityNorm > 0.4) {
    genaiAnomalies.push(
      `Structural Rigidity (黄金比への固執) (強度: ${Math.round(s2RigidityNorm * 100)}%) - 「挨拶→背景→箇条書き3点→結び」の定型レイアウト`
    );
  }
  if (s2BlindnessNorm > 0.4) {
    genaiAnomalies.push(
      `Temporal Blindness (時間的・文脈的ラグ) (強度: ${Math.round(s2BlindnessNorm * 100)}%) - 直近の現場文脈や当事者間固有の文脈欠落`
    );
  }
  if (s2InflationNorm > 0.4) {
    genaiAnomalies.push(
      `Emotional Inflation (感情と論理の乖離) (強度: ${Math.round(s2InflationNorm * 100)}%) - 無菌ビジネス構文に突如インジェクトされた至急指示`
    );
  }

  const traditionalSummary = traditionalVectors.length > 0 ? traditionalVectors.join(" / ") : "None";
  const genaiSummary = genaiAnomalies.length > 0 ? genaiAnomalies.join(" / ") : "None";

  // Build the complete Report purely from TypeSafe JEV's answers (Fast, deterministic, highly specific)
  const report = buildJevReport({
    transcript: trimmed,
    threatScore,
    threatTier,
    threatTierLabel,
    traditionalScore,
    genaiScore,
    traditionalSummary,
    genaiSummary,
    traditionalVectors,
    genaiAnomalies,
    primaryArchetype: answers.primary_archetype?.choice ?? "unknown",
    quadrantId,
    quadrant,
    quadrantDescription,
    s1AuthorityNorm,
    s1FearNorm,
    s1UrgencyNorm,
    s2VanillaNorm,
    s2BlindnessNorm
  });

  return {
    threatScore,
    threatTier,
    threatTierLabel,
    confidence,
    coordinates: {
      xTraditional: traditionalScore,
      yGenAI: genaiScore,
      quadrant,
      quadrantDescription
    },
    spectrum1_traditional: {
      score: traditionalScore,
      detectedVectors: traditionalVectors,
      vtriad: {
        authority: {
          score: answers.s1_vtriad_authority?.score ?? 0,
          label: answers.s1_vtriad_authority?.legend?.[String(Math.round(answers.s1_vtriad_authority?.score ?? 0))] || "N/A",
          probability: s1AuthorityNorm
        },
        fear: {
          score: answers.s1_vtriad_fear?.score ?? 0,
          label: answers.s1_vtriad_fear?.legend?.[String(Math.round(answers.s1_vtriad_fear?.score ?? 0))] || "N/A",
          probability: s1FearNorm
        },
        urgency: {
          score: answers.s1_vtriad_urgency?.score ?? 0,
          label: answers.s1_vtriad_urgency?.legend?.[String(Math.round(answers.s1_vtriad_urgency?.score ?? 0))] || "N/A",
          probability: s1UrgencyNorm
        }
      },
      brokenLanguage: {
        score: answers.s1_broken_language?.score ?? 0,
        label: answers.s1_broken_language?.legend?.[String(Math.round(answers.s1_broken_language?.score ?? 0))] || "N/A"
      },
      genericTargeting: {
        detected: s1GenericNorm > 0.5,
        probability: s1GenericNorm
      },
      summary: traditionalSummary
    },
    spectrum2_genai: {
      score: genaiScore,
      detectedAnomalies: genaiAnomalies,
      vanillaTone: {
        score: answers.s2_vanilla_tone?.score ?? 0,
        label: answers.s2_vanilla_tone?.legend?.[String(Math.round(answers.s2_vanilla_tone?.score ?? 0))] || "N/A",
        probability: s2VanillaNorm
      },
      structuralRigidity: {
        score: answers.s2_structural_rigidity?.score ?? 0,
        label: answers.s2_structural_rigidity?.legend?.[String(Math.round(answers.s2_structural_rigidity?.score ?? 0))] || "N/A",
        probability: s2RigidityNorm
      },
      temporalBlindness: {
        score: answers.s2_temporal_blindness?.score ?? 0,
        label: answers.s2_temporal_blindness?.legend?.[String(Math.round(answers.s2_temporal_blindness?.score ?? 0))] || "N/A",
        probability: s2BlindnessNorm
      },
      emotionalInflation: {
        score: answers.s2_emotional_inflation?.score ?? 0,
        label: answers.s2_emotional_inflation?.legend?.[String(Math.round(answers.s2_emotional_inflation?.score ?? 0))] || "N/A",
        probability: s2InflationNorm
      },
      summary: genaiSummary
    },
    primaryArchetype: answers.primary_archetype?.choice ?? "unknown",
    report,
    jevRaw: {
      model: jevResponse.model,
      answers: jevResponse.answers,
      usage: jevResponse.usage
    }
  };
}

interface JevReportInput {
  transcript: string;
  threatScore: number;
  threatTier: "Safe" | "Suspicious" | "Malicious";
  threatTierLabel: string;
  traditionalScore: number;
  genaiScore: number;
  traditionalSummary: string;
  genaiSummary: string;
  traditionalVectors: string[];
  genaiAnomalies: string[];
  primaryArchetype: string;
  quadrantId: "Q1" | "Q2" | "Q3" | "Q4";
  quadrant: string;
  quadrantDescription: string;
  s1AuthorityNorm: number;
  s1FearNorm: number;
  s1UrgencyNorm: number;
  s2VanillaNorm: number;
  s2BlindnessNorm: number;
}

/**
 * Builds the Phishing Threat Analysis Report (Sections 1, 2, 3, 4)
 * Section 3: Guardian's Verdict is strictly determined by the 4 Quadrants of the Dual-Spectrum coordinate system.
 * Section 4: Counter-Measure is presented as an exemplary reference model with in-depth tactical explanations.
 */
function buildJevReport(input: JevReportInput) {
  // 4 Quadrant-based Verdict Patterns
  let quadrantTitle = "";
  let patternName = "";
  let verdict = "";

  switch (input.quadrantId) {
    case "Q1": // Dual-Threat Vector (右上: High Traditional SE & High GenAI)
      quadrantTitle = "第1象限: Dual-Threat Vector（複合型標的脅威 / 高度標的型攻撃）";
      patternName = "Dual-Threat Vector";
      verdict =
        `【第1象限判定：Dual-Threat Vector（複合型標的脅威）】\n` +
        `Traditional SE Vectors（従来型リスク: ${input.traditionalScore}/100）と GenAI Anomalies（生成AIリスク: ${input.genaiScore}/100）が共に警戒基準値（45点以上）を超過した最危険領域に位置しています。\n` +
        `生成AI特有の無菌的で過剰に整った教科書的敬語構文（Vanilla Tone）や黄金比的な箇条書き構成で人間らしさを装いながら、核心部分で「偽装権威・口座凍結等の恐怖・24時間以内の切迫感（V-Triad）」を巧妙に仕掛けています。一見完璧なビジネス文書や公的通知に見えますが、当事者間の微細な現場文脈が完全に欠落しており、至急の秘密行動・資金移動・認証入力を迫る高度標的型攻撃の典型パターンです。`;
      break;

    case "Q2": // Stealth AI Disguise (左上: Low Traditional SE & High GenAI)
      quadrantTitle = "第2象限: Stealth AI Disguise（生成AI偽装型 / ステルスAI攻撃）";
      patternName = "Stealth AI Disguise";
      verdict =
        `【第2象限判定：Stealth AI Disguise（生成AI偽装型）】\n` +
        `Traditional SE Vectors（従来型リスク: ${input.traditionalScore}/100）は低水準（45点未満）ですが、GenAI Anomalies（生成AIリスク: ${input.genaiScore}/100）が警戒基準値（45点以上）を検出している領域に位置しています。\n` +
        `露骨な脅迫や口座凍結といった激しい感情煽動は見られないものの、生成AI特有の無菌的トーン（Vanilla Tone・誤字脱字のない過剰に丁寧な敬語）や機械的な黄金比構成、直近の共有文脈の不自然な欠如が顕著です。相手の警戒心を解き、悪意あるリンクのクリックや偵察情報の開示を狙うステルス型AIフィッシングの疑いがあります。`;
      break;

    case "Q4": // Classic Social Engineering (右下: High Traditional SE & Low GenAI)
      quadrantTitle = "第4象限: Classic Social Engineering（従来型SE / 特殊詐欺）";
      patternName = "Classic Social Engineering";
      verdict =
        `【第4象限判定：Classic Social Engineering（従来型SE / 特殊詐欺）】\n` +
        `GenAI Anomalies（生成AIリスク: ${input.genaiScore}/100）は低水準（45点未満）ですが、Traditional SE Vectors（従来型リスク: ${input.traditionalScore}/100）が警戒基準値（45点以上）を強く検出している領域に位置しています。\n` +
        `警察・検察・金融機関等を騙る偽装権威、口座凍結や法的処罰を示唆する恐怖煽動、あるいは「本日中・24時間以内」といった人工的切迫感（V-Triad）が際立っています。文章の洗練度よりも人間の本能的なパニックを狙った、古典的なフィッシング詐欺または特殊詐欺シナリオです。`;
      break;

    case "Q3": // Safe Zone (左下: Low Traditional SE & Low GenAI)
    default:
      quadrantTitle = "第3象限: Safe Zone（安全領域 / 正常通信）";
      patternName = "Safe Zone";
      verdict =
        `【第3象限判定：Safe Zone（安全領域）】\n` +
        `Traditional SE Vectors（従来型リスク: ${input.traditionalScore}/100）および GenAI Anomalies（生成AIリスク: ${input.genaiScore}/100）がいずれも基準値（45点未満）に収まる安全領域に位置しています。\n` +
        `公的機関騙りや恐怖・切迫感（V-Triad）などの心理的誘導トリガーは観測されず、また生成AI特有の無菌構文や構造硬直性も認められません。文脈の整合性が保たれた通常のコミュニケーションまたは日常業務連絡と判定されます。`;
      break;
  }

  // Section 4: Counter-Measures are exemplary and decoupled from individual verdicts.
  // Explanatory points clarify WHY each technique is an effective defense.
  const explanationPoints = [
    {
      title: "1. 攻撃者のシナリオ（状態遷移マシン）の強制脱線",
      explanation:
        "攻撃者（電話詐欺師・AIボット）は『権威提示 → 恐怖・切迫感煽動 → 隔離・送金/入力強要』という一本道のシナリオ（スクリプト）に沿って相手を誘導します。マニュアルやモデルが想定していない『脱線した逆質問（例外）』を差し込むことで、攻撃側の状態遷移を論理エラーに陥らせ、進行を強制停止させます。"
    },
    {
      title: "2. 権威と情報の非対称性の逆転（トレーサビリティの要求）",
      explanation:
        "攻撃の優位性は『自分は匿名で、一方的に相手の情報を要求できる』という非対称性にあります。弁護士の名前、所属部署、直通電話番号、公的令状番号などを具体的に逆質問することで、攻撃者側に『身元特定・録音・追跡』のリスクを背負わせ、心理的・法的な主導権を瞬時に奪回します。"
    },
    {
      title: "3. 物理的本物権威の提示（コンテキストの強制書き換え）",
      explanation:
        "『今、地元の警察署の窓口にいる』『内線で直接自席へ行く』など、攻撃者が手出しできない本物の第三者や物理空間を会話に介入させると、発覚と現行犯逮捕のリスクが跳ね上がるため、攻撃者は自ら通話やセッションを切断せざるを得なくなります。"
    },
    {
      title: "4. 現場文脈による Turing Test（文脈断絶・ハルシネーション誘発）",
      explanation:
        "生成AIは教科書的で無菌な日本語（Vanilla Tone）を出力できますが、当事者間の『さっき内線で話した口頭の合言葉』や『現場固有の微細な事実』は知り得ません。架空のコード名でカマをかけることで、AIボットは適当な嘘を捏造（ハルシネーション）するか応答不能に陥り、なりすましが即座に瓦解します。"
    }
  ];

  const tableRows = [
    {
      attackerScenario: "「国の決まりで口座を凍結させていただきます」",
      exceptionInjection:
        "「分かりました。では、私の顧問弁護士の〇〇（適当な名前）からそちらの担当部署へ折り返しお電話させますので、あなたの【所属部署、氏名、直通の電話番号、および上司の方のお名前】を教えてください」",
      systemImpact:
        "【権威の逆転とトレーサビリティの要求】匿名性の盾を奪われ、法的な対抗措置をチラつかされることで、マニュアルにない文脈への対応を迫られ、会話が破綻します。",
      whyItWorks:
        "攻撃者が最も恐れる『第三者（弁護士）の介入』と『追跡可能な識別情報の提出』を突きつけることで、詐欺スクリプトが続行不能になります。"
    },
    {
      attackerScenario: "「第3者があなたの個人情報を利用して保険金申請を行いました」",
      exceptionInjection:
        "「ちょうど今、地元の警察署（あるいは該当の保険会社）の窓口に別件で来ているところですので、今すぐここの警察官（担当者）に電話を代わりますね」",
      systemImpact:
        "【コンテキストの強制書き換え（物理的脅威の提示）】背後に『本物の権威・警察』が存在することを突きつけられると、アクターは即座に発覚のリスクを恐れ、自ら通話を切断（プロセスをキル）せざるを得なくなります。",
      whyItWorks:
        "被害者を孤独な密室に追い込む攻撃空間を破壊し、本物の公的法執行官を目の前に召喚することで、相手の即時撤退を誘発します。"
    },
    {
      attackerScenario: "（流暢な標準語、丁寧な共感トーン / Vanilla Tone）",
      exceptionInjection:
        "「お電話が非常に遠いようなのですが、今どちらの国（またはコールセンター）からお電話されていますか？」",
      systemImpact:
        "【舞台裏への直接言及（メタ認知の強制）】『騙している側』という本質を突かれることで、無菌状態のビジネストーン（Vanilla Tone）を維持できなくなり、動揺を誘います。",
      whyItWorks:
        "整った接客構文をメタレベルで解体し、コールセンター現場や海外IPという隠したい実態に焦点を当てることで、スクリプトの前提を破壊します。"
    },
    {
      attackerScenario: "「役員指示に基づき至急極秘送金を依頼します / 社内他部署への口外禁止」",
      exceptionInjection:
        "「承知しました。本日の役員会終了直後に内線でお話しされた『例のプロジェクト確認コード』を念のため折り返し社内チャットにてお送りください。確認でき次第承認フローへ回します」",
      systemImpact:
        "【文脈断絶・ハルシネーションの誘発（Turing Test）】当事者間の現場共有事実を持たないAI/外部攻撃者は適当なコード名を捏造するか応答に窮し、なりすましが即座に瓦解します。",
      whyItWorks:
        "あえて架空の『合言葉』でカマをかけることで、本物の役員なら『そんなこと言ってない』と気付き、AIや攻撃者なら嘘を返して自滅します。"
    }
  ];

  const rawMarkdown = `# ⚠️ Phishing Threat Analysis Report

## 1. Threat Score (0-100)
- ${input.threatTierLabel} (スコア: ${input.threatScore}/100)

## 2. Spectrum Analysis
- **Spectrum 1: Traditional SE Vectors (従来型リスク):** ${input.traditionalSummary}
- **Spectrum 2: GenAI Anomalies (生成AIリスク):** ${input.genaiSummary}

## 3. Counter-Measure (対抗策の提案)
- ボットや攻撃者のスクリプトシナリオを瓦解させる「例外インジェクション（Turing Test）」および確認手順を以下に示します：

### なぜこれが対抗策となりうるのか（ポイント解説）
${explanationPoints.map((p) => `- **${p.title}**: ${p.explanation}`).join("\n")}

### 例外インジェクションの対比表（例示）
| 攻撃者のシナリオ進行 | 進行を崩す「例外インジェクション（カマをかける・脱線）」 | 攻撃者側のシステムエラー（影響） |
| --- | --- | --- |
${tableRows.map((r) => `| ${r.attackerScenario} | **${r.exceptionInjection}** | **${r.systemImpact}** |`).join("\n")}
`;

  return {
    rawMarkdown,
    threatScoreSection: `- ${input.threatTierLabel} (スコア: ${input.threatScore}/100)`,
    spectrumAnalysisSection: {
      traditional: input.traditionalSummary,
      genai: input.genaiSummary
    },
    verdict,
    quadrantVerdict: {
      quadrantId: input.quadrantId,
      quadrantTitle,
      coordinatesText: `X: ${input.traditionalScore} / Y: ${input.genaiScore}`,
      patternName,
      verdictText: verdict
    },
    counterMeasures: {
      strategy: "攻撃側のストラテジーやシナリオ、スクリプトを崩す例外インジェクション（Turing Test / カマをかける・脱線）",
      explanationPoints,
      table: tableRows
    }
  };
}
