import React from 'react';
import {
    usePythConnectionStatus,
    useAllPythPrices,
} from '~/stores/PythPriceStore';
import { PRICE_STALENESS_THRESHOLD } from '~/utils/pythConfig';
import styles from './PythDebug.module.css';

const PythDebug: React.FC = () => {
    const isConnected = usePythConnectionStatus();
    const allPrices = useAllPythPrices();

    // Only show in development
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    return (
        <div className={styles.pythDebug}>
            <div className={styles.header}>
                <h4>Pyth Oracle Debug</h4>
                <div
                    className={`${styles.status} ${isConnected ? styles.connected : styles.disconnected}`}
                >
                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                </div>
            </div>

            {allPrices.size > 0 ? (
                <div className={styles.priceList}>
                    {Array.from(allPrices.entries()).map(
                        ([symbol, priceData]) => {
                            const age = currentTime - priceData.publishTime;
                            const isStale = age > PRICE_STALENESS_THRESHOLD;

                            return (
                                <div key={symbol} className={styles.priceItem}>
                                    <div className={styles.symbol}>
                                        {symbol}
                                    </div>
                                    <div className={styles.price}>
                                        $
                                        {priceData.price.toFixed(
                                            priceData.price >= 1 ? 2 : 6,
                                        )}
                                    </div>
                                    <div className={styles.confidence}>
                                        ±$
                                        {priceData.confidence.toFixed(
                                            priceData.confidence >= 1 ? 2 : 6,
                                        )}
                                    </div>
                                    <div
                                        className={`${styles.age} ${isStale ? styles.stale : ''}`}
                                    >
                                        {age}s ago
                                    </div>
                                </div>
                            );
                        },
                    )}
                </div>
            ) : (
                <div className={styles.noData}>
                    {isConnected
                        ? 'No price data yet'
                        : 'Waiting for connection...'}
                </div>
            )}
        </div>
    );
};

export default PythDebug;
