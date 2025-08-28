import type { OrderDataSortBy } from '~/utils/orderbook/OrderBookIFs';
import styles from './OpenOrdersTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { TableSortDirection, HeaderCell } from '~/utils/CommonIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';

interface OpenOrdersTableHeaderProps {
    sortBy: OrderDataSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: OrderDataSortBy) => void;
    hasActiveOrders?: boolean;
    onCancelAll?: () => void;
}

export const OpenOrdersTableModel: HeaderCell<number>[] | HeaderCell<string>[] =
    [
        {
            name: 'Time',
            key: 'time',
            sortable: true,
            className: 'timeCell',
            exportable: true,
            exportAction: (data: number) => {
                return formatTimestamp(data).replaceAll(',', ' ');
            },
        } as HeaderCell<number>,
        {
            name: 'Type',
            key: 'orderType',
            sortable: true,
            className: styles.typeCell,
            exportable: true,
        },
        {
            name: 'Coin',
            key: 'coin',
            sortable: true,
            className: styles.coinCell,
            exportable: true,
        },
        {
            name: 'Direction',
            key: 'side',
            sortable: true,
            className: styles.directionCell,
            exportable: true,
        },
        {
            name: 'Size',
            key: 'sz',
            sortable: true,
            className: styles.sizeCell,
            exportable: true,
        },
        {
            name: 'Original Size',
            key: 'origSz',
            sortable: true,
            className: styles.originalSizeCell,
            exportable: true,
        },
        {
            name: 'Order Value',
            key: 'orderValue',
            sortable: true,
            className: styles.orderValueCell,
            exportable: true,
        },
        {
            name: 'Price',
            key: 'price',
            sortable: true,
            className: styles.priceCell,
            exportable: true,
        },
        {
            name: 'Reduce Only',
            key: 'reduceOnly',
            sortable: false,
            className: styles.reduceOnlyCell,
            exportable: true,
        },
        {
            name: 'Trigger Conditions',
            key: 'triggerConditions',
            sortable: false,
            className: styles.triggerConditionsCell,
            exportable: true,
        },
        {
            name: 'TP/SL',
            key: 'tpsl',
            sortable: false,
            className: styles.tpslCell,
            exportable: true,
        },
        {
            name: 'Cancel All',
            key: 'cancel',
            sortable: false,
            className: styles.cancelCell,
            exportable: true,
        },
    ];

export default function OpenOrdersTableHeader({
    sortBy,
    sortDirection,
    sortClickHandler,
}: OpenOrdersTableHeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {OpenOrdersTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${header.className} ${header.sortable ? styles.sortable : ''} ${header.key === sortBy ? styles.active : ''}`}
                    onClick={() => {
                        if (header.sortable) {
                            sortClickHandler(header.key as OrderDataSortBy);
                        }
                    }}
                >
                    {header.key === 'cancel' ? (
                        <button
                            className={`${styles.cancelButton} ${!hasActiveOrders ? styles.disabled : ''}`}
                            onClick={
                                hasActiveOrders && onCancelAll
                                    ? onCancelAll
                                    : undefined
                            }
                            disabled={!hasActiveOrders}
                            type='button'
                        >
                            Cancel All
                        </button>
                    ) : (
                        <>
                            {header.name}
                            {header.sortable && (
                                <SortIcon
                                    sortDirection={
                                        sortDirection && header.key === sortBy
                                            ? sortDirection
                                            : undefined
                                    }
                                />
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
