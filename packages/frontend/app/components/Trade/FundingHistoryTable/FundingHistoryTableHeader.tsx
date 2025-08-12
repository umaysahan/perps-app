import type { UserFundingSortBy } from '~/utils/UserDataIFs';
import styles from './FundingHistoryTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { HeaderCell, TableSortDirection } from '~/utils/CommonIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';

interface FundingHistoryTableHeaderProps {
    sortBy?: UserFundingSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: UserFundingSortBy) => void;
}

export const FundingHistoryTableModel:
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
        name: 'Size',
        key: 'szi',
        sortable: true,
        className: 'sizeCell',
        exportable: true,
        exportAction: (v: number) => {
            const str = v >= 1 ? v.toFixed(3) : v.toFixed(4);
            return `="${str}"`;
        },
    },
    {
        name: 'Position Side',
        key: 'szi',
        sortable: false,
        className: 'positionSideCell',
        exportable: true,
        exportAction: (v: number) =>
            v > 0 ? 'Long' : v < 0 ? 'Short' : 'Neutral',

        /* fundingHistory.szi > 0
                            ? getBsColor().buy
                            : fundingHistory.szi < 0
                              ? getBsColor().sell
                              : 'var(--text-default)',*/
    },
    {
        name: 'Payment',
        key: 'usdc',
        sortable: true,
        className: 'paymentCell',
        exportable: true,
        exportAction: (v: number) => {
            return Number(v.toFixed(6)).toString();
        },
    },
    {
        name: 'Rate',
        key: 'fundingRate',
        sortable: true,
        className: 'rateCell',
        exportable: true,
        exportAction: (v: number) => {
            return Number(v.toFixed(6)).toString();
        },
    },
];

export default function FundingHistoryTableHeader(
    props: FundingHistoryTableHeaderProps,
) {
    const { sortBy, sortDirection, sortClickHandler } = props;

    return (
        <div className={styles.headerContainer}>
            {FundingHistoryTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${styles[header.className]} ${header.sortable ? styles.sortable : ''}`}
                    onClick={() => {
                        if (header.sortable) {
                            sortClickHandler(header.key as UserFundingSortBy);
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
