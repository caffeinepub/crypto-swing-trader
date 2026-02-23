import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Trade } from '@/backend';
import { useState, useMemo } from 'react';

export interface JournalFilters {
  search: string;
  crypto: string;
  outcome: 'all' | 'profit' | 'loss';
}

export function useJournal() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<JournalFilters>({
    search: '',
    crypto: '',
    outcome: 'all',
  });

  const journalQuery = useQuery<Trade[]>({
    queryKey: ['journal'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getJournal();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const addTradeMutation = useMutation({
    mutationFn: async (trade: Trade) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addTrade(trade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });

  const removeTradeMutation = useMutation({
    mutationFn: async (tradeId: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeFromJournal(tradeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal'] });
    },
  });

  const filteredTrades = useMemo(() => {
    if (!journalQuery.data) return [];

    return journalQuery.data.filter((trade) => {
      const searchMatch =
        !filters.search ||
        trade.crypto.toLowerCase().includes(filters.search.toLowerCase()) ||
        trade.rationale.toLowerCase().includes(filters.search.toLowerCase()) ||
        trade.notes.toLowerCase().includes(filters.search.toLowerCase());

      const cryptoMatch = !filters.crypto || trade.crypto.toLowerCase() === filters.crypto.toLowerCase();

      const exitPrice = trade.exitPrice || 0;
      const pl = (exitPrice - trade.entryPrice) * trade.quantity;
      const outcomeMatch =
        filters.outcome === 'all' || (filters.outcome === 'profit' && pl > 0) || (filters.outcome === 'loss' && pl < 0);

      return searchMatch && cryptoMatch && outcomeMatch;
    });
  }, [journalQuery.data, filters]);

  return {
    data: filteredTrades,
    isLoading: journalQuery.isLoading,
    addTrade: addTradeMutation.mutateAsync,
    removeTrade: removeTradeMutation.mutateAsync,
    filters,
    setFilters,
  };
}
