import {
    getUserMarginBucket,
    USD_MINT,
    DFLT_EMBER_MARKET,
    type MarginBucketAvail,
} from '@crocswap-libs/ambient-ember';
import type { Connection } from '@solana/web3.js';
import type { PublicKey } from '@solana/web3.js';
import { useUnifiedMarginStore } from '~/stores/UnifiedMarginStore';

/**
 * Get margin data from unified store or fetch fresh data
 * This is useful for services that need margin data outside of React components
 */
export async function getUnifiedMarginData(options?: {
    connection?: Connection;
    walletPublicKey?: PublicKey;
    forceRefresh?: boolean;
    marketId?: bigint;
}): Promise<{
    marginBucket: MarginBucketAvail | null;
    availableToWithdraw: bigint;
    decimalized: number;
}> {
    const store = useUnifiedMarginStore.getState();

    // If not forcing refresh and we have recent data (less than 1 second old), use it
    if (
        !options?.forceRefresh &&
        store.marginBucket &&
        Date.now() - store.lastUpdateTime < 1000
    ) {
        return {
            marginBucket: store.marginBucket,
            availableToWithdraw: store.marginBucket.availToWithdraw || 0n,
            decimalized:
                Number(store.marginBucket.availToWithdraw || 0n) /
                Math.pow(10, 6),
        };
    }

    // If connection and wallet are provided, fetch fresh data
    if (options?.connection && options?.walletPublicKey) {
        try {
            const marginBucket = await getUserMarginBucket(
                options.connection,
                options.walletPublicKey,
                options.marketId || BigInt(DFLT_EMBER_MARKET.mktId),
                USD_MINT,
                {},
            );

            if (!marginBucket) {
                return {
                    marginBucket: null,
                    availableToWithdraw: 0n,
                    decimalized: 0,
                };
            }

            // Note: We're not updating the store here as that should be done by the polling service
            // This is just for getting fresh data when needed (e.g., withdrawals)
            return {
                marginBucket,
                availableToWithdraw: marginBucket.availToWithdraw || 0n,
                decimalized:
                    Number(marginBucket.availToWithdraw || 0n) /
                    Math.pow(10, 6),
            };
        } catch (error) {
            console.error('Error fetching fresh margin data:', error);
            throw error;
        }
    }

    // Fallback to store data if available
    if (store.marginBucket) {
        return {
            marginBucket: store.marginBucket,
            availableToWithdraw: store.marginBucket.availToWithdraw || 0n,
            decimalized:
                Number(store.marginBucket.availToWithdraw || 0n) /
                Math.pow(10, 6),
        };
    }

    return {
        marginBucket: null,
        availableToWithdraw: 0n,
        decimalized: 0,
    };
}
