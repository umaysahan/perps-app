import styles from './FillTwapTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { TableSortDirection, HeaderCell } from '~/utils/CommonIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';
import type { UserFillSortBy } from '~/utils/UserDataIFs';

interface FillTwapTableHeaderProps {
    sortBy?: UserFillSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: UserFillSortBy) => void;
}

export const FillTwapTableModel: HeaderCell<number>[] | HeaderCell<string>[] = [
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
        name: 'Coin',
        key: 'coin',
        sortable: true,
        className: 'coinCell',
        exportable: true,
    },
    {
        name: 'Direction',
        key: 'side',
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
    },
    {
        name: 'Size',
        key: 'sz',
        sortable: true,
        className: 'sizeCell',
        exportable: true,
    },
    {
        name: 'Trade Value',
        key: 'value',
        sortable: true,
        className: 'tradeValueCell',
        exportable: true,
    },
    {
        name: 'Fee',
        key: 'fee',
        sortable: true,
        className: 'feeCell',
        exportable: true,
    },
    {
        name: 'Closed PNL',
        key: 'closedPnl',
        sortable: true,
        className: 'closedPnlCell',
        exportable: true,
    },
];

export default function FillTwapTableHeader({
    sortBy,
    sortDirection,
    sortClickHandler,
}: FillTwapTableHeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {FillTwapTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${styles[header.className]} ${header.sortable ? styles.sortable : ''}`}
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
