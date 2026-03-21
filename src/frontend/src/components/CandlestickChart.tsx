import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { OHLCData } from "@/services/coingecko";
import type { TradeRecommendation } from "@/utils/aiTradeRecommendations";
import type { CandlestickPattern } from "@/utils/candlestickPatterns";
import type { SupportResistanceLevel } from "@/utils/supportResistance";
import type { TechnicalIndicators } from "@/utils/technicalIndicators";
import { AlertTriangle, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CandlestickChartProps {
  data: OHLCData[];
  indicators?: TechnicalIndicators;
  patterns?: CandlestickPattern[];
  supportResistance?: SupportResistanceLevel[];
  tradeRecommendation?: TradeRecommendation;
  coinId?: string;
  timeframe?: string;
  isError?: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function CandlestickChart({
  data,
  // biome-ignore lint/correctness/noUnusedVariables: kept for API compatibility
  indicators,
  patterns,
  supportResistance,
  tradeRecommendation,
  coinId,
  timeframe,
  isError,
  onRetry,
  isRetrying,
}: CandlestickChartProps) {
  const [hoveredPattern, setHoveredPattern] =
    useState<CandlestickPattern | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const chartData = useMemo(() => {
    return data.map((d, index) => ({
      timestamp: new Date(d.timestamp).toLocaleDateString(),
      price: d.close,
      high: d.high,
      low: d.low,
      index,
    }));
  }, [data]);

  const entryPointData = useMemo(() => {
    if (!tradeRecommendation || tradeRecommendation.direction === "hold")
      return null;
    const lastIndex = chartData.length - 1;
    return {
      index: lastIndex,
      timestamp: chartData[lastIndex]?.timestamp,
      price: tradeRecommendation.entryPoint,
    };
  }, [tradeRecommendation, chartData]);

  if (isError) {
    return (
      <div className="w-full h-[400px] rounded-lg border border-neon-red/30 bg-background-elevated/50 p-8 flex flex-col items-center justify-center gap-4">
        <Alert
          variant="destructive"
          className="max-w-md border-neon-red/30 glow-red"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load chart data. The API may be temporarily unavailable.
          </AlertDescription>
        </Alert>
        {onRetry && (
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="gap-2 glow-hover"
            variant="outline"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry Loading Chart
              </>
            )}
          </Button>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Chart data is temporarily unavailable. This usually resolves within a
          few moments.
        </p>
      </div>
    );
  }

  const renderEntryMarker = (props: any) => {
    const { cx, cy } = props;
    if (!tradeRecommendation || tradeRecommendation.direction === "hold")
      return <g />;
    const isLong = tradeRecommendation.direction === "buy";
    const color = isLong ? "#22c55e" : "#ef4444";
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill={color}
          opacity={0.2}
          className="animate-pulse"
        />
        <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.4} />
        {isLong ? (
          <path
            d={`M ${cx} ${cy - 6} L ${cx - 4} ${cy + 2} L ${cx + 4} ${cy + 2} Z`}
            fill="white"
            stroke={color}
            strokeWidth={1}
          />
        ) : (
          <path
            d={`M ${cx} ${cy + 6} L ${cx - 4} ${cy - 2} L ${cx + 4} ${cy - 2} Z`}
            fill="white"
            stroke={color}
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  const renderPatternMarkers = () => {
    if (!patterns || patterns.length === 0) return null;
    return patterns.map((pattern, _i) => {
      const dataPoint = chartData[pattern.index];
      if (!dataPoint) return null;
      const color =
        pattern.type === "bullish"
          ? "#22c55e"
          : pattern.type === "bearish"
            ? "#ef4444"
            : "#a855f7";
      return (
        <ReferenceDot
          key={`pattern-${pattern.index}-${pattern.name}`}
          x={dataPoint.timestamp}
          y={data[pattern.index]?.high || dataPoint.price}
          r={6}
          fill={color}
          fillOpacity={0.6}
          stroke={color}
          strokeWidth={2}
          onMouseEnter={(e: any) => {
            setHoveredPattern(pattern);
            setTooltipPosition({ x: e.clientX, y: e.clientY });
          }}
          onMouseLeave={() => {
            setHoveredPattern(null);
            setTooltipPosition(null);
          }}
          style={{ cursor: "pointer" }}
        />
      );
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000)
      return price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  };

  // Stagger TP label positions to avoid overlap
  const tpLabelPositions: Array<"insideTopLeft" | "insideTopRight"> = [
    "insideTopLeft",
    "insideTopRight",
    "insideTopLeft",
  ];

  const rrLabel =
    tradeRecommendation &&
    tradeRecommendation.direction !== "hold" &&
    tradeRecommendation.riskReward > 0
      ? ` (R/R 1:${tradeRecommendation.riskReward.toFixed(1)})`
      : "";

  return (
    <div className="relative">
      <div className="w-full h-[400px] rounded-lg border border-neon-cyan/30 bg-background-elevated/50 p-4 glow-ambient">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} key={`${coinId}-${timeframe}`}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="oklch(var(--neon-cyan))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="oklch(var(--neon-cyan))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(var(--neon-cyan) / 0.1)"
            />
            <XAxis
              dataKey="timestamp"
              className="text-xs font-mono"
              tick={{ fill: "oklch(var(--muted-foreground))" }}
              stroke="oklch(var(--neon-cyan) / 0.3)"
            />
            <YAxis
              domain={["auto", "auto"]}
              className="text-xs font-mono"
              tick={{ fill: "oklch(var(--muted-foreground))" }}
              stroke="oklch(var(--neon-cyan) / 0.3)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(var(--popover))",
                border: "1px solid oklch(var(--neon-cyan) / 0.3)",
                borderRadius: "6px",
                boxShadow: "0 0 15px rgba(0, 217, 255, 0.3)",
                fontFamily: "JetBrains Mono, monospace",
              }}
              labelStyle={{ color: "oklch(var(--neon-cyan))" }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="oklch(var(--neon-cyan))"
              strokeWidth={2}
              dot={false}
              fill="url(#priceGradient)"
            />

            {/* Support/Resistance Levels — alternating left/right */}
            {supportResistance?.map((level, i) => (
              <ReferenceLine
                key={`sr-${level.type}-${level.price.toFixed(0)}`}
                y={level.price}
                stroke={
                  level.type === "support"
                    ? "oklch(var(--neon-green))"
                    : "oklch(var(--neon-red))"
                }
                strokeDasharray="3 3"
                strokeWidth={2}
                label={{
                  value: `${level.type} $${level.price.toFixed(2)}`,
                  position: i % 2 === 0 ? "insideTopLeft" : "insideTopRight",
                  fill:
                    level.type === "support"
                      ? "oklch(var(--neon-green))"
                      : "oklch(var(--neon-red))",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              />
            ))}

            {/* Entry Point Marker */}
            {entryPointData && (
              <ReferenceDot
                x={entryPointData.timestamp}
                y={entryPointData.price}
                shape={renderEntryMarker}
              />
            )}

            {/* Entry Point Line with R/R ratio */}
            {tradeRecommendation &&
              tradeRecommendation.direction !== "hold" && (
                <ReferenceLine
                  y={tradeRecommendation.entryPoint}
                  stroke={
                    tradeRecommendation.direction === "buy"
                      ? "#22c55e"
                      : "#ef4444"
                  }
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Entry: $${formatPrice(tradeRecommendation.entryPoint)}${rrLabel}`,
                    position: "insideTopRight",
                    fill:
                      tradeRecommendation.direction === "buy"
                        ? "#22c55e"
                        : "#ef4444",
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              )}

            {/* Take Profit Levels — staggered left/right */}
            {tradeRecommendation &&
              tradeRecommendation.direction !== "hold" &&
              tradeRecommendation.takeProfitTargets && (
                <>
                  {tradeRecommendation.takeProfitTargets[0] && (
                    <ReferenceLine
                      y={tradeRecommendation.takeProfitTargets[0].price}
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      strokeOpacity={0.9}
                      label={{
                        value: `TP1: $${formatPrice(tradeRecommendation.takeProfitTargets[0].price)} (+${tradeRecommendation.takeProfitTargets[0].percentage.toFixed(1)}%)`,
                        position: tpLabelPositions[0],
                        fill: "#22c55e",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />
                  )}
                  {tradeRecommendation.takeProfitTargets[1] && (
                    <ReferenceLine
                      y={tradeRecommendation.takeProfitTargets[1].price}
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      strokeOpacity={0.7}
                      label={{
                        value: `TP2: $${formatPrice(tradeRecommendation.takeProfitTargets[1].price)} (+${tradeRecommendation.takeProfitTargets[1].percentage.toFixed(1)}%)`,
                        position: tpLabelPositions[1],
                        fill: "#22c55e",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />
                  )}
                  {tradeRecommendation.takeProfitTargets[2] && (
                    <ReferenceLine
                      y={tradeRecommendation.takeProfitTargets[2].price}
                      stroke="#22c55e"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      strokeOpacity={0.5}
                      label={{
                        value: `TP3: $${formatPrice(tradeRecommendation.takeProfitTargets[2].price)} (+${tradeRecommendation.takeProfitTargets[2].percentage.toFixed(1)}%)`,
                        position: tpLabelPositions[2],
                        fill: "#22c55e",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />
                  )}
                </>
              )}

            {/* Stop Loss */}
            {tradeRecommendation &&
              tradeRecommendation.direction !== "hold" && (
                <ReferenceLine
                  y={tradeRecommendation.stopLoss}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{
                    value: `Stop: $${formatPrice(tradeRecommendation.stopLoss)}`,
                    position: "insideBottomRight",
                    fill: "#ef4444",
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              )}

            {/* Pattern Markers */}
            {renderPatternMarkers()}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pattern Tooltip */}
      {hoveredPattern && tooltipPosition && (
        <div
          className="fixed z-50 max-w-xs p-3 rounded-lg border border-neon-purple/50 bg-card/95 backdrop-blur-sm glow-ambient shadow-lg"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y + 10 }}
        >
          <div className="font-semibold text-neon-purple mb-1">
            {hoveredPattern.name}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {hoveredPattern.description}
          </div>
          {hoveredPattern.tradingAction && (
            <div className="text-xs font-medium text-foreground">
              {hoveredPattern.tradingAction}
            </div>
          )}
        </div>
      )}

      {/* Trading Legend */}
      {tradeRecommendation && tradeRecommendation.direction !== "hold" && (
        <div className="mt-4 p-4 rounded-lg border border-neon-cyan/20 bg-background-elevated/30">
          <div className="text-xs font-heading text-neon-cyan mb-2">
            Trading Markers Legend
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              {tradeRecommendation.direction === "buy" ? (
                <ArrowUp className="h-3 w-3 text-neon-green" />
              ) : (
                <ArrowDown className="h-3 w-3 text-neon-red" />
              )}
              <span className="text-muted-foreground">
                Entry Point (
                {tradeRecommendation.direction === "buy" ? "Long" : "Short"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-neon-green" />
              <span className="text-muted-foreground">
                Take Profit Targets (TP1, TP2, TP3)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-neon-red" />
              <span className="text-muted-foreground">Stop Loss Level</span>
            </div>
            {tradeRecommendation.riskReward > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-neon-cyan font-mono text-xs">R/R</span>
                <span className="text-muted-foreground">
                  Risk/Reward: 1:{tradeRecommendation.riskReward.toFixed(1)}{" "}
                  {tradeRecommendation.riskReward >= 2
                    ? "(✓ Favorable)"
                    : "(Low — use caution)"}
                </span>
              </div>
            )}
            {patterns && patterns.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-neon-purple" />
                <span className="text-muted-foreground">
                  Candlestick Patterns (hover for details)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
