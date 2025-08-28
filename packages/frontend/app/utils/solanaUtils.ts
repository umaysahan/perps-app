/**
 * Formats a Solana address to show first 6 and last 6 characters
 * @param address - Full Solana address
 * @returns Formatted address like "2eovZe...eHCP3J"
 */
export function formatSolanaAddress(address: string): string {
    if (!address || address.length < 12) {
        return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

/**
 * Gets the explorer URL for a given token address
 * @param tokenAddress - SPL token address
 * @returns Full explorer URL
 */
export function getExplorerUrl(tokenAddress: string): string {
    const baseUrl =
        import.meta.env.VITE_EXPLORER_BASE_URL || 'https://fogoscan.com';
    return `${baseUrl}/token/${tokenAddress}`;
}
