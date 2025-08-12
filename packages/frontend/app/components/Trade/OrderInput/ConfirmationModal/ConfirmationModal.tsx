import styles from './ConfirmationModal.module.css';
import Tooltip from '~/components/Tooltip/Tooltip';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import ToggleSwitch from '../../ToggleSwitch/ToggleSwitch';
import type { modalContentT } from '../OrderInput';
import { useAppSettings } from '~/stores/AppSettingsStore';

interface propsIF {
    tx: modalContentT;
    submitFn: () => void;
    size: {
        qty: string;
        denom: string;
    };
    limitPrice?: string;
    isEnabled: boolean;
    toggleEnabled: () => void;
    isProcessing?: boolean;
}
type InfoItem = {
    label: string;
    value: string;
    tooltip?: string;
    className?: string;
    valueStyle?: React.CSSProperties;
};

export default function ConfirmationModal(props: propsIF) {
    const {
        submitFn,
        tx,
        isEnabled,
        toggleEnabled,
        size,
        limitPrice,
        isProcessing,
    } = props;

    const { getBsColor } = useAppSettings();

    const buyColor = getBsColor().buy;
    const sellColor = getBsColor().sell;

    const dataInfo: InfoItem[] = [
        {
            label: 'Action',
            value: tx.includes('buy') ? 'Buy' : 'Sell',
            valueStyle: {
                color: tx.includes('buy')
                    ? getBsColor().buy
                    : getBsColor().sell,
            },
        },
        {
            label: 'Size',
            value: `${size.qty || '--'} ${size.denom}`,
            valueStyle: {
                color: tx.includes('buy')
                    ? getBsColor().buy
                    : getBsColor().sell,
            },
        },
        {
            label: 'Price',
            value: tx.includes('limit') ? limitPrice || '--' : 'Market',
            className: styles.white,
        },
        {
            label: 'Est. Liquidation Price',
            value: 'N/A',
            tooltip:
                'Estimated price at which your position will be liquidated',
            className: styles.white,
        },
        {
            label: 'Network Fee',
            value: '0.000001 FOGO',
            tooltip: 'Fee required to execute this trade on the network',
            className: styles.white,
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.contentContainer}>
                {dataInfo.map((info) => (
                    <div className={styles.infoRow}>
                        <div className={styles.infoLabel}>
                            {info.label}
                            {info?.tooltip && (
                                <Tooltip
                                    content={info?.tooltip}
                                    position='right'
                                >
                                    <AiOutlineQuestionCircle size={13} />
                                </Tooltip>
                            )}
                        </div>
                        <div
                            className={`${styles.infoValue} ${
                                info?.className && info.className
                            }`}
                            style={{
                                ...info?.valueStyle,
                            }}
                        >
                            {info.value}
                        </div>
                    </div>
                ))}
            </div>
            <div className={styles.toggleContainer}>
                <ToggleSwitch
                    isOn={!isEnabled}
                    onToggle={toggleEnabled}
                    label={"Don't show this again"}
                    // reverse
                />
            </div>
            <button
                className={styles.confirmButton}
                onClick={isProcessing ? undefined : submitFn}
                style={{
                    height: '47px',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    backgroundColor: tx.includes('buy') ? buyColor : sellColor,
                }}
                disabled={isProcessing}
            >
                {isProcessing
                    ? 'Confirming Transaction...'
                    : tx.includes('buy')
                      ? 'Buy / Long'
                      : 'Sell / Short'}
            </button>
        </div>
    );
}
