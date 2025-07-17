import type { TableSortDirection, HeaderCell } from '~/utils/CommonIFs';
import styles from './HistoryTwapTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { UserFillSortBy } from '~/utils/UserDataIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';

export const HistoryTwapTableModel:
    | HeaderCell<number>[]
    | HeaderCell<string>[] = [
    {
        name: 'Time',
        key: 'time',
        sortable: true,
        className: 'timeCell',
        exportable: true,
        exportAction: (data: number) => {
            // There is an error here because date is 1970 !!!  console.log(formatTimestamp(data).replaceAll(',', ' '))
            return formatTimestamp(data).replaceAll(',', ' ');
        },
    } as HeaderCell<number>,
    {
        name: 'Coin',
        key: 'coin',
        sortable: true,
        className: styles.coinCell,
        exportable: true,
    },
    {
        name: 'Total Size',
        key: 'side',
        sortable: true,
        className: styles.totalSizeCell,
        exportable: true,
    },
    {
        name: 'Executed Size',
        key: 'px',
        sortable: true,
        className: styles.executedSizeCell,
        exportable: true,
    },
    {
        name: 'Average Price',
        key: 'sz',
        sortable: true,
        className: styles.averagePriceCell,
        exportable: true,
    },
    {
        name: 'Total Runtime',
        key: 'value',
        sortable: true,
        className: styles.totalRuntimeCell,
        exportable: true,
    },
    {
        name: 'Reduce Only',
        key: 'fee',
        sortable: true,
        className: styles.reduceOnlyCell,
        exportable: true,
    },
    {
        name: 'Randomize',
        key: 'closedPnl',
        sortable: true,
        className: styles.randomizeCell,
        exportable: true,
    },
    {
        name: 'Status',
        key: 'status',
        sortable: true,
        className: styles.statusCell,
        exportable: true,
    },
];

interface HistoryTwapTableHeaderProps {
    sortBy?: UserFillSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: UserFillSortBy) => void;
}

export default function HistoryTwapTableHeader({
    sortBy,
    sortDirection,
    sortClickHandler,
}: HistoryTwapTableHeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {HistoryTwapTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${header.className} ${header.sortable ? styles.sortable : ''}`}
                    onClick={() => {
                        if (header.sortable) {
                            sortClickHandler(header.key as UserFillSortBy);
                        }
                    }}
                >
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
                </div>
            ))}
        </div>
    );
}
