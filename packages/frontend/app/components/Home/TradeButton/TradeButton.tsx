import { Link, useNavigation } from 'react-router';
import styles from './TradeButton.module.css';
import { useTradeDataStore } from '~/stores/TradeDataStore';
export default function TradeButton() {
    const navigation = useNavigation();
    const { symbol } = useTradeDataStore();
    const isNavigating = navigation.state !== 'idle';

    return (
        <>
            <Link
                to={`/v2/trade/${symbol}`}
                className={styles.tradeButton}
                viewTransition
            >
                {isNavigating ? 'Loading...' : 'Start Trading'}
            </Link>
        </>
    );
}
