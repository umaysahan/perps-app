import { useState, useCallback, memo, useMemo } from 'react';
import styles from './PortfolioDeposit.module.css';
import Tooltip from '~/components/Tooltip/Tooltip';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useDebouncedCallback } from '~/hooks/useDebounce';
import TokenDropdown, {
    AVAILABLE_TOKENS,
    type Token,
} from '~/components/TokenDropdown/TokenDropdown';
import SimpleButton from '~/components/SimpleButton/SimpleButton';
import FogoLogo from '../../../assets/tokens/FOGO.svg';
import { useNotificationStore } from '~/stores/NotificationStore';
import useNumFormatter from '~/hooks/useNumFormatter';

interface propsIF {
    portfolio: {
        id: string;
        name: string;
        availableBalance: number;
        unit?: string;
    };
    onDeposit: (amount: number) => void | Promise<any>;
    onClose: () => void;
    isProcessing?: boolean;
}

function PortfolioDeposit(props: propsIF) {
    const { portfolio, onDeposit, isProcessing = false } = props;
    const notificationStore = useNotificationStore();
    const { formatNum } = useNumFormatter();

    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<
        'idle' | 'pending' | 'success' | 'failed'
    >('idle');
    const [selectedToken, setSelectedToken] = useState<Token>(
        AVAILABLE_TOKENS.find(
            (token) => token.symbol === (portfolio.unit || 'USDe'),
        ) || AVAILABLE_TOKENS[0],
    );

    // Available balance for this portfolio
    const availableBalance = portfolio.availableBalance;

    const debouncedHandleChange = useDebouncedCallback((newValue: string) => {
        setAmount(newValue);
        setError(null);
    }, 20);

    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;
            debouncedHandleChange(newValue);
            // Clear transaction status when user starts typing
            setTransactionStatus('idle');
        },
        [debouncedHandleChange],
    );

    const handleMaxClick = useCallback(() => {
        setAmount(availableBalance.toString());
        setError(null);
    }, [availableBalance]);

    const handleDeposit = useCallback(async () => {
        const depositAmount = parseFloat(amount);
        setError(null);
        setTransactionStatus('pending');

        if (!depositAmount || isNaN(depositAmount)) {
            setError('Please enter a valid amount');
            setTransactionStatus('idle');
            return;
        }

        if (depositAmount <= 0) {
            setError('Amount must be greater than 0');
            setTransactionStatus('idle');
            return;
        }

        // Check minimum deposit of $10
        if (depositAmount < 10) {
            setError('Minimum deposit amount is $10.00');
            setTransactionStatus('idle');
            return;
        }

        if (depositAmount > availableBalance) {
            setError(`Amount exceeds available balance of ${availableBalance}`);
            setTransactionStatus('idle');
            return;
        }

        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(
                    () =>
                        reject(
                            new Error('Transaction timed out after 15 seconds'),
                        ),
                    15000,
                );
            });

            // Race between the deposit and the timeout
            const result = await Promise.race([
                onDeposit(depositAmount),
                timeoutPromise,
            ]);

            // Check if the result indicates failure
            if (result && result.success === false) {
                setTransactionStatus('failed');
                setError(result.error || 'Transaction failed');
            } else {
                setTransactionStatus('success');
                setAmount(''); // Clear form on success

                // Show success notification
                notificationStore.add({
                    title: 'Deposit Successful',
                    message: `Successfully deposited $${depositAmount.toFixed(2)} USD`,
                    icon: 'check',
                });

                // Close modal on success - notification will show after modal closes
                if (props.onClose) {
                    props.onClose();
                }
            }
        } catch (error) {
            setTransactionStatus('failed');
            setError(error instanceof Error ? error.message : 'Deposit failed');
        }
    }, [amount, availableBalance, onDeposit]);

    const handleTokenSelect = useCallback((token: Token) => {
        setSelectedToken(token);
    }, []);

    const USD_FORMATTER = useMemo(
        () =>
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }),
        [],
    );

    const OTHER_FORMATTER = useMemo(
        () =>
            new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
            }),
        [],
    );

    const formatCurrency = useCallback(
        (value: number, unit: string) => {
            if (unit === 'USD') {
                return USD_FORMATTER.format(value);
            }
            return `${OTHER_FORMATTER.format(value)} ${unit}`;
        },
        [USD_FORMATTER, OTHER_FORMATTER],
    );

    // Memoize info items to prevent recreating on each render
    const infoItems = useMemo(() => {
        // Check if this is a USD-related token
        const isUSDToken =
            selectedToken.symbol === 'USD' ||
            selectedToken.symbol === 'USDe' ||
            selectedToken.symbol === 'fUSD' ||
            portfolio.unit === 'USD';

        return [
            {
                label: 'Available to deposit',
                value: isUSDToken
                    ? formatNum(availableBalance, 2, true, true) // Use app formatter for USD values
                    : formatCurrency(availableBalance, selectedToken.symbol),
                tooltip:
                    'The maximum amount you can deposit based on your balance',
            },
            {
                label: 'Network Fee',
                value:
                    selectedToken.symbol === 'BTC' ? '0.00001 BTC' : '$0.001',
                tooltip: 'Fee charged for processing the deposit transaction',
            },
        ];
    }, [
        availableBalance,
        selectedToken.symbol,
        portfolio.unit,
        formatCurrency,
        formatNum,
    ]);

    // Check if amount is below minimum
    const isBelowMinimum = useMemo(() => {
        if (!amount) return false;
        const depositAmount = parseFloat(amount);
        return !isNaN(depositAmount) && depositAmount > 0 && depositAmount < 10;
    }, [amount]);

    const isButtonDisabled = useMemo(
        () =>
            isProcessing ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > availableBalance,
        [isProcessing, amount, availableBalance],
    );

    return (
        <div className={styles.container}>
            <div className={styles.textContent}>
                <img src={FogoLogo} alt='Fogo Chain Logo' width='64px' />
                <h4>Deposit {selectedToken.symbol} from Fogo</h4>
            </div>

            <TokenDropdown
                selectedToken={selectedToken.symbol}
                onTokenSelect={handleTokenSelect}
                disabled={isProcessing}
                className={styles.tokenDropdown}
            />

            <div className={styles.inputContainer}>
                <h6>
                    Amount{' '}
                    {isBelowMinimum && (
                        <span className={styles.minWarning}>(Min: $10)</span>
                    )}
                </h6>
                <input
                    type='text'
                    value={amount}
                    onChange={handleInputChange}
                    aria-label='deposit input'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    placeholder='Enter amount (min $10)'
                    min='0'
                    step='any'
                    disabled={isProcessing}
                />
                <button
                    onClick={handleMaxClick}
                    disabled={isProcessing}
                    className={styles.maxButton}
                >
                    Max
                </button>
                {error && <div className={styles.error}>{error}</div>}
                {transactionStatus === 'failed' && !error && (
                    <div className={styles.error}>
                        Transaction failed. Please try again.
                    </div>
                )}
            </div>

            <div className={styles.contentContainer}>
                {infoItems.map((info, idx) => (
                    <div className={styles.infoRow} key={idx}>
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
                        <div className={styles.infoValue}>{info.value}</div>
                    </div>
                ))}
            </div>

            <SimpleButton
                bg='accent1'
                onClick={handleDeposit}
                disabled={isButtonDisabled || isBelowMinimum}
            >
                {transactionStatus === 'pending'
                    ? 'Confirming Transaction...'
                    : isProcessing
                      ? 'Processing...'
                      : 'Deposit'}
            </SimpleButton>
        </div>
    );
}

// Export memoized component
export default memo(PortfolioDeposit);
