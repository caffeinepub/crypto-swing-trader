import type { CandlestickPattern } from "./candlestickPatterns";
import type { SupportResistanceLevel } from "./supportResistance";
import type { TechnicalIndicators } from "./technicalIndicators";
import type { TradingSignal } from "./tradingSignals";

export interface TakeProfitTarget {
  label: "Conservative" | "Moderate" | "Aggressive";
  price: number;
  percentage: number;
}

export interface TradeRecommendation {
  entryPoint: number;
  entryReasoning: string;
  takeProfitTargets: TakeProfitTarget[];
  stopLoss: number;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  reasoning: string;
  direction: "buy" | "sell" | "hold";
  /** Risk/Reward ratio: potential reward (to best TP) divided by risk (to stop-loss). Higher is better. */
  riskReward: number;
}

export function generateTradeRecommendation(
  currentPrice: number,
  signals: TradingSignal[],
  indicators: TechnicalIndicators,
  patterns: CandlestickPattern[],
  supportLevels: number[],
  resistanceLevels: number[],
): TradeRecommendation {
  // Determine overall direction from signals
  const buySignals = signals.filter((s) => s.type === "buy");
  const sellSignals = signals.filter((s) => s.type === "sell");
  const direction =
    buySignals.length > sellSignals.length
      ? "buy"
      : sellSignals.length > buySignals.length
        ? "sell"
        : "hold";

  // Calculate confidence score (0-100)
  let confidence = 50;
  const reasoningParts: string[] = [];

  // RSI contribution
  if (indicators.rsi < 30) {
    confidence += 15;
    reasoningParts.push("RSI shows oversold conditions (strong buy signal)");
  } else if (indicators.rsi > 70) {
    confidence += 15;
    reasoningParts.push("RSI shows overbought conditions (strong sell signal)");
  } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
    confidence += 5;
    reasoningParts.push("RSI is neutral");
  }

  // MACD contribution — reward true crossovers more
  const prevHist = indicators.macd.prevHistogram;
  const currHist = indicators.macd.histogram;
  if (prevHist <= 0 && currHist > 0) {
    confidence += 20;
    reasoningParts.push("MACD bullish crossover (strong momentum signal)");
  } else if (prevHist >= 0 && currHist < 0) {
    confidence += 20;
    reasoningParts.push("MACD bearish crossover (strong momentum signal)");
  } else if (currHist > 0 && indicators.macd.macd > indicators.macd.signal) {
    confidence += 10;
    reasoningParts.push("MACD shows bullish momentum");
  } else if (currHist < 0 && indicators.macd.macd < indicators.macd.signal) {
    confidence += 10;
    reasoningParts.push("MACD shows bearish momentum");
  }

  // Pattern contribution
  const bullishPatterns = patterns.filter((p) => p.type === "bullish");
  const bearishPatterns = patterns.filter((p) => p.type === "bearish");
  if (bullishPatterns.length > 0 && direction === "buy") {
    confidence += 10;
    reasoningParts.push(
      `Detected ${bullishPatterns.length} bullish pattern(s): ${bullishPatterns.map((p) => p.name).join(", ")}`,
    );
  } else if (bearishPatterns.length > 0 && direction === "sell") {
    confidence += 10;
    reasoningParts.push(
      `Detected ${bearishPatterns.length} bearish pattern(s): ${bearishPatterns.map((p) => p.name).join(", ")}`,
    );
  }

  // Bollinger Bands contribution
  if (currentPrice < indicators.bollingerBands.lower && direction === "buy") {
    confidence += 10;
    reasoningParts.push(
      "Price is below lower Bollinger Band (potential bounce)",
    );
  } else if (
    currentPrice > indicators.bollingerBands.upper &&
    direction === "sell"
  ) {
    confidence += 10;
    reasoningParts.push(
      "Price is above upper Bollinger Band (potential pullback)",
    );
  }

  // Cap confidence at 100
  confidence = Math.min(confidence, 100);

  // Determine entry point
  let entryPoint = currentPrice;
  let entryReasoning = "";

  if (direction === "buy") {
    const supportsBelow = supportLevels
      .filter((s) => s < currentPrice * 1.02)
      .sort((a, b) => b - a);
    if (supportsBelow.length > 0) {
      entryPoint = Math.min(currentPrice, supportsBelow[0] * 1.005);
      entryReasoning = `Entry near support at $${supportsBelow[0].toLocaleString(undefined, { maximumFractionDigits: 2 })} — price likely to bounce here`;
    } else {
      entryPoint = currentPrice;
      entryReasoning =
        "Entry at current price — no nearby support identified, use tight stop-loss";
    }
  } else if (direction === "sell") {
    const resistancesAbove = resistanceLevels
      .filter((r) => r > currentPrice * 0.98)
      .sort((a, b) => a - b);
    if (resistancesAbove.length > 0) {
      entryPoint = Math.max(currentPrice, resistancesAbove[0] * 0.995);
      entryReasoning = `Entry near resistance at $${resistancesAbove[0].toLocaleString(undefined, { maximumFractionDigits: 2 })} — price likely to reverse here`;
    } else {
      entryPoint = currentPrice;
      entryReasoning =
        "Entry at current price — no nearby resistance identified, use tight stop-loss";
    }
  } else {
    entryReasoning =
      "No clear entry signal — wait for RSI or MACD to give a stronger reading";
  }

  // Calculate take-profit targets
  const takeProfitTargets: TakeProfitTarget[] = [];

  if (direction === "buy") {
    const resistancesAboveEntry = resistanceLevels
      .filter((r) => r > entryPoint)
      .sort((a, b) => a - b);

    if (resistancesAboveEntry.length >= 3) {
      takeProfitTargets.push({
        label: "Conservative",
        price: resistancesAboveEntry[0],
        percentage:
          ((resistancesAboveEntry[0] - entryPoint) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: resistancesAboveEntry[1],
        percentage:
          ((resistancesAboveEntry[1] - entryPoint) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: resistancesAboveEntry[2],
        percentage:
          ((resistancesAboveEntry[2] - entryPoint) / entryPoint) * 100,
      });
    } else if (resistancesAboveEntry.length > 0) {
      takeProfitTargets.push({
        label: "Conservative",
        price: resistancesAboveEntry[0],
        percentage:
          ((resistancesAboveEntry[0] - entryPoint) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: entryPoint * 1.1,
        percentage: 10,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: entryPoint * 1.2,
        percentage: 20,
      });
    } else {
      takeProfitTargets.push({
        label: "Conservative",
        price: entryPoint * 1.05,
        percentage: 5,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: entryPoint * 1.1,
        percentage: 10,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: entryPoint * 1.2,
        percentage: 20,
      });
    }
  } else if (direction === "sell") {
    const supportsBelowEntry = supportLevels
      .filter((s) => s < entryPoint)
      .sort((a, b) => b - a);

    if (supportsBelowEntry.length >= 3) {
      takeProfitTargets.push({
        label: "Conservative",
        price: supportsBelowEntry[0],
        percentage: ((entryPoint - supportsBelowEntry[0]) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: supportsBelowEntry[1],
        percentage: ((entryPoint - supportsBelowEntry[1]) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: supportsBelowEntry[2],
        percentage: ((entryPoint - supportsBelowEntry[2]) / entryPoint) * 100,
      });
    } else if (supportsBelowEntry.length > 0) {
      takeProfitTargets.push({
        label: "Conservative",
        price: supportsBelowEntry[0],
        percentage: ((entryPoint - supportsBelowEntry[0]) / entryPoint) * 100,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: entryPoint * 0.9,
        percentage: 10,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: entryPoint * 0.8,
        percentage: 20,
      });
    } else {
      takeProfitTargets.push({
        label: "Conservative",
        price: entryPoint * 0.95,
        percentage: 5,
      });
      takeProfitTargets.push({
        label: "Moderate",
        price: entryPoint * 0.9,
        percentage: 10,
      });
      takeProfitTargets.push({
        label: "Aggressive",
        price: entryPoint * 0.8,
        percentage: 20,
      });
    }
  } else {
    takeProfitTargets.push({
      label: "Conservative",
      price: currentPrice,
      percentage: 0,
    });
    takeProfitTargets.push({
      label: "Moderate",
      price: currentPrice,
      percentage: 0,
    });
    takeProfitTargets.push({
      label: "Aggressive",
      price: currentPrice,
      percentage: 0,
    });
  }

  // Calculate stop-loss
  let stopLoss = entryPoint;
  if (direction === "buy") {
    const supportBelowEntry = supportLevels
      .filter((s) => s < entryPoint)
      .sort((a, b) => b - a);
    stopLoss =
      supportBelowEntry.length > 0
        ? supportBelowEntry[0] * 0.99
        : entryPoint * 0.96;
  } else if (direction === "sell") {
    const resistanceAboveEntry = resistanceLevels
      .filter((r) => r > entryPoint)
      .sort((a, b) => a - b);
    stopLoss =
      resistanceAboveEntry.length > 0
        ? resistanceAboveEntry[0] * 1.01
        : entryPoint * 1.04;
  } else {
    stopLoss = currentPrice * 0.95;
  }

  // Risk/Reward ratio — use the Moderate TP target as benchmark
  let riskReward = 0;
  if (direction !== "hold" && takeProfitTargets.length >= 2) {
    const moderateTP = takeProfitTargets[1];
    const risk = Math.abs(entryPoint - stopLoss);
    const reward = Math.abs(moderateTP.price - entryPoint);
    riskReward = risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0;
  }

  // Determine risk level
  const bbWidth =
    indicators.bollingerBands.middle > 0
      ? ((indicators.bollingerBands.upper - indicators.bollingerBands.lower) /
          indicators.bollingerBands.middle) *
        100
      : 5;
  let riskLevel: "low" | "medium" | "high";
  if (bbWidth > 8) riskLevel = "high";
  else if (bbWidth > 4) riskLevel = "medium";
  else riskLevel = "low";

  const reasoning =
    reasoningParts.length > 0
      ? `${reasoningParts.join(". ")}.`
      : "Insufficient data for strong recommendation. Wait for clearer signals before entering.";

  return {
    entryPoint,
    entryReasoning,
    takeProfitTargets,
    stopLoss,
    confidence,
    riskLevel,
    reasoning,
    direction,
    riskReward,
  };
}
