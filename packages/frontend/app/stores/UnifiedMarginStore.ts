import type { MarginBucketAvail } from '@crocswap-libs/ambient-ember';
import { create } from 'zustand';
import type { UserBalanceIF } from '~/utils/UserDataIFs';
import type { PositionIF } from '~/utils/position/PositionIFs';

interface UnifiedMarginStore {
    // Raw margin bucket data
    marginBucket: MarginBucketAvail | null;

    // Derived data
    balance: UserBalanceIF | null;
    positions: PositionIF[];

    // State management
    isLoading: boolean;
    error: string | null;
    lastUpdateTime: number;

    // Actions
    setMarginBucket: (marginBucket: MarginBucketAvail | null) => void;
    setBalance: (balance: UserBalanceIF | null) => void;
    setPositions: (positions: PositionIF[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setLastUpdateTime: (time: number) => void;

    // For manual refresh requests
    refreshPromise: Promise<void> | null;
    setRefreshPromise: (promise: Promise<void> | null) => void;
}

export const useUnifiedMarginStore = create<UnifiedMarginStore>((set) => ({
    marginBucket: null,
    balance: null,
    positions: [],
    isLoading: true,
    error: null,
    lastUpdateTime: 0,
    refreshPromise: null,

    setMarginBucket: (marginBucket) => set({ marginBucket }),
    setBalance: (balance) => set({ balance }),
    setPositions: (positions) => set({ positions }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    setLastUpdateTime: (time) => set({ lastUpdateTime: time }),
    setRefreshPromise: (promise) => set({ refreshPromise: promise }),
}));
