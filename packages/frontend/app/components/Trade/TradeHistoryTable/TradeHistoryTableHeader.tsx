import type { UserFillSortBy } from '~/utils/UserDataIFs';
import styles from './TradeHistoryTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { HeaderCell, TableSortDirection } from '~/utils/CommonIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';

interface TradeHistoryTableHeaderProps {
    sortBy?: UserFillSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: UserFillSortBy) => void;
}

export const TradeHistoryTableModel:
    | HeaderCell<number>[]
    | HeaderCell<string>[] = [
    {
        name: 'Time',
        key: 'time',
        sortable: true,
        className: 'timeCell',
        exportable: true,
        exportAction: (data: number) => {
            return formatTimestamp(data).replaceAll(';', ' ');
        },
    } as HeaderCell<number>,
    {
        name: 'Coin',
        key: 'coin',
        sortable: true,
        className: 'coinCell',
        exportable: true,
    },
    {
        name: 'Direction',
        key: 'dir',
        sortable: true,
        className: 'directionCell',
        exportable: true,
    },
    {
        name: 'Price',
        key: 'px',
        sortable: true,
        className: 'priceCell',
        exportable: true,
        exportAction: (v: number) => {
            return Number(v.toFixed(4)).toString();
        },
    },
    {
        name: 'Size',
        key: 'sz',
        sortable: true,
        className: 'sizeCell',
        exportable: true,
        exportAction: (v: number) => {
            const str = v >= 1 ? v.toFixed(2) : v.toFixed(4);
            return `="${str}"`;
        },
    },
    {
        name: 'Trade Value',
        key: 'value',
        sortable: true,
        className: 'tradeValueCell',
        exportable: true,
        exportAction: (v: number) => `="${v.toFixed(2)}"`,
    },
    {
        name: 'Fee',
        key: 'fee',
        sortable: true,
        className: 'feeCell',
        exportable: true,
        exportAction: (v: number) => {
            return Number(v.toFixed(4)).toString();
        },
    },
    {
        name: 'Closed PNL',
        key: 'closedPnl',
        sortable: true,
        className: 'closedPnlCell',
        exportable: true,
        exportAction: (v: number) => {
            return Number(v.toFixed(4)).toString();
        },
    },
];

export default function TradeHistoryTableHeader({
    sortBy,
    sortDirection,
    sortClickHandler,
}: TradeHistoryTableHeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {TradeHistoryTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${styles[header.className]} ${header.sortable ? styles.sortable : ''} ${header.key === sortBy ? styles.active : ''}`}
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
