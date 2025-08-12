import { useState } from 'react';
import styles from './MarginModal.module.css';
import { type marginModesT } from '~/stores/TradeDataStore';

interface propsIF {
    initial: marginModesT;
    handleConfirm: (m: marginModesT) => void;
}

export default function MarginModal(props: propsIF) {
    const { initial, handleConfirm } = props;

    // hook to track current user selection until CTA is clicked
    const [intermediate, setIntermediate] = useState<marginModesT>(initial);

    return (
        <section className={styles.margin_modal_content}>
            <div className={styles.margin_buttons}>
                <button
                    className={
                        styles[intermediate === 'cross' ? 'selected' : '']
                    }
                    onClick={() => setIntermediate('cross')}
                >
                    <h3>Cross Margin</h3>
                    <p>
                        All cross positions share the same cross margin as
                        collateral. In the event of liquidation, your cross
                        margin balance and any remaining open positions under
                        assets in this mode may be forfeited.
                    </p>
                </button>
                <button
                    className={
                        styles[intermediate === 'isolated' ? 'selected' : '']
                    }
                    onClick={() => setIntermediate('isolated')}
                >
                    <h3>Isolated Mode</h3>
                    <p>
                        Manage your risk on individual positions by restricting
                        the amount of margin allocated to each. If the margin
                        ratio of an isolated position reaches 100%, the position
                        will be liquidated. Margin can be added or removed to
                        individual positions in this mode.
                    </p>
                </button>
            </div>
            <button onClick={() => handleConfirm(intermediate)}>Confirm</button>
        </section>
    );
}
