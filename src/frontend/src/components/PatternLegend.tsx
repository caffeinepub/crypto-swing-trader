import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CandlestickPattern } from '@/utils/candlestickPatterns';

interface PatternLegendProps {
  patterns: CandlestickPattern[];
}

export default function PatternLegend({ patterns }: PatternLegendProps) {
  const uniquePatterns = Array.from(new Map(patterns.map((p) => [p.name, p])).values());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Detected Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {uniquePatterns.map((pattern, i) => (
            <Badge
              key={i}
              variant={pattern.type === 'bullish' ? 'default' : pattern.type === 'bearish' ? 'destructive' : 'secondary'}
            >
              {pattern.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
