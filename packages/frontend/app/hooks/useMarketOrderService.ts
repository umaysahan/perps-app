import { isEstablished, useSession } from '@fogo/sessions-sdk-react';
import { useCallback, useEffect, useState } from 'react';
import {
    MarketOrderService,
    type MarketOrderParams,
    type MarketOrderResult,
} from '~/services/marketOrderService';

export interface UseMarketOrderServiceReturn {
    isLoading: boolean;
    error: string | null;
    executeMarketOrder: (
        params: MarketOrderParams,
    ) => Promise<MarketOrderResult>;
}

/**
 * Hook for managing market order functionality with Solana transactions
 */
export function useMarketOrderService(): UseMarketOrderServiceReturn {
    const sessionState = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [marketOrderService, setMarketOrderService] =
        useState<MarketOrderService | null>(null);

    // Initialize market order service when session is established
    useEffect(() => {
        console.log('🔄 Market order service initialization check');
        console.log('  - Session established:', isEstablished(sessionState));

        if (isEstablished(sessionState)) {
            console.log(
                '✅ Creating market order service with connection:',
                sessionState.connection,
            );
            const service = new MarketOrderService(sessionState.connection);
            setMarketOrderService(service);
        } else {
            console.log(
                '⚠️ Session not established, market order service not created',
            );
            setMarketOrderService(null);
        }
    }, [sessionState]);

    // Execute market order transaction
    const executeMarketOrder = useCallback(
        async (params: MarketOrderParams): Promise<MarketOrderResult> => {
            if (!marketOrderService || !isEstablished(sessionState)) {
                return {
                    success: false,
                    error: 'Session not established',
                };
            }

            setIsLoading(true);
            setError(null);

            try {
                console.log('🚀 Executing market order:', params);

                // Get user's wallet public key
                const userWalletKey =
                    sessionState.walletPublicKey ||
                    sessionState.sessionPublicKey;

                console.log('🔑 Using keys:', {
                    sessionPublicKey: sessionState.sessionPublicKey?.toString(),
                    userWalletKey: userWalletKey.toString(),
                });

                // Ensure sendTransaction is available
                if (typeof sessionState.sendTransaction !== 'function') {
                    throw new Error(
                        `sendTransaction is not available. Available methods: ${Object.entries(
                            sessionState,
                        )
                            .filter(([, value]) => typeof value === 'function')
                            .map(([key]) => key)
                            .join(', ')}`,
                    );
                }

                // Get paymaster from SessionState if available
                const paymaster = sessionState.payer || undefined;

                const result = await marketOrderService.executeMarketOrder(
                    params,
                    sessionState.sessionPublicKey, // For transaction building/signing
                    userWalletKey, // For order owner
                    sessionState.sendTransaction,
                    paymaster, // Pass paymaster as rent payer
                );

                if (!result.success) {
                    setError(result.error || 'Market order failed');
                }

                return result;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Market order failed';
                setError(errorMessage);
                return {
                    success: false,
                    error: errorMessage,
                };
            } finally {
                setIsLoading(false);
            }
        },
        [marketOrderService, sessionState],
    );

    return {
        isLoading,
        error,
        executeMarketOrder,
    };
}
