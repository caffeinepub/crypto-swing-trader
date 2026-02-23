import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { JournalFilters } from '@/hooks/useJournal';

interface JournalFiltersProps {
  filters: JournalFilters;
  onFiltersChange: (filters: JournalFilters) => void;
}

export default function JournalFilters({ filters, onFiltersChange }: JournalFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search trades..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select value={filters.outcome} onValueChange={(v) => onFiltersChange({ ...filters, outcome: v as any })}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Trades</SelectItem>
          <SelectItem value="profit">Profitable</SelectItem>
          <SelectItem value="loss">Losses</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
