import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export type ApiHealthStatus = "healthy" | "degraded" | "issues";

interface ApiHealthState {
  status: ApiHealthStatus;
  color: string;
  message: string;
  successRate: number;
  estimatedRecoverySeconds: number;
}

export function useApiHealthMonitor(): ApiHealthState {
  const queryClient = useQueryClient();
  const [healthState, setHealthState] = useState<ApiHealthState>({
    status: "healthy",
    color: "oklch(var(--neon-green))",
    message: "All systems operational",
    successRate: 100,
    estimatedRecoverySeconds: 0,
  });

  useEffect(() => {
    const checkHealth = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();

      // Filter for crypto-related queries
      const cryptoQueries = queries.filter(
        (q) =>
          q.queryKey[0] === "cryptoPrices" ||
          q.queryKey[0] === "chartData" ||
          q.queryKey[0] === "technicalIndicators",
      );

      if (cryptoQueries.length === 0) {
        setHealthState({
          status: "healthy",
          color: "oklch(var(--neon-green))",
          message: "All systems operational",
          successRate: 100,
          estimatedRecoverySeconds: 0,
        });
        return;
      }

      // Calculate success rate from recent queries
      const recentQueries = cryptoQueries.filter((q) => {
        const state = q.state;
        return state.dataUpdatedAt > Date.now() - 120000; // Last 2 minutes
      });

      const successfulQueries = recentQueries.filter(
        (q) => q.state.status === "success",
      ).length;
      const failedQueries = recentQueries.filter(
        (q) => q.state.status === "error",
      ).length;
      const totalQueries = successfulQueries + failedQueries;

      const successRate =
        totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 100;

      // Calculate estimated recovery time based on retry schedules
      let estimatedRecovery = 0;
      const errorQueries = cryptoQueries.filter(
        (q) => q.state.status === "error",
      );
      if (errorQueries.length > 0) {
        // Find the query with the longest retry delay
        // biome-ignore lint/complexity/noForEach: complex callback
        errorQueries.forEach((q) => {
          // Access failureCount from the query's state.fetchFailureCount
          const failureCount = q.state.fetchFailureCount || 0;
          // Match the retry delay calculation from useCryptoPrices
          const delay = Math.min(2000 * 2 ** failureCount, 60000);
          estimatedRecovery = Math.max(
            estimatedRecovery,
            Math.floor(delay / 1000),
          );
        });
      }

      // Determine health status
      let status: ApiHealthStatus;
      let color: string;
      let message: string;

      if (successRate >= 80) {
        status = "healthy";
        color = "oklch(var(--neon-green))";
        message = "All systems operational";
      } else if (successRate >= 50) {
        status = "degraded";
        color = "oklch(var(--neon-yellow))";
        message = "API performance degraded";
      } else {
        status = "issues";
        color = "oklch(var(--neon-red))";
        message = "API experiencing issues";
      }

      setHealthState({
        status,
        color,
        message,
        successRate,
        estimatedRecoverySeconds: estimatedRecovery,
      });
    };

    // Check health immediately and every 5 seconds
    checkHealth();
    const interval = setInterval(checkHealth, 5000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return healthState;
}
