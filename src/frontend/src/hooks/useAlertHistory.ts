import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Alert, SignalType } from '@/backend';

export function useAlertHistory(filterCrypto?: string | null, filterSignal?: SignalType | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const alertHistoryQuery = useQuery<Alert[]>({
    queryKey: ['alertHistory', filterCrypto, filterSignal],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAlertHistory(filterCrypto || null, filterSignal || null);
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const last24HoursQuery = useQuery<Alert[]>({
    queryKey: ['alertsLast24Hours'],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getAlertsLast24Hours();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const alertStatsQuery = useQuery<[bigint, bigint, bigint]>({
    queryKey: ['alertStats'],
    queryFn: async () => {
      if (!actor) return [BigInt(0), BigInt(0), BigInt(0)];
      return await actor.getAlertStats();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const saveAlertMutation = useMutation({
    mutationFn: async ({
      crypto,
      signalType,
      triggerReason,
      confidence,
      priceAtTrigger,
    }: {
      crypto: string;
      signalType: SignalType;
      triggerReason: any;
      confidence: bigint;
      priceAtTrigger: number;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveAlert(crypto, signalType, triggerReason, confidence, priceAtTrigger);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertHistory'] });
      queryClient.invalidateQueries({ queryKey: ['alertsLast24Hours'] });
      queryClient.invalidateQueries({ queryKey: ['alertStats'] });
    },
  });

  const clearAlertsMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.clearAlerts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertHistory'] });
      queryClient.invalidateQueries({ queryKey: ['alertsLast24Hours'] });
      queryClient.invalidateQueries({ queryKey: ['alertStats'] });
    },
  });

  return {
    alerts: alertHistoryQuery.data || [],
    isLoading: alertHistoryQuery.isLoading,
    last24Hours: last24HoursQuery.data || [],
    stats: alertStatsQuery.data,
    saveAlert: saveAlertMutation.mutateAsync,
    clearAlerts: clearAlertsMutation.mutateAsync,
    refetch: alertHistoryQuery.refetch,
  };
}

export function useCryptoAlerts(crypto: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Alert[]>({
    queryKey: ['cryptoAlerts', crypto],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getCryptoAlertHistory(crypto);
    },
    enabled: !!actor && !!identity && !isFetching && !!crypto,
  });
}
