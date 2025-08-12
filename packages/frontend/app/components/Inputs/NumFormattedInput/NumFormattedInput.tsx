import { useCallback, useEffect, useRef } from 'react';
import useNumFormatter from '~/hooks/useNumFormatter';
import styles from './NumFormattedInput.module.css';

interface NumFormattedInputProps {
    id?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement> | string) => void;
    onFocus?: () => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
    ariaLabel?: string;
    placeholder?: string;
}

const NumFormattedInput: React.FC<NumFormattedInputProps> = ({
    id,
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    className,
    ariaLabel,
    placeholder,
}) => {
    const {
        inputRegex,
        parseFormattedWithOnlyDecimals,
        formatNumWithOnlyDecimals,
    } = useNumFormatter();

    const valueNum = useRef<number | null>(null);

    useEffect(() => {
        if (valueNum.current === null) {
            return;
        }
        const str = formatNumWithOnlyDecimals(valueNum.current);
        onChange(str);
    }, [inputRegex]);

    // Memoized input change handler
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            if (inputRegex.test(newValue) && newValue.length <= 12) {
                onChange(event);
                valueNum.current = parseFormattedWithOnlyDecimals(newValue);
            }
        },
        [inputRegex, onChange, parseFormattedWithOnlyDecimals],
    );

    useEffect(() => {
        if (!value) {
            valueNum.current = null;
            return;
        }
        valueNum.current = parseFormattedWithOnlyDecimals(value);
    }, [parseFormattedWithOnlyDecimals, value]);

    return (
        <>
            <input
                {...(id && { id })}
                type='text'
                value={value}
                onChange={handleChange}
                onFocus={onFocus}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                className={styles.numFormattedInput + ' ' + className}
                aria-label={ariaLabel}
                inputMode='numeric'
                pattern='[0-9]*'
                placeholder={placeholder}
            />
        </>
    );
};

export default NumFormattedInput;
