import { useEffect, useMemo } from 'react';
import {
    usePythPriceStore,
    usePythPrice as usePythPriceFromStore,
    usePythConnectionStatus,
} from '~/stores/PythPriceStore';
import { hasPythPriceFeed } from '~/utils/pythConfig';
import type { PythPriceData } from '~/services/pythPriceService';

export interface UsePythPriceResult {
    price: number | undefined;
    priceData: PythPriceData | undefined;
    isLoading: boolean;
    isConnected: boolean;
    isStale: boolean;
    hasError: boolean;
    errorMessage: string | undefined;
}

/**
 * Hook to get Pyth price data for a symbol with automatic subscription management
 */
export function usePythPrice(symbol: string | null): UsePythPriceResult {
    const subscribeToSymbol = usePythPriceStore(
        (state) => state.subscribeToSymbol,
    );
    const unsubscribeFromSymbol = usePythPriceStore(
        (state) => state.unsubscribeFromSymbol,
    );
    const priceData = usePythPriceFromStore(symbol || '');
    const isConnected = usePythConnectionStatus();

    // Check if symbol has a Pyth price feed
    const hasFeed = useMemo(() => {
        return symbol ? hasPythPriceFeed(symbol) : false;
    }, [symbol]);

    // Subscribe to price updates when component mounts or symbol changes
    useEffect(() => {
        if (!symbol || !hasFeed) {
            return;
        }

        subscribeToSymbol(symbol);

        // Cleanup: unsubscribe when component unmounts or symbol changes
        return () => {
            unsubscribeFromSymbol(symbol);
        };
    }, [symbol, hasFeed, subscribeToSymbol, unsubscribeFromSymbol]);

    // Calculate derived state
    const result = useMemo<UsePythPriceResult>(() => {
        // No symbol provided
        if (!symbol) {
            return {
                price: undefined,
                priceData: undefined,
                isLoading: false,
                isConnected,
                isStale: false,
                hasError: false,
                errorMessage: undefined,
            };
        }

        // Symbol doesn't have a Pyth feed
        if (!hasFeed) {
            return {
                price: undefined,
                priceData: undefined,
                isLoading: false,
                isConnected,
                isStale: false,
                hasError: true,
                errorMessage: `No Pyth price feed available for ${symbol}`,
            };
        }

        // Not connected to Pyth
        if (!isConnected) {
            return {
                price: undefined,
                priceData: undefined,
                isLoading: true,
                isConnected: false,
                isStale: false,
                hasError: true,
                errorMessage: 'Connecting to Pyth Network...',
            };
        }

        // No price data yet (still loading)
        if (!priceData) {
            return {
                price: undefined,
                priceData: undefined,
                isLoading: true,
                isConnected,
                isStale: false,
                hasError: false,
                errorMessage: undefined,
            };
        }

        // We have price data
        return {
            price: priceData.price,
            priceData,
            isLoading: false,
            isConnected,
            isStale: priceData.isStale,
            hasError: false,
            errorMessage: undefined,
        };
    }, [symbol, hasFeed, isConnected, priceData]);

    return result;
}

/**
 * Hook to get formatted Pyth price as a string
 */
export function useFormattedPythPrice(
    symbol: string | null,
    formatter?: (price: number) => string,
): string {
    const { price, isLoading, hasError } = usePythPrice(symbol);

    return useMemo(() => {
        if (hasError) {
            return '--';
        }

        if (isLoading || price === undefined) {
            return 'Loading...';
        }

        if (formatter) {
            return formatter(price);
        }

        // Default formatting
        if (price >= 1000) {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        } else if (price >= 1) {
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
            });
        } else {
            // For very small prices, show more decimals
            return price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
            });
        }
    }, [price, isLoading, hasError, formatter]);
}

/**
 * Hook to get multiple Pyth prices at once
 */
export function useMultiplePythPrices(
    symbols: string[],
): Map<string, UsePythPriceResult> {
    const subscribeToSymbol = usePythPriceStore(
        (state) => state.subscribeToSymbol,
    );
    const unsubscribeFromSymbol = usePythPriceStore(
        (state) => state.unsubscribeFromSymbol,
    );
    const allPrices = usePythPriceStore((state) => state.prices);
    const isConnected = usePythConnectionStatus();

    // Subscribe to all symbols
    useEffect(() => {
        const validSymbols = symbols.filter((symbol) =>
            hasPythPriceFeed(symbol),
        );

        validSymbols.forEach((symbol) => {
            subscribeToSymbol(symbol);
        });

        // Cleanup
        return () => {
            validSymbols.forEach((symbol) => {
                unsubscribeFromSymbol(symbol);
            });
        };
    }, [symbols, subscribeToSymbol, unsubscribeFromSymbol]);

    // Build results map
    return useMemo(() => {
        const results = new Map<string, UsePythPriceResult>();

        symbols.forEach((symbol) => {
            const priceData = allPrices.get(symbol);
            const hasFeed = hasPythPriceFeed(symbol);

            if (!hasFeed) {
                results.set(symbol, {
                    price: undefined,
                    priceData: undefined,
                    isLoading: false,
                    isConnected,
                    isStale: false,
                    hasError: true,
                    errorMessage: `No Pyth price feed available for ${symbol}`,
                });
            } else if (!isConnected) {
                results.set(symbol, {
                    price: undefined,
                    priceData: undefined,
                    isLoading: true,
                    isConnected: false,
                    isStale: false,
                    hasError: true,
                    errorMessage: 'Connecting to Pyth Network...',
                });
            } else if (!priceData) {
                results.set(symbol, {
                    price: undefined,
                    priceData: undefined,
                    isLoading: true,
                    isConnected,
                    isStale: false,
                    hasError: false,
                    errorMessage: undefined,
                });
            } else {
                results.set(symbol, {
                    price: priceData.price,
                    priceData,
                    isLoading: false,
                    isConnected,
                    isStale: priceData.isStale,
                    hasError: false,
                    errorMessage: undefined,
                });
            }
        });

        return results;
    }, [symbols, allPrices, isConnected]);
}
