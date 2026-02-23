import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { OHLCData } from '@/services/coingecko';
import type { TechnicalIndicators } from '@/utils/technicalIndicators';
import type { CandlestickPattern } from '@/utils/candlestickPatterns';
import type { SupportResistanceLevel } from '@/utils/supportResistance';

interface CandlestickChartProps {
  data: OHLCData[];
  indicators?: TechnicalIndicators;
  patterns?: CandlestickPattern[];
  supportResistance?: SupportResistanceLevel[];
}

export default function CandlestickChart({ data, indicators, supportResistance }: CandlestickChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      timestamp: new Date(d.timestamp).toLocaleDateString(),
      price: d.close,
      high: d.high,
      low: d.low,
    }));
  }, [data]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="timestamp" className="text-xs" tick={{ fill: 'currentColor' }} />
          <YAxis domain={['auto', 'auto']} className="text-xs" tick={{ fill: 'currentColor' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
            }}
          />
          <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          {supportResistance?.map((level, i) => (
            <ReferenceLine
              key={i}
              y={level.price}
              stroke={level.type === 'support' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-5))'}
              strokeDasharray="3 3"
              label={{
                value: `${level.type} $${level.price.toFixed(2)}`,
                position: 'right',
                fill: 'currentColor',
                fontSize: 10,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
