import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export type ApiHealthStatus = 'healthy' | 'degraded' | 'issues';

interface ApiHealthState {
  status: ApiHealthStatus;
  color: string;
  message: string;
  successRate: number;
}

export function useApiHealthMonitor(): ApiHealthState {
  const queryClient = useQueryClient();
  const [healthState, setHealthState] = useState<ApiHealthState>({
    status: 'healthy',
    color: 'oklch(var(--neon-green))',
    message: 'All systems operational',
    successRate: 100,
  });

  useEffect(() => {
    const checkHealth = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      // Filter for crypto-related queries
      const cryptoQueries = queries.filter(q => 
        q.queryKey[0] === 'cryptoPrices' || 
        q.queryKey[0] === 'chartData' ||
        q.queryKey[0] === 'technicalIndicators'
      );

      if (cryptoQueries.length === 0) {
        setHealthState({
          status: 'healthy',
          color: 'oklch(var(--neon-green))',
          message: 'All systems operational',
          successRate: 100,
        });
        return;
      }

      // Calculate success rate from recent queries
      const recentQueries = cryptoQueries.slice(-10); // Last 10 queries
      const successfulQueries = recentQueries.filter(q => q.state.status === 'success').length;
      const failedQueries = recentQueries.filter(q => q.state.status === 'error').length;
      const totalQueries = successfulQueries + failedQueries;

      if (totalQueries === 0) {
        setHealthState({
          status: 'healthy',
          color: 'oklch(var(--neon-green))',
          message: 'All systems operational',
          successRate: 100,
        });
        return;
      }

      const successRate = (successfulQueries / totalQueries) * 100;

      if (successRate >= 80) {
        setHealthState({
          status: 'healthy',
          color: 'oklch(var(--neon-green))',
          message: 'All systems operational',
          successRate,
        });
      } else if (successRate >= 50) {
        setHealthState({
          status: 'degraded',
          color: 'oklch(var(--warning))',
          message: 'Some data may be delayed',
          successRate,
        });
      } else {
        setHealthState({
          status: 'issues',
          color: 'oklch(var(--neon-red))',
          message: 'Experiencing connectivity issues',
          successRate,
        });
      }
    };

    // Check immediately
    checkHealth();

    // Check every 10 seconds
    const interval = setInterval(checkHealth, 10000);

    return () => clearInterval(interval);
  }, [queryClient]);

  return healthState;
}
