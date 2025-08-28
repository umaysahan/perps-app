import {
    calcLiqPrice,
    type MarginBucketAvail,
} from '@crocswap-libs/ambient-ember';
import type { PositionIF } from '~/utils/position/PositionIFs';
import type { SymbolInfoIF } from '~/utils/SymbolInfoIFs';

/**
 * Convert a MarginBucketAvail from RPC to PositionIF format for display
 * @param marginBucket The margin bucket data from getUserMarginBucket
 * @param marketId The market ID (currently only 64 for BTC)
 * @returns PositionIF or null if no position exists
 */
export function convertMarginBucketToPosition(
    marginBucket: MarginBucketAvail,
    marketId: bigint = 64n,
    symbolInfo: SymbolInfoIF | null,
): PositionIF | null {
    // If no position exists, return null
    if (marginBucket.netPosition === 0n) {
        return null;
    }

    // Convert bigint values to numbers with proper decimal scaling
    const netPositionNum = Number(marginBucket.netPosition) / 1e8; // 8 decimals for position size
    const avgEntryPriceNum = Number(marginBucket.avgEntryPrice) / 1e6; // 6 decimals for price (matches on-chain format)
    // const markPriceNum = Number(marginBucket.markPrice) / 1e6; // 6 decimals for price (matches on-chain format)
    const markPriceNum = symbolInfo?.markPx || 0;

    // Calculate PnL using streamed mark price instead of on-chain value
    // PnL = (markPrice - entryPrice) * signedNetPosition
    // For longs: positive position, profit when mark > entry
    // For shorts: negative position, profit when mark < entry
    const unrealizedPnlNum = (markPriceNum - avgEntryPriceNum) * netPositionNum;

    // Calculate position value (size * mark price)
    const positionValue = Math.abs(netPositionNum * markPriceNum);

    // Calculate leverage based on position value and committed collateral
    const leverage = marginBucket.effectiveImBps
        ? 10000 / marginBucket.effectiveImBps
        : 20;

    // Calculate margin used (position value / leverage) - this is what's displayed in the table
    const marginUsed = positionValue / leverage;

    // Calculate max leverage from effective IM basis points
    // IM% = 100 / maxLeverage, so maxLeverage = 10000 / imBps
    const maxLeverage =
        marginBucket.effectiveImBps > 0
            ? 10000 / marginBucket.effectiveImBps
            : 100; // Default max leverage

    // Calculate liquidation price using the SDK's calcLiqPrice function
    // The SDK function expects:
    // - collateral in raw units (with decimals)
    // - position with qty and entryPrice in raw units
    // - mmBps as maintenance margin in basis points
    let liquidationPx = 0;
    if (marginBucket.netPosition !== 0n && marginBucket.avgEntryPrice > 0n) {
        try {
            liquidationPx = calcLiqPrice(
                Number(marginBucket.committedCollateral) / 1e6, // Collateral in USDC (6 decimals)
                {
                    qty: Number(marginBucket.netPosition) / 1e8, // Position size in BTC (8 decimals)
                    entryPrice: Number(marginBucket.avgEntryPrice) / 1e6, // Entry price in BTC (6 decimals)
                },
                marginBucket.marketMmBps / 10000,
            );

            if (liquidationPx < 0) {
                liquidationPx = 0; // Ensure non-negative liquidation price
            }
        } catch (error) {
            liquidationPx = 0; // If calculation fails, set to 0
        }
    }

    // Calculate return on equity (ROE) as unrealized PnL / margin used
    // ROE = (PnL / marginUsed) * 100
    const returnOnEquity = marginUsed > 0 ? unrealizedPnlNum / marginUsed : 0;

    // Map to the coin based on market ID
    // Currently only BTC is supported (market ID 64)
    const coin = marketId === 64n ? 'BTC' : 'UNKNOWN';

    return {
        coin,
        entryPx: avgEntryPriceNum,
        leverage: {
            type: 'isolated', // All positions are isolated margin in this system
            value: Math.round(leverage * 10) / 10, // Round to 1 decimal place
        },
        liquidationPx,
        marginUsed,
        maxLeverage,
        positionValue,
        returnOnEquity,
        szi: netPositionNum, // Size can be negative for short positions
        unrealizedPnl: unrealizedPnlNum,
        type: 'margin',
        cumFunding: {
            allTime: 0, // Not available from RPC
            sinceChange: 0, // Not available from RPC
            sinceOpen: 0, // Not available from RPC
        },
        // Optional TP/SL fields not available from margin bucket
        tp: undefined,
        sl: undefined,
    };
}
