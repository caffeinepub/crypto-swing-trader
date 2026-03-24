import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type Timeframe = "15m" | "1H" | "4H" | "Daily";

interface TimeframeSelectorProps {
  selected: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
}

export default function TimeframeSelector({
  selected,
  onSelect,
}: TimeframeSelectorProps) {
  return (
    <Tabs value={selected} onValueChange={(v) => onSelect(v as Timeframe)}>
      <TabsList>
        <TabsTrigger value="15m">15m</TabsTrigger>
        <TabsTrigger value="1H">1H</TabsTrigger>
        <TabsTrigger value="4H">4H</TabsTrigger>
        <TabsTrigger value="Daily">Daily</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
