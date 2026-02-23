import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Position } from '@/backend';

export interface PositionWithPrice extends Position {
  currentPrice: number;
  name: string;
  image?: string;
}

export function usePortfolio() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const portfolioQuery = useQuery<Position[]>({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getPortfolio();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const addPositionMutation = useMutation({
    mutationFn: async ({ symbol, quantity }: { symbol: string; quantity: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addPosition(symbol, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  const removePositionMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removePosition(symbol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });

  return {
    data: portfolioQuery.data,
    isLoading: portfolioQuery.isLoading,
    addPosition: addPositionMutation.mutateAsync,
    removePosition: removePositionMutation.mutateAsync,
    isAdding: addPositionMutation.isPending,
    isRemoving: removePositionMutation.isPending,
  };
}
