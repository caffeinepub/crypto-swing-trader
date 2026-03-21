import type { TechnicalIndicators } from "./technicalIndicators";

export interface TradingSignal {
  type: "buy" | "sell" | "hold";
  reason: string;
  confidence: "high" | "medium" | "low";
  indicator: string;
}

export function generateTradingSignals(
  indicators: TechnicalIndicators,
  currentPrice?: number,
): TradingSignal[] {
  const signals: TradingSignal[] = [];

  // Divergence signals — highest priority, 35-point weight in composite score
  if (indicators.divergence?.bullish) {
    signals.push({
      type: "buy",
      reason: indicators.divergence.description,
      confidence: "high",
      indicator: "Divergence",
    });
  } else if (indicators.divergence?.bearish) {
    signals.push({
      type: "sell",
      reason: indicators.divergence.description,
      confidence: "high",
      indicator: "Divergence",
    });
  }

  // RSI signals
  if (indicators.rsi < 30) {
    signals.push({
      type: "buy",
      reason: `RSI oversold at ${indicators.rsi.toFixed(1)} — strong buy signal`,
      confidence: "high",
      indicator: "RSI",
    });
  } else if (indicators.rsi < 40) {
    signals.push({
      type: "buy",
      reason: `RSI at ${indicators.rsi.toFixed(1)} — approaching oversold territory`,
      confidence: "medium",
      indicator: "RSI",
    });
  } else if (indicators.rsi > 70) {
    signals.push({
      type: "sell",
      reason: `RSI overbought at ${indicators.rsi.toFixed(1)} — strong sell signal`,
      confidence: "high",
      indicator: "RSI",
    });
  } else if (indicators.rsi > 60) {
    signals.push({
      type: "sell",
      reason: `RSI at ${indicators.rsi.toFixed(1)} — approaching overbought territory`,
      confidence: "medium",
      indicator: "RSI",
    });
  }

  // MACD true crossover detection (histogram sign changed this bar)
  const prevHist = indicators.macd.prevHistogram;
  const currHist = indicators.macd.histogram;
  if (prevHist <= 0 && currHist > 0) {
    signals.push({
      type: "buy",
      reason: "MACD bullish crossover — momentum turning upward",
      confidence: "high",
      indicator: "MACD",
    });
  } else if (prevHist >= 0 && currHist < 0) {
    signals.push({
      type: "sell",
      reason: "MACD bearish crossover — momentum turning downward",
      confidence: "high",
      indicator: "MACD",
    });
  } else if (currHist > 0 && indicators.macd.macd > indicators.macd.signal) {
    signals.push({
      type: "buy",
      reason: "MACD above signal line — bullish momentum active",
      confidence: "medium",
      indicator: "MACD",
    });
  } else if (currHist < 0 && indicators.macd.macd < indicators.macd.signal) {
    signals.push({
      type: "sell",
      reason: "MACD below signal line — bearish momentum active",
      confidence: "medium",
      indicator: "MACD",
    });
  }

  // Moving Average crossover signals
  if (indicators.sma20 > 0 && indicators.sma50 > 0) {
    const ratio = indicators.sma20 / indicators.sma50;
    if (ratio >= 1.0 && ratio < 1.005) {
      signals.push({
        type: "buy",
        reason: "Golden cross — SMA20 above SMA50, bullish trend forming",
        confidence: "medium",
        indicator: "MA Cross",
      });
    } else if (ratio <= 1.0 && ratio > 0.995) {
      signals.push({
        type: "sell",
        reason: "Death cross — SMA20 below SMA50, bearish trend forming",
        confidence: "medium",
        indicator: "MA Cross",
      });
    }
  }

  // Bollinger Band breakout signals
  if (currentPrice !== undefined && indicators.bollingerBands.lower > 0) {
    if (currentPrice < indicators.bollingerBands.lower) {
      signals.push({
        type: "buy",
        reason:
          "Price below lower Bollinger Band — potential mean reversion bounce",
        confidence: "medium",
        indicator: "Bollinger",
      });
    } else if (currentPrice > indicators.bollingerBands.upper) {
      signals.push({
        type: "sell",
        reason:
          "Price above upper Bollinger Band — potential mean reversion pullback",
        confidence: "medium",
        indicator: "Bollinger",
      });
    }
  }

  if (signals.length === 0) {
    signals.push({
      type: "hold",
      reason: "No strong signals — market consolidating, wait for confirmation",
      confidence: "low",
      indicator: "Overall",
    });
  }

  return signals;
}

/**
 * Calculates a 0–100 composite signal score combining all active indicators.
 * Returns the score and dominant direction.
 */
export function calculateCompositeScore(
  indicators: TechnicalIndicators,
  currentPrice?: number,
): { score: number; direction: "buy" | "sell" | "neutral" } {
  let buyScore = 0;
  let sellScore = 0;

  // Divergence: 35 points (strongest signal)
  if (indicators.divergence?.bullish) buyScore += 35;
  if (indicators.divergence?.bearish) sellScore += 35;

  // MACD true crossover: 25 points; momentum continuation: 5 points
  const prevHist = indicators.macd.prevHistogram;
  const currHist = indicators.macd.histogram;
  if (prevHist <= 0 && currHist > 0) buyScore += 25;
  else if (prevHist >= 0 && currHist < 0) sellScore += 25;
  else if (currHist > 0) buyScore += 5;
  else if (currHist < 0) sellScore += 5;

  // RSI extreme: 20 points; approaching extreme: 8 points
  if (indicators.rsi < 30) buyScore += 20;
  else if (indicators.rsi < 40) buyScore += 8;
  else if (indicators.rsi > 70) sellScore += 20;
  else if (indicators.rsi > 60) sellScore += 8;

  // Bollinger Band break: 15 points
  if (currentPrice !== undefined && indicators.bollingerBands.lower > 0) {
    if (currentPrice < indicators.bollingerBands.lower) buyScore += 15;
    else if (currentPrice > indicators.bollingerBands.upper) sellScore += 15;
  }

  // MA cross (golden/death cross zone): 10 points
  if (indicators.sma20 > 0 && indicators.sma50 > 0) {
    const ratio = indicators.sma20 / indicators.sma50;
    if (ratio >= 1.0 && ratio < 1.005) buyScore += 10;
    else if (ratio <= 1.0 && ratio > 0.995) sellScore += 10;
  }

  const maxScore = 35 + 25 + 20 + 15 + 10; // 105
  const netBuy = buyScore - sellScore;

  if (netBuy > 5) {
    return { score: Math.round((buyScore / maxScore) * 100), direction: "buy" };
  }
  if (netBuy < -5) {
    return {
      score: Math.round((sellScore / maxScore) * 100),
      direction: "sell",
    };
  }
  return {
    score: Math.round((Math.max(buyScore, sellScore) / maxScore) * 100),
    direction: "neutral",
  };
}
