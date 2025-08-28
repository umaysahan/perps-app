# Ambient Ember SDK

TypeScript/JavaScript SDK for interacting with the Ambient Ember perpetual futures DEX on Solana.

## Installation

```bash
npm install @crocswap-libs/ambient-ember
# or
yarn add @crocswap-libs/ambient-ember
# or
pnpm add @crocswap-libs/ambient-ember
```

## Quick Start

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import * as ember from '@crocswap-libs/ambient-ember';

const connection = new Connection('https://testnet.fogo.io');
const user = new PublicKey('YourWalletAddress');

// Place a market order
const tx = await ember.buildMarketBuyOrder(
    connection,
    64n, // Market ID (64 = BTC)
    BigInt(Date.now()), // Order ID
    100000000n, // 1.0 in 10^8 scale
    user,
);
```

## Table of Contents

- [Key Concepts](#key-concepts)
- [Order Management](#order-management)
- [Position Management](#position-management)
- [Margin and Collateral](#margin-and-collateral)
- [Querying Data](#querying-data)
- [Risk Management](#risk-management)
- [Types and Constants](#types-and-constants)
- [Examples](#examples)
- [API Reference](#api-reference)

## Key Concepts

### Decimal Precision

The SDK uses fixed-point arithmetic with specific decimal scales:

- **Prices**: Scaled by 10^6 (e.g., $100.50 = 100500000)
- **Quantities**: Scaled by 10^8 (e.g., 1.5 BTC = 150000000)
- **Collateral/USD**: Scaled by 10^6 (e.g., $1000 = 1000000000)
- **Basis Points (bps)**: 1 bps = 0.01% (e.g., 500 bps = 5%)

### Account Types

- **CMA (Cross Margin Account)**: User's main trading account that holds margin buckets
- **Margin Bucket**: Per-market collateral and position tracking
- **Order Details**: Storage for a user's open orders in a market
- **Market Order Log**: Append-only log of all market events

### Default Configuration

```typescript
// Program ID (can be overridden with EMBER_PROGRAM_ID env var)
export const EMBER_PROGRAM_ID = new PublicKey(
    'ambi3LHRUzmU187u4rP46rX6wrYrLtU1Bmi5U2yCTGE',
);

// Default USD mint
export const USD_MINT = new PublicKey(
    'fUSDNGgHkZfwckbr5RLLvRbvqvRcTLdH9hcHJiq4jry',
);

// Default market
export const DFLT_EMBER_MARKET = {
    mktId: 64,
    ticker: 'BTC',
    name: 'Bitcoin',
};
```

## Order Management

### Market Orders

Market orders are IOC (Immediate or Cancel) orders with price=0 convention.

```typescript
// Market Buy
const buyTx = await ember.buildMarketBuyOrder(
    connection,
    64n, // Market ID
    orderId, // Unique order ID (bigint)
    100000000n, // 1.0 BTC in 10^8 scale
    userPublicKey,
);

// Market Sell
const sellTx = await ember.buildMarketSellOrder(
    connection,
    64n,
    orderId,
    100000000n,
    userPublicKey,
);
```

### Limit Orders

```typescript
// Limit Buy Order
const buyTx = await ember.buildBuyOrder(
    connection,
    64n, // Market ID
    orderId, // Unique order ID
    100000000n, // Quantity: 1.0 BTC
    50000000000n, // Price: $50,000
    userPublicKey,
    { type: ember.TimeInForce.GTC }, // Good Till Cancelled
    1000, // Optional: 10% user initial margin
);

// Limit Sell with Time Expiry
const sellTx = await ember.buildSellOrder(
    connection,
    64n,
    orderId,
    50000000n, // 0.5 BTC
    51000000000n, // $51,000
    userPublicKey,
    {
        type: ember.TimeInForce.GTT,
        timestamp: BigInt(Date.now() / 1000 + 3600), // Expires in 1 hour
    },
);
```

### Advanced Order Entry

```typescript
const tx = await ember.buildOrderEntryTransaction(connection, {
    marketId: 64n,
    orderId: uniqueOrderId,
    side: ember.OrderSide.Bid, // 0 = Buy, 1 = Sell
    qty: 100000000n, // 1.0 BTC
    price: 50000000000n, // $50,000
    tif: { type: ember.TimeInForce.GTC },
    user: userPublicKey,
    actor: signerPublicKey, // Optional: delegated trading
    userSetImBps: 1000, // Optional: 10% initial margin
});
```

### Canceling Orders

```typescript
const cancelTx = await ember.buildCancelOrderTransaction(connection, {
    marketId: 64n,
    orderId: orderToCancel,
    user: userPublicKey,
    tombstone: ember.OrderTombstone.UserCancel,
});
```

## Position Management

### Closing Positions

To close a position, place an order in the opposite direction:

```typescript
// Close a long position with market order
const closeLongTx = await ember.buildMarketSellOrder(
    connection,
    marketId,
    orderId,
    positionSize, // Your current position size
    userPublicKey,
);

// Close with limit order
const closeTx = await ember.buildSellOrder(
    connection,
    marketId,
    orderId,
    positionSize,
    targetPrice,
    userPublicKey,
);
```

## Margin and Collateral

### Depositing Margin

```typescript
// Deposit and commit to margin in one transaction
const depositTx = await ember.buildDepositMarginTx(connection, {
    user: userPublicKey,
    mint: ember.USD_MINT,
    amount: 1000000000n, // $1000 in 10^6 scale
    marketId: 64n, // Target market
});
```

### Withdrawing Margin

```typescript
// Uncommit and withdraw in one transaction
const withdrawTx = await ember.buildWithdrawMarginTx(connection, {
    user: userPublicKey,
    mint: ember.USD_MINT,
    amount: 500000000n, // $500 in 10^6 scale
    marketId: 64n,
});
```

### Setting User Margin Requirements

```typescript
// Set custom initial margin (must be >= market minimum)
const setMarginTx = await ember.createSetUserMarginTransaction({
    connection,
    user: userPublicKey,
    marketId: 64n,
    userSetImBps: 2000, // 20% initial margin
});
```

## Querying Data

### Market Data

```typescript
// Get full market data
const market = await ember.getMarketData(connection, 64n);
if (market) {
    console.log({
        lastBid: Number(market.lastBid) / 1e6,
        lastAsk: Number(market.lastAsk) / 1e6,
        lastTradePrice: Number(market.lastTradePrice) / 1e6,
        lastMarkPrice: Number(market.lastMarkPrice) / 1e6,
        spread: Number(market.spread) / 1e6,
        isActive: market.isActive,
        imBps: market.imBps, // Initial margin
        mmBps: market.mmBps, // Maintenance margin
        tickSize: market.tickSize,
        minOrderSize: market.minOrderSize,
    });
}

// Get just prices
const prices = await ember.getMarketPrices(connection, 64n);
```

### User Margin and Positions

```typescript
// Get margin bucket with all calculations
const marginBucket = await ember.getUserMarginBucket(
    connection,
    userPublicKey,
    64n, // Market ID
    ember.USD_MINT, // Collateral token
);

if (marginBucket) {
    // Position info
    console.log({
        netPosition: Number(marginBucket.netPosition) / 1e8,
        avgEntryPrice: Number(marginBucket.avgEntryPrice) / 1e6,
        committedCollateral: Number(marginBucket.committedCollateral) / 1e6,
    });

    // P&L calculations
    console.log({
        markPrice: Number(marginBucket.markPrice) / 1e6,
        unrealizedPnl: Number(marginBucket.unrealizedPnl) / 1e6,
        equity: Number(marginBucket.equity) / 1e6,
    });

    // Available balances
    console.log({
        availToBuy: Number(marginBucket.availToBuy) / 1e6,
        availToSell: Number(marginBucket.availToSell) / 1e6,
        availToWithdraw: Number(marginBucket.availToWithdraw) / 1e6,
    });

    // Margin requirements
    console.log({
        userSetImBps: marginBucket.userSetImBps,
        marketImBps: marginBucket.marketImBps,
        effectiveImBps: marginBucket.effectiveImBps, // max(user, market)
    });
}
```

### Calculating Liquidation Price

```typescript
// Current position liquidation price
const liqPrice = ember.calcLiqPrice(
    1000, // Collateral: $1000
    {
        qty: 0.1, // 0.1 BTC long
        entryPrice: 50000, // Entry at $50k
    },
    0.05, // 5% maintenance margin
);

// Liquidation price after a new order
const newLiqPrice = ember.calcLiqPriceOnNewOrder(
    1000, // Current collateral
    { qty: 0.1, entryPrice: 50000 }, // Current position
    { qty: 0.05, entryPrice: 51000 }, // New order
    0.05, // Maintenance margin
);
```

## Risk Management

### Order Validation

```typescript
const result = await ember.validateOrder(connection, {
    user: userPublicKey,
    marketId: 64n,
    side: ember.OrderSide.Bid,
    quantity: 100000000n,
    price: 50000000000n,
    orderType: 'limit',
});

if (result.isValid) {
    // Order can be placed
} else {
    console.error('Validation failed:', result.errors);
    // Possible errors:
    // - INSUFFICIENT_MARGIN
    // - EXCEEDS_POSITION_LIMIT
    // - BELOW_MIN_ORDER_SIZE
    // - INVALID_PRICE_TICK
}
```

## Types and Constants

### Core Types

```typescript
// Order side
enum OrderSide {
    Bid = 0, // Buy
    Ask = 1, // Sell
}

// Time in force options
enum TimeInForce {
    IOC = 'IOC', // Immediate or Cancel
    FOK = 'FOK', // Fill or Kill
    GTC = 'GTC', // Good Till Cancelled
    ALO = 'ALO', // Add Liquidity Only
    GTT = 'GTT', // Good Till Time
}

// Time in force variants
type TimeInForceVariant =
    | { type: TimeInForce.IOC }
    | { type: TimeInForce.FOK }
    | { type: TimeInForce.GTC }
    | { type: TimeInForce.ALO }
    | { type: TimeInForce.GTT; timestamp: bigint };

// Order cancellation reasons
enum OrderTombstone {
    UserCancel = 0,
    Liquidation = 1,
    Expiry = 2,
}
```

### Margin Bucket Types

```typescript
// Base margin bucket
interface MarginBucket {
    scope: MarginScope;
    marketId: bigint;
    mint: PublicKey;
    committedCollateral: bigint;
    netPosition: bigint;
    openBidQty: bigint;
    openAskQty: bigint;
    avgEntryPrice: bigint;
    userSetImBps: number;
}

// With pricing calculations
type MarginBucketPriced = MarginBucket & {
    markPrice: bigint;
    equity: bigint;
    unrealizedPnl: bigint;
    marketImBps: number;
    effectiveImBps: number;
};

// With available balance calculations
type MarginBucketAvail = MarginBucketPriced & {
    availToBuy: bigint;
    availToSell: bigint;
    availToWithdraw: bigint;
};
```

### Market Data Type

```typescript
interface MarketData {
    marketId: bigint;
    lastBid: bigint;
    lastAsk: bigint;
    lastTradePrice: bigint;
    lastMarkPrice: bigint;
    midPrice: bigint;
    spread: bigint;
    isActive: boolean;
    imBps: number;
    mmBps: number;
    tickSize: bigint;
    minOrderSize: bigint;
    oracle: PublicKey;
    baseToken: PublicKey;
}
```

## Examples

### Complete Trading Flow

```typescript
import * as ember from '@crocswap-libs/ambient-ember';
import {
    Connection,
    PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js';

async function executeTrade(
    connection: Connection,
    user: Keypair,
    side: 'buy' | 'sell',
    quantity: number, // Human readable (e.g., 0.1 BTC)
    price: number, // Human readable (e.g., 50000)
) {
    // Convert to scaled values
    const scaledQty = BigInt(Math.floor(quantity * 1e8));
    const scaledPrice = BigInt(Math.floor(price * 1e6));
    const marketId = 64n; // BTC market

    // Check market status
    const market = await ember.getMarketData(connection, marketId);
    if (!market?.isActive) {
        throw new Error('Market is not active');
    }

    // Check user margin
    const margin = await ember.getUserMarginBucket(
        connection,
        user.publicKey,
        marketId,
    );

    const available =
        side === 'buy' ? margin?.availToBuy || 0n : margin?.availToSell || 0n;

    const notional = (scaledQty * scaledPrice) / 100000000n;
    const required = (notional * BigInt(market.imBps)) / 10000n;

    if (available < required) {
        throw new Error(
            `Insufficient margin. Need: $${Number(required) / 1e6}`,
        );
    }

    // Build and send order
    const orderId = BigInt(Date.now());
    const tx =
        side === 'buy'
            ? await ember.buildBuyOrder(
                  connection,
                  marketId,
                  orderId,
                  scaledQty,
                  scaledPrice,
                  user.publicKey,
              )
            : await ember.buildSellOrder(
                  connection,
                  marketId,
                  orderId,
                  scaledQty,
                  scaledPrice,
                  user.publicKey,
              );

    const sig = await sendAndConfirmTransaction(connection, tx, [user]);
    console.log('Order placed:', sig);

    return sig;
}
```

### Margin Management Flow

```typescript
async function manageMargin(
    connection: Connection,
    user: Keypair,
    action: 'deposit' | 'withdraw',
    amount: number, // USD amount
) {
    const scaledAmount = BigInt(Math.floor(amount * 1e6));

    if (action === 'deposit') {
        // Deposit and commit to margin
        const tx = await ember.buildDepositMarginTx(connection, {
            user: user.publicKey,
            mint: ember.USD_MINT,
            amount: scaledAmount,
            marketId: 64n,
        });

        const sig = await sendAndConfirmTransaction(connection, tx, [user]);
        console.log('Deposited:', sig);
    } else {
        // Check available to withdraw
        const margin = await ember.getUserMarginBucket(
            connection,
            user.publicKey,
            64n,
        );

        if (!margin || margin.availToWithdraw < scaledAmount) {
            throw new Error('Insufficient available balance');
        }

        // Withdraw
        const tx = await ember.buildWithdrawMarginTx(connection, user, {
            mint: ember.USD_MINT,
            amount: scaledAmount,
            marketId: 64n,
        });

        const sig = await sendAndConfirmTransaction(connection, tx, [user]);
        console.log('Withdrawn:', sig);
    }
}
```

## API Reference

### Transaction Builders

- `buildOrderEntryTransaction()` - Full control order entry
- `buildBuyOrder()` - Convenience for limit buy orders
- `buildSellOrder()` - Convenience for limit sell orders
- `buildMarketBuyOrder()` - Market buy order
- `buildMarketSellOrder()` - Market sell order
- `buildCancelOrderTransaction()` - Cancel an order
- `buildDepositMarginTx()` - Deposit and commit margin
- `buildWithdrawMarginTx()` - Uncommit and withdraw margin
- `createSetUserMarginTransaction()` - Set custom margin requirements

### Query Functions

- `getMarketData()` - Full market information
- `getMarketPrices()` - Just bid/ask/trade prices
- `getUserMarginBucket()` - User position and margin info
- `getMultipleMarketData()` - Batch market queries

### Calculation Functions

- `calcLiqPrice()` - Calculate liquidation price
- `calcLiqPriceOnNewOrder()` - Liquidation price after new order
- `priceMarginBucketPnl()` - Calculate P&L for margin bucket
- `calcMarginAvail()` - Calculate available balances

### Instruction Builders

- `orderEntryIx()` - Order entry instruction
- `cancelOrderIx()` - Cancel order instruction
- `depositIx()` - Deposit instruction
- `withdrawIx()` - Withdraw instruction
- `commitCollateralIx()` - Commit collateral instruction
- `uncommitCollateralIx()` - Uncommit collateral instruction
- `setUserMarginIx()` - Set user margin instruction
- `initCMAIx()` - Initialize CMA instruction
- `initMarketIx()` - Initialize market instruction

### PDA Derivation

- `cmaPda()` - Cross Margin Account address
- `marketPda()` - Market state address
- `orderDetailsPda()` - Order details storage address
- `marketOrderLogPda()` - Market order log address

## Error Handling

```typescript
try {
    const tx = await ember.buildOrderEntryTransaction(connection, params);
} catch (error) {
    if (
        error.message.includes('Market') &&
        error.message.includes('not found')
    ) {
        // Market doesn't exist
    } else if (error.message.includes('CMA account')) {
        // User account not initialized
    } else if (error.message.includes('Insufficient margin')) {
        // Not enough collateral
    }
}
```

## Best Practices

1. **Always use BigInt** for numeric values to avoid precision loss
2. **Check market data** before placing orders to ensure the market is active
3. **Validate orders** using the risk module before submission
4. **Handle account initialization** - the SDK automatically adds init instructions when needed
5. **Monitor margin requirements** - effective IM is max(user-set, market minimum)
6. **Use appropriate commitment levels** - 'confirmed' for queries, 'finalized' for critical operations
7. **Batch operations** when possible to reduce transaction costs

## Scripts

The SDK includes example scripts in the `scripts/` directory:

- `deposit.js` - Deposit and commit margin
- `withdraw.js` - Uncommit and withdraw margin
- `orderEntry.js` - Place orders
- `cancelOrder.js` - Cancel orders
- `queryMarginBucket.js` - Query user positions
- `queryMarketData.js` - Query market information

Run scripts with:

```bash
node scripts/scriptName.js [args]
```

## Environment Variables

- `EMBER_PROGRAM_ID` - Override default program ID
- `EMBER_USD_MINT` - Override default USD mint

## License

UNLICENSED - Proprietary software of Crocodile Labs

## Support

For issues and questions:

- GitHub Issues: [Report bugs and feature requests]
- Documentation: [Full API documentation]
- Contact: legal@crocodilelabs.io
