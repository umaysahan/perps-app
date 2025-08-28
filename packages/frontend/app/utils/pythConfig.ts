/**
 * Pyth Network configuration for price feeds
 * Price feed IDs from: https://pyth.network/developers/price-feed-ids
 */

export interface PythPriceFeedConfig {
    id: string;
    symbol: string;
    description: string;
}

// Mainnet price feed IDs for major cryptocurrencies
export const PYTH_PRICE_FEEDS: Record<string, PythPriceFeedConfig> = {
    BTC: {
        id: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
        symbol: 'BTC/USD',
        description: 'Bitcoin USD price feed',
    },
    ETH: {
        id: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
        symbol: 'ETH/USD',
        description: 'Ethereum USD price feed',
    },
    SOL: {
        id: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
        symbol: 'SOL/USD',
        description: 'Solana USD price feed',
    },
    ARB: {
        id: '0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5',
        symbol: 'ARB/USD',
        description: 'Arbitrum USD price feed',
    },
    AVAX: {
        id: '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7',
        symbol: 'AVAX/USD',
        description: 'Avalanche USD price feed',
    },
    BNB: {
        id: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
        symbol: 'BNB/USD',
        description: 'Binance Coin USD price feed',
    },
    DOGE: {
        id: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c',
        symbol: 'DOGE/USD',
        description: 'Dogecoin USD price feed',
    },
    MATIC: {
        id: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
        symbol: 'MATIC/USD',
        description: 'Polygon USD price feed',
    },
    OP: {
        id: '0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
        symbol: 'OP/USD',
        description: 'Optimism USD price feed',
    },
    PEPE: {
        id: '0xd69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4',
        symbol: 'PEPE/USD',
        description: 'Pepe USD price feed',
    },
    WIF: {
        id: '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
        symbol: 'WIF/USD',
        description: 'dogwifhat USD price feed',
    },
    NEAR: {
        id: '0xc415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750',
        symbol: 'NEAR/USD',
        description: 'NEAR Protocol USD price feed',
    },
    LTC: {
        id: '0x6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54',
        symbol: 'LTC/USD',
        description: 'Litecoin USD price feed',
    },
    LINK: {
        id: '0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221',
        symbol: 'LINK/USD',
        description: 'Chainlink USD price feed',
    },
    UNI: {
        id: '0x78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501',
        symbol: 'UNI/USD',
        description: 'Uniswap USD price feed',
    },
    APT: {
        id: '0x03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5',
        symbol: 'APT/USD',
        description: 'Aptos USD price feed',
    },
    XRP: {
        id: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8',
        symbol: 'XRP/USD',
        description: 'XRP USD price feed',
    },
    JTO: {
        id: '0xb43124b15628662de0e66fc3f66fd9c2967481c335f2293ac5ac982ad4534f22',
        symbol: 'JTO/USD',
        description: 'Jito USD price feed',
    },
    BONK: {
        id: '0x72b021217ca3fe68922a19aaf990109cb9d84e9ad004b4d2025ad6f529314419',
        symbol: 'BONK/USD',
        description: 'Bonk USD price feed',
    },
};

// Pyth Hermes service endpoints
export const PYTH_ENDPOINTS = {
    mainnet: 'https://hermes.pyth.network',
    testnet: 'https://hermes-beta.pyth.network',
};

// Use mainnet for production
export const PYTH_ENDPOINT = PYTH_ENDPOINTS.mainnet;

// WebSocket endpoint for real-time price updates
export const PYTH_WS_ENDPOINT = 'wss://hermes.pyth.network/ws';

// Price staleness threshold in seconds
export const PRICE_STALENESS_THRESHOLD = 30;

// Helper function to get price feed ID for a symbol
export function getPriceFeedId(symbol: string): string | undefined {
    const feedId = PYTH_PRICE_FEEDS[symbol]?.id;
    if (!feedId) {
        console.log(
            `[pythConfig] No feed found for symbol: ${symbol}. Available symbols:`,
            Object.keys(PYTH_PRICE_FEEDS),
        );
    }
    return feedId;
}

// Helper function to check if a symbol has a Pyth price feed
export function hasPythPriceFeed(symbol: string): boolean {
    return symbol in PYTH_PRICE_FEEDS;
}
