import { useEffect, useState } from 'react';
import { useIsClient } from './useIsClient';

export enum Pages {
    HOME = 'home',
    TRADE = 'trade',
    PORTFOLIO = 'portfolio',
    VAULTS = 'vaults',
}

/**
 * Custom Hook to determine the current page based on the updated /v2/ routes
 */
export function usePage() {
    const isClient = useIsClient();
    const [page, setPage] = useState<Pages>();

    useEffect(() => {
        if (isClient) {
            const path = window.location.pathname;
            const parts = path.split('/');

            // Check for /v2/{page}
            if (parts.length > 2 && parts[1] === 'v2') {
                const pageSegment = parts[2];
                if (pageSegment === Pages.TRADE) {
                    setPage(Pages.TRADE);
                } else if (pageSegment === Pages.PORTFOLIO) {
                    setPage(Pages.PORTFOLIO);
                } else if (pageSegment === Pages.VAULTS) {
                    setPage(Pages.VAULTS);
                }
            } else if (parts.length === 2 && parts[1] === '') {
                setPage(Pages.HOME);
            }
        }
    }, [isClient]);

    return { page };
}
