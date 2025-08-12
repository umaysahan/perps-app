import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router';
import useNumFormatter from '~/hooks/useNumFormatter';
import { useAppSettings } from '~/stores/AppSettingsStore';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import styles from './watchlistnode.module.css';
import Tooltip from '~/components/Tooltip/Tooltip';

interface WatchListNodeProps {
    coin: string;
    markPx: number;
    prevDayPx: number;
    isActive: boolean;
    showMode: 'dollar' | 'percent';
    disabled?: boolean;
}

const WatchListNode: React.FC<WatchListNodeProps> = memo(
    ({ coin, markPx, prevDayPx, isActive, showMode, disabled }) => {
        const navigate = useNavigate();
        const { formatNum } = useNumFormatter();
        const { symbol: storeSymbol, setSymbol: setStoreSymbol } =
            useTradeDataStore();
        const { getBsColor } = useAppSettings();

        const change = useMemo(() => markPx - prevDayPx, [markPx, prevDayPx]);

        const nodeClickListener = useMemo(
            () => () => {
                if (coin === storeSymbol || disabled) return;
                setStoreSymbol(coin);
                navigate(`/v2/trade/${coin}`, { viewTransition: true });
            },
            [coin, storeSymbol, setStoreSymbol, navigate],
        );

        const shownVal = useMemo(() => {
            if (showMode === 'dollar') {
                return formatNum(markPx);
            }
            const percentage = ((markPx - prevDayPx) / prevDayPx) * 100;
            return `${change > 0 ? '+' : ''}${formatNum(percentage, 2)}%`;
        }, [showMode, change, formatNum, markPx, prevDayPx]);

        const color = useMemo(
            () =>
                change > 0
                    ? getBsColor().buy
                    : change < 0
                      ? getBsColor().sell
                      : 'var(--text1)',
            [change, getBsColor],
        );

        return (
            <Tooltip position='top' content={disabled ? 'Coming Soon' : ''}>
                <div
                    className={`${styles.watchListNodeContainer} ${disabled ? styles.disabled : ''}`}
                >
                    <div
                        className={`${styles.watchListNodeContent} ${isActive ? styles.active : ''}`}
                        onClick={nodeClickListener}
                    >
                        <div className={styles.symbolName}>{coin}-USD</div>
                        <div
                            className={styles.symbolValue}
                            style={{ color, width: `${shownVal.length * 7}px` }}
                        >
                            {shownVal}
                        </div>
                    </div>
                </div>
            </Tooltip>
        );
    },
    (prev, next) =>
        prev.coin === next.coin &&
        prev.markPx === next.markPx &&
        prev.prevDayPx === next.prevDayPx &&
        prev.isActive === next.isActive &&
        prev.showMode === next.showMode,
);

export default WatchListNode;
