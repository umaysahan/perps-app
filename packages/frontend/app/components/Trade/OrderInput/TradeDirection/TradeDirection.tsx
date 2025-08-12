import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { useAppSettings } from '~/stores/AppSettingsStore';
import styles from './TradeDirection.module.css';
import type { OrderSide } from '../OrderInput';

interface propsIF {
    tradeDirection: OrderSide;
    setTradeDirection: React.Dispatch<React.SetStateAction<OrderSide>>;
}

// In case of any bugs or issues with this component, please reach out to Jr.
function TradeDirection(props: propsIF) {
    const { tradeDirection, setTradeDirection } = props;

    const { getBsColor } = useAppSettings();

    const disableButtons = false;

    const buyColor = getBsColor().buy;
    const sellColor = getBsColor().sell;

    const handleBuyClick = () => {
        setTradeDirection(tradeDirection === 'buy' ? 'sell' : 'buy');
    };

    const handleSellClick = () => {
        setTradeDirection(tradeDirection === 'buy' ? 'sell' : 'buy');
    };

    return (
        <div className={styles.trade_direction}>
            <div className={styles.buttons_wrapper}>
                {/* Animated background */}
                <motion.div
                    className={`${styles.toggle_background} ${
                        tradeDirection === 'buy'
                            ? styles.buy_active
                            : styles.sell_active
                    }`}
                    style={{
                        backgroundColor:
                            tradeDirection === 'buy' ? buyColor : sellColor,
                    }}
                    animate={{
                        x: tradeDirection === 'buy' ? '0%' : '100%',
                    }}
                    transition={{
                        duration: 0.3,
                        ease: [0.4, 0.0, 0.2, 1],
                    }}
                />

                {/* Buy Button */}
                <button
                    className={`${styles.toggle_button} ${
                        tradeDirection === 'buy' ? styles.active : ''
                    }`}
                    onClick={handleBuyClick}
                    disabled={disableButtons}
                >
                    Buy / Long
                </button>

                {/* Sell Button */}
                <button
                    className={`${styles.toggle_button} ${
                        tradeDirection === 'sell' ? styles.active : ''
                    }`}
                    onClick={handleSellClick}
                    disabled={disableButtons}
                >
                    Sell / Short
                </button>
            </div>
        </div>
    );
}

export default memo(TradeDirection);
