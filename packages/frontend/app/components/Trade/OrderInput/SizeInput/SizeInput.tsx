import React, { useCallback, useMemo } from 'react';
import ComboBox from '~/components/Inputs/ComboBox/ComboBox';
import NumFormattedInput from '~/components/Inputs/NumFormattedInput/NumFormattedInput';
import type { OrderBookMode } from '~/utils/orderbook/OrderBookIFs';
import styles from './SizeInput.module.css';

interface PropsIF {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement> | string) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
    ariaLabel?: string;
    useTotalSize: boolean;
    symbol: string;
    selectedMode: OrderBookMode;
    setSelectedMode: React.Dispatch<React.SetStateAction<OrderBookMode>>;
    onFocus: () => void;
}

const SizeInput: React.FC<PropsIF> = React.memo((props) => {
    const {
        value,
        onChange,
        onBlur,
        onKeyDown,
        className,
        ariaLabel,
        useTotalSize,
        symbol,
        selectedMode,
        setSelectedMode,
        onFocus,
    } = props;

    // Memoized ComboBox options
    const comboBoxOptions = useMemo(
        () => ['USD', symbol.toUpperCase()],
        [symbol],
    );

    // Memoized ComboBox onChange handler
    const handleComboBoxChange = useCallback(
        (val: string) => {
            setSelectedMode(val === symbol.toUpperCase() ? 'symbol' : 'usd');
        },
        [setSelectedMode, symbol],
    );

    return (
        <div className={styles.sizeInputContainer}>
            <span>{useTotalSize ? 'Total Size' : 'Size'}</span>
            <NumFormattedInput
                id='trade-module-size-input'
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className={className}
                aria-label={ariaLabel}
                placeholder='Enter Size'
                onFocus={onFocus}
            />
            <button className={styles.tokenButton}>
                <ComboBox
                    key={selectedMode}
                    value={
                        selectedMode === 'usd' ? 'USD' : symbol.toUpperCase()
                    }
                    options={comboBoxOptions}
                    onChange={handleComboBoxChange}
                    cssPositioning='fixed'
                />
            </button>
        </div>
    );
});

export default SizeInput;
