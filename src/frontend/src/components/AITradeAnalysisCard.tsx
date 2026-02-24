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
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getDirectionIcon = () => {
    if (recommendation.direction === 'buy') return <TrendingUp className="h-5 w-5" />;
    if (recommendation.direction === 'sell') return <TrendingDown className="h-5 w-5" />;
    return <Minus className="h-5 w-5" />;
  };

  const getDirectionColor = () => {
    if (recommendation.direction === 'buy') return 'text-green-600 dark:text-green-400';
    if (recommendation.direction === 'sell') return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getRiskColor = () => {
    if (recommendation.riskLevel === 'low') return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    if (recommendation.riskLevel === 'medium') return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
  };

  const getConfidenceColor = () => {
    if (recommendation.confidence >= 70) return 'text-green-600 dark:text-green-400';
    if (recommendation.confidence >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Trade Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended Action Badge */}
        <div className="flex items-center justify-between pb-2 border-b">
          <span className="text-sm font-medium text-muted-foreground">Recommended Action</span>
          <Badge variant="outline" className={`${getDirectionColor()} border-current`}>
            <span className="flex items-center gap-1">
              {getDirectionIcon()}
              <span className="uppercase font-semibold">{recommendation.direction}</span>
            </span>
          </Badge>
        </div>

        {/* Entry Point - Prominently Displayed */}
        <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Target className="h-4 w-4" />
            Entry Point
          </div>
          <div className={`text-4xl font-bold ${getDirectionColor()}`}>
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
              <span className="text-sm font-medium">Confidence</span>
              <span className={`text-sm font-bold ${getConfidenceColor()}`}>
                {recommendation.confidence}%
              </span>
            </div>
            <Progress value={recommendation.confidence} className="h-2" />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium">Risk Level</span>
            <Badge variant="outline" className={`w-full justify-center ${getRiskColor()}`}>
              {recommendation.riskLevel.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Take Profit Targets */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Take Profit Targets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendation.takeProfitTargets.map((target, i) => (
              <div key={i} className="p-3 rounded-lg border bg-card space-y-1">
                <Badge variant="secondary" className="text-xs">
                  {target.label}
                </Badge>
                <div className="font-mono font-bold text-lg">
                  ${formatPrice(target.price)}
                </div>
                <div className={`text-xs font-semibold ${recommendation.direction === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {recommendation.direction === 'buy' ? '+' : '-'}{target.percentage.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Stop Loss
          </div>
          <div className="font-mono font-bold text-xl text-destructive">
            ${formatPrice(recommendation.stopLoss)}
          </div>
          <div className="text-xs text-muted-foreground">
            Risk: {Math.abs(((recommendation.stopLoss - recommendation.entryPoint) / recommendation.entryPoint) * 100).toFixed(2)}%
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Analysis</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          <span>Updated {relativeTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}
