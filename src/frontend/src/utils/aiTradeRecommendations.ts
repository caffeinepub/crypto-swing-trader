import type { TechnicalIndicators } from './technicalIndicators';
import type { TradingSignal } from './tradingSignals';
import type { CandlestickPattern } from './candlestickPatterns';
import type { SupportResistanceLevel } from './supportResistance';

export interface TakeProfitTarget {
  label: 'Conservative' | 'Moderate' | 'Aggressive';
  price: number;
  percentage: number;
}

export interface TradeRecommendation {
  entryPoint: number;
  entryReasoning: string;
  takeProfitTargets: TakeProfitTarget[];
  stopLoss: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
  direction: 'buy' | 'sell' | 'hold';
}

export function generateTradeRecommendation(
  currentPrice: number,
  signals: TradingSignal[],
  indicators: TechnicalIndicators,
  patterns: CandlestickPattern[],
  supportLevels: number[],
  resistanceLevels: number[]
): TradeRecommendation {
  // Determine overall direction from signals
  const buySignals = signals.filter((s) => s.type === 'buy');
  const sellSignals = signals.filter((s) => s.type === 'sell');
  const direction = buySignals.length > sellSignals.length ? 'buy' : sellSignals.length > buySignals.length ? 'sell' : 'hold';

  // Calculate confidence score (0-100)
  let confidence = 50;
  const reasoningParts: string[] = [];

  // RSI contribution
  if (indicators.rsi < 30) {
    confidence += 15;
    reasoningParts.push('RSI shows oversold conditions (strong buy signal)');
  } else if (indicators.rsi > 70) {
    confidence += 15;
    reasoningParts.push('RSI shows overbought conditions (strong sell signal)');
  } else if (indicators.rsi >= 40 && indicators.rsi <= 60) {
    confidence += 5;
    reasoningParts.push('RSI is neutral');
  }

  // MACD contribution
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    confidence += 15;
    reasoningParts.push('MACD shows bullish momentum');
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    confidence += 15;
    reasoningParts.push('MACD shows bearish momentum');
  }

  // Pattern contribution
  const bullishPatterns = patterns.filter((p) => p.type === 'bullish');
  const bearishPatterns = patterns.filter((p) => p.type === 'bearish');
  if (bullishPatterns.length > 0 && direction === 'buy') {
    confidence += 10;
    reasoningParts.push(`Detected ${bullishPatterns.length} bullish pattern(s): ${bullishPatterns.map(p => p.name).join(', ')}`);
  } else if (bearishPatterns.length > 0 && direction === 'sell') {
    confidence += 10;
    reasoningParts.push(`Detected ${bearishPatterns.length} bearish pattern(s): ${bearishPatterns.map(p => p.name).join(', ')}`);
  }

  // Bollinger Bands contribution
  if (currentPrice < indicators.bollingerBands.lower && direction === 'buy') {
    confidence += 10;
    reasoningParts.push('Price is below lower Bollinger Band (potential bounce)');
  } else if (currentPrice > indicators.bollingerBands.upper && direction === 'sell') {
    confidence += 10;
    reasoningParts.push('Price is above upper Bollinger Band (potential pullback)');
  }

  // Cap confidence at 100
  confidence = Math.min(confidence, 100);

  // Determine entry point
  let entryPoint = currentPrice;
  let entryReasoning = '';

  if (direction === 'buy') {
    // For buy, look for entry near support
    const nearestSupport = supportLevels.length > 0 
      ? supportLevels.reduce((prev, curr) => 
          Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
        )
      : currentPrice * 0.98;
    
    entryPoint = Math.min(currentPrice, nearestSupport * 1.005);
    entryReasoning = supportLevels.length > 0 
      ? `Entry near support level at $${nearestSupport.toFixed(2)}`
      : 'Entry at current price with tight stop-loss';
  } else if (direction === 'sell') {
    // For sell, look for entry near resistance
    const nearestResistance = resistanceLevels.length > 0
      ? resistanceLevels.reduce((prev, curr) =>
          Math.abs(curr - currentPrice) < Math.abs(prev - currentPrice) ? curr : prev
        )
      : currentPrice * 1.02;
    
    entryPoint = Math.max(currentPrice, nearestResistance * 0.995);
    entryReasoning = resistanceLevels.length > 0
      ? `Entry near resistance level at $${nearestResistance.toFixed(2)}`
      : 'Entry at current price with tight stop-loss';
  } else {
    entryReasoning = 'No clear entry signal - wait for confirmation';
  }

  // Calculate take-profit targets
  const takeProfitTargets: TakeProfitTarget[] = [];
  if (direction === 'buy') {
    takeProfitTargets.push({
      label: 'Conservative',
      price: entryPoint * 1.06,
      percentage: 6,
    });
    takeProfitTargets.push({
      label: 'Moderate',
      price: entryPoint * 1.12,
      percentage: 12,
    });
    takeProfitTargets.push({
      label: 'Aggressive',
      price: entryPoint * 1.25,
      percentage: 25,
    });
  } else if (direction === 'sell') {
    takeProfitTargets.push({
      label: 'Conservative',
      price: entryPoint * 0.94,
      percentage: 6,
    });
    takeProfitTargets.push({
      label: 'Moderate',
      price: entryPoint * 0.88,
      percentage: 12,
    });
    takeProfitTargets.push({
      label: 'Aggressive',
      price: entryPoint * 0.75,
      percentage: 25,
    });
  } else {
    // Hold - no targets
    takeProfitTargets.push({
      label: 'Conservative',
      price: currentPrice,
      percentage: 0,
    });
    takeProfitTargets.push({
      label: 'Moderate',
      price: currentPrice,
      percentage: 0,
    });
    takeProfitTargets.push({
      label: 'Aggressive',
      price: currentPrice,
      percentage: 0,
    });
  }

  // Calculate stop-loss
  let stopLoss = entryPoint;
  if (direction === 'buy') {
    // Find nearest support below entry
    const supportBelowEntry = supportLevels.filter((s) => s < entryPoint);
    stopLoss = supportBelowEntry.length > 0
      ? Math.max(...supportBelowEntry) * 0.99
      : entryPoint * 0.96; // 4% stop-loss if no support
  } else if (direction === 'sell') {
    // Find nearest resistance above entry
    const resistanceAboveEntry = resistanceLevels.filter((r) => r > entryPoint);
    stopLoss = resistanceAboveEntry.length > 0
      ? Math.min(...resistanceAboveEntry) * 1.01
      : entryPoint * 1.04; // 4% stop-loss if no resistance
  } else {
    stopLoss = currentPrice * 0.95; // Default 5% stop for hold
  }

  // Determine risk level based on volatility (using Bollinger Band width as proxy)
  const bbWidth = ((indicators.bollingerBands.upper - indicators.bollingerBands.lower) / indicators.bollingerBands.middle) * 100;
  let riskLevel: 'low' | 'medium' | 'high';
  if (bbWidth > 8) {
    riskLevel = 'high';
  } else if (bbWidth > 4) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Build final reasoning
  const reasoning = reasoningParts.length > 0
    ? reasoningParts.join('. ') + '.'
    : 'Insufficient data for strong recommendation. Consider waiting for clearer signals.';

  return {
    entryPoint,
    entryReasoning,
    takeProfitTargets,
    stopLoss,
    confidence,
    riskLevel,
    reasoning,
    direction,
  };
}
