import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeframeSelectorProps {
  selected: '1H' | '4H' | 'Daily';
  onSelect: (timeframe: '1H' | '4H' | 'Daily') => void;
}

export default function TimeframeSelector({ selected, onSelect }: TimeframeSelectorProps) {
  return (
    <Tabs value={selected} onValueChange={(v) => onSelect(v as '1H' | '4H' | 'Daily')}>
      <TabsList>
        <TabsTrigger value="1H">1H</TabsTrigger>
        <TabsTrigger value="4H">4H</TabsTrigger>
        <TabsTrigger value="Daily">Daily</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
