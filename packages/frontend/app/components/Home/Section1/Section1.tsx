import TradeButton from '../TradeButton/TradeButton';
import styles from './Section1.module.css';
import tradeImage from './tradepage.png';

export default function Section1() {
    return (
        <div className={styles.sub_container}>
            <h2>
                A <span>new generation</span> DEX
            </h2>

            <div className={styles.sub_container_grid}>
                <div className={styles.sub_container_content}>
                    <div className={styles.item_containers}>
                        <h2>Faster</h2>
                        <h2>Easier</h2>
                        <h2>Cheaper</h2>
                    </div>
                    <p>
                        Ambient runs the entire DEX inside a single smart
                        contract, allowing for low fee transactions, greater
                        liquidity rewards, and a fairer trading experience.
                    </p>
                </div>
                <div className={styles.trade_image_container}>
                    <img src={tradeImage} alt='' />
                    <div className={styles.trade_image_overlay}>
                        <TradeButton />
                    </div>
                </div>
            </div>
        </div>
    );
}
