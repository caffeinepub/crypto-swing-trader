import type { PriceDirection, PriceTarget } from "@/backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function usePriceTargets() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const targetsQuery = useQuery<PriceTarget[]>({
    queryKey: ["priceTargets"],
    queryFn: async () => {
      if (!actor) return [];
      return await actor.getPriceTargets();
    },
    enabled: !!actor && !!identity && !isFetching,
  });

  const addTargetMutation = useMutation({
    mutationFn: async ({
      coinId,
      coinName,
      targetPrice,
      direction,
    }: {
      coinId: string;
      coinName: string;
      targetPrice: number;
      direction: PriceDirection;
    }) => {
      if (!actor) throw new Error("Actor not initialized");
      return await actor.addPriceTarget(
        coinId,
        coinName,
        targetPrice,
        direction,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceTargets"] });
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.deletePriceTarget(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceTargets"] });
    },
  });

  const markTriggeredMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not initialized");
      await actor.markPriceTargetTriggered(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priceTargets"] });
    },
  });

  return {
    targets: targetsQuery.data || [],
    isLoading: targetsQuery.isLoading,
    addTarget: addTargetMutation.mutateAsync,
    isAdding: addTargetMutation.isPending,
    deleteTarget: deleteTargetMutation.mutateAsync,
    markTriggered: markTriggeredMutation.mutateAsync,
    refetchTargets: targetsQuery.refetch,
  };
}
