import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Sparkles, Clock, Target } from 'lucide-react';
import { generateTradeRecommendation, type TradeRecommendation } from '@/utils/aiTradeRecommendations';
import type { TechnicalIndicators } from '@/utils/technicalIndicators';
import type { TradingSignal } from '@/utils/tradingSignals';
import type { CandlestickPattern } from '@/utils/candlestickPatterns';
import type { SupportResistanceLevel } from '@/utils/supportResistance';

interface AITradeAnalysisCardProps {
  currentPrice: number;
  signals: TradingSignal[];
  indicators: TechnicalIndicators;
  patterns: CandlestickPattern[];
  supportResistance: SupportResistanceLevel[];
}

export default function AITradeAnalysisCard({
  currentPrice,
  signals,
  indicators,
  patterns,
  supportResistance,
}: AITradeAnalysisCardProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const recommendation = useMemo<TradeRecommendation>(() => {
    const supportLevels = supportResistance.filter((l) => l.type === 'support').map((l) => l.price);
    const resistanceLevels = supportResistance.filter((l) => l.type === 'resistance').map((l) => l.price);

    const result = generateTradeRecommendation(
      currentPrice,
      signals,
      indicators,
      patterns,
      supportLevels,
      resistanceLevels
    );

    setLastUpdated(new Date());
    return result;
  }, [currentPrice, signals, indicators, patterns, supportResistance]);

  const formatRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const [relativeTime, setRelativeTime] = useState(formatRelativeTime(lastUpdated));

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(lastUpdated));
    }, 30000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getDirectionIcon = () => {
    if (recommendation.direction === 'buy') return <TrendingUp className="h-5 w-5" />;
    if (recommendation.direction === 'sell') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getDirectionColor = () => {
    if (recommendation.direction === 'buy') return 'text-neon-green';
    if (recommendation.direction === 'sell') return 'text-neon-red';
    return 'text-muted-foreground';
  };

  const getRiskColor = () => {
    if (recommendation.riskLevel === 'low') return 'bg-neon-green/10 text-neon-green border-neon-green/30';
    if (recommendation.riskLevel === 'medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    return 'bg-neon-red/10 text-neon-red border-neon-red/30';
  };

  const getConfidenceColor = () => {
    if (recommendation.confidence >= 70) return 'text-neon-green';
    if (recommendation.confidence >= 50) return 'text-yellow-400';
    return 'text-neon-red';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  };

  const isHighConfidence = recommendation.confidence >= 70;

  return (
    <Card className={`border-2 border-neon-cyan/40 bg-gradient-to-br from-neon-cyan/5 via-background to-background relative overflow-hidden animate-fade-in ${isHighConfidence ? 'glow-pulse' : 'glow-ambient'}`}>
      <div className="absolute inset-0 scanline-effect opacity-30 pointer-events-none"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center gap-2 font-heading text-neon-cyan">
          <Sparkles className="h-5 w-5 text-neon-purple glow-icon" />
          AI Trade Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 relative z-10">
        {/* Recommended Action Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-neon-cyan/20">
          <span className="text-sm font-medium text-muted-foreground font-heading">Recommended Action</span>
          <Badge variant="outline" className={`${getDirectionColor()} border-current glow-hover`}>
            <span className="flex items-center gap-1 font-heading">
              {getDirectionIcon()}
              <span className="uppercase font-bold">{recommendation.direction}</span>
            </span>
          </Badge>
        </div>

        {/* Entry Point - Prominently Displayed */}
        <div className="p-4 rounded-lg border-2 border-neon-purple/50 bg-neon-purple/10 space-y-2 glow-purple relative overflow-hidden">
          <div className="flex items-center gap-2 text-sm font-semibold text-neon-purple font-heading">
            <Target className="h-4 w-4 glow-icon" />
            Entry Point
          </div>
          <div className={`text-4xl font-bold font-mono ${getDirectionColor()} glow-text`}>
            ${formatPrice(recommendation.entryPoint)}
          </div>
          {recommendation.entryReasoning && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation.entryReasoning}
            </p>
          )}
        </div>

        {/* Confidence & Risk */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium font-heading">Confidence</span>
              <span className={`text-sm font-bold font-mono ${getConfidenceColor()} glow-text`}>
                {recommendation.confidence}%
              </span>
            </div>
            <Progress value={recommendation.confidence} className="h-2" />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium font-heading">Risk Level</span>
            <Badge variant="outline" className={`w-full justify-center font-heading ${getRiskColor()} glow-hover`}>
              {recommendation.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Take Profit Targets */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold font-heading text-neon-cyan">Take Profit Targets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendation.takeProfitTargets.map((target, i) => (
              <div key={i} className="p-3 rounded-lg border border-neon-cyan/30 bg-card/50 space-y-1 glow-hover transition-all duration-300">
                <Badge variant="secondary" className="text-xs font-heading bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border-neon-cyan/30">
                  {target.label}
                </Badge>
                <div className="font-mono font-bold text-lg text-foreground">
                  ${formatPrice(target.price)}
                </div>
                <div className={`text-xs font-semibold font-mono ${recommendation.direction === 'buy' ? 'text-neon-green glow-text' : 'text-neon-red glow-text'}`}>
                  {recommendation.direction === 'buy' ? '+' : '-'}{target.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-lg border-2 border-neon-red/40 bg-neon-red/10 space-y-1 glow-red">
          <div className="flex items-center gap-2 text-sm font-medium text-neon-red font-heading">
            <AlertTriangle className="h-4 w-4 glow-icon" />
            Stop Loss
          </div>
          <div className="font-mono font-bold text-xl text-neon-red glow-text">
            ${formatPrice(recommendation.stopLoss)}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Risk: {Math.abs(((recommendation.stopLoss - recommendation.entryPoint) / recommendation.entryPoint) * 100).toFixed(2)}%
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold font-heading text-neon-cyan">Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-neon-cyan/20 font-mono">
          <Clock className="h-3 w-3" />
          <span>Updated {relativeTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
