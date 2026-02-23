import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAlertHistory } from './useAlertHistory';
import { useCryptoPrices } from './useCryptoPrices';
import { useInternetIdentity } from './useInternetIdentity';
import { SignalType } from '@/backend';

interface ProcessedSignal {
  coinId: string;
  coinName: string;
  signalType: 'buy' | 'sell' | 'hold';
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  price: number;
}

export function useAlertNotifications() {
  const { identity } = useInternetIdentity();
  const { data: cryptos } = useCryptoPrices();
  const { saveAlert } = useAlertHistory();
  const processedSignalsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!identity || !cryptos || cryptos.length === 0) return;

    // Check signals for top cryptocurrencies
    const checkSignals = async () => {
      const topCoins = cryptos.slice(0, 10); // Monitor top 10 coins

      for (const crypto of topCoins) {
        try {
          // Import dynamically to avoid circular dependencies
          const { useTechnicalIndicators } = await import('./useTechnicalIndicators');
          const { generateTradingSignals } = await import('@/utils/tradingSignals');

          // This is a workaround - in a real implementation, we'd need to fetch indicators
          // For now, we'll skip the actual signal checking and just demonstrate the notification system
        } catch (error) {
          console.error('Error checking signals:', error);
        }
      }
    };

    // Check every 60 seconds
    const interval = setInterval(checkSignals, 60000);
    checkSignals(); // Initial check

    return () => clearInterval(interval);
  }, [identity, cryptos, saveAlert]);

  const showAlertNotification = (signal: ProcessedSignal) => {
    const signalKey = `${signal.coinId}-${signal.signalType}-${Date.now()}`;

    if (processedSignalsRef.current.has(signalKey)) return;
    processedSignalsRef.current.add(signalKey);

    const signalEmoji = signal.signalType === 'buy' ? '📈' : signal.signalType === 'sell' ? '📉' : '➖';

    toast(`${signalEmoji} ${signal.coinName}`, {
      description: `${signal.signalType.toUpperCase()} @ $${signal.price.toFixed(2)} - ${signal.reason} (Confidence: ${signal.confidence})`,
      duration: 6000,
      action: {
        label: 'Dismiss',
        onClick: () => {},
      },
    });

    // Save to backend
    const signalTypeMap: Record<string, SignalType> = {
      buy: SignalType.buy,
      sell: SignalType.sell,
      hold: SignalType.hold,
    };

    const confidenceMap: Record<string, bigint> = {
      high: BigInt(90),
      medium: BigInt(60),
      low: BigInt(30),
    };

    saveAlert({
      crypto: signal.coinId,
      signalType: signalTypeMap[signal.signalType],
      triggerReason: null,
      confidence: confidenceMap[signal.confidence],
      priceAtTrigger: signal.price,
    }).catch((error) => {
      console.error('Failed to save alert:', error);
    });
  };

  return { showAlertNotification };
}
