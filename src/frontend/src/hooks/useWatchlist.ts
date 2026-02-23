import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useWatchlist() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const watchlistQuery = useQuery<string[]>({
    queryKey: ['watchlist'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getWatchlist();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (coinId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.addToWatchlist(coinId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (coinId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.removeFromWatchlist(coinId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return {
    data: watchlistQuery.data || [],
    isLoading: watchlistQuery.isLoading,
    addToWatchlist: addToWatchlistMutation.mutateAsync,
    removeFromWatchlist: removeFromWatchlistMutation.mutateAsync,
    isInWatchlist: (coinId: string) => watchlistQuery.data?.includes(coinId) || false,
  };
}
