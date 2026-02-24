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
    <div className="w-full h-[400px] rounded-lg border border-neon-cyan/30 bg-background-elevated/50 p-4 glow-ambient">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(var(--neon-cyan))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="oklch(var(--neon-cyan))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--neon-cyan) / 0.1)" />
          <XAxis 
            dataKey="timestamp" 
            className="text-xs font-mono" 
            tick={{ fill: 'oklch(var(--muted-foreground))' }} 
            stroke="oklch(var(--neon-cyan) / 0.3)"
          />
          <YAxis 
            domain={['auto', 'auto']} 
            className="text-xs font-mono" 
            tick={{ fill: 'oklch(var(--muted-foreground))' }} 
            stroke="oklch(var(--neon-cyan) / 0.3)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(var(--popover))',
              border: '1px solid oklch(var(--neon-cyan) / 0.3)',
              borderRadius: '6px',
              boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            labelStyle={{ color: 'oklch(var(--neon-cyan))' }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="oklch(var(--neon-cyan))" 
            strokeWidth={2} 
            dot={false}
            fill="url(#priceGradient)"
          />
          {supportResistance?.map((level, i) => (
            <ReferenceLine
              key={i}
              y={level.price}
              stroke={level.type === 'support' ? 'oklch(var(--neon-green))' : 'oklch(var(--neon-red))'}
              strokeDasharray="3 3"
              strokeWidth={2}
              label={{
                value: `${level.type} $${level.price.toFixed(2)}`,
                position: 'right',
                fill: level.type === 'support' ? 'oklch(var(--neon-green))' : 'oklch(var(--neon-red))',
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
