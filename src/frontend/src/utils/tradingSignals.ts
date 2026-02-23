import type { TechnicalIndicators } from './technicalIndicators';

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  indicator: string;
}

export function generateTradingSignals(indicators: TechnicalIndicators): TradingSignal[] {
  const signals: TradingSignal[] = [];

  // RSI signals
  if (indicators.rsi < 30) {
    signals.push({
      type: 'buy',
      reason: 'RSI indicates oversold conditions',
      confidence: 'high',
      indicator: 'RSI',
    });
  } else if (indicators.rsi > 70) {
    signals.push({
      type: 'sell',
      reason: 'RSI indicates overbought conditions',
      confidence: 'high',
      indicator: 'RSI',
    });
  }

  // MACD signals
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    signals.push({
      type: 'buy',
      reason: 'Bullish MACD crossover detected',
      confidence: 'medium',
      indicator: 'MACD',
    });
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    signals.push({
      type: 'sell',
      reason: 'Bearish MACD crossover detected',
      confidence: 'medium',
      indicator: 'MACD',
    });
  }

  if (signals.length === 0) {
    signals.push({
      type: 'hold',
      reason: 'No strong signals detected',
      confidence: 'low',
      indicator: 'Overall',
    });
  }

  return signals;
}
