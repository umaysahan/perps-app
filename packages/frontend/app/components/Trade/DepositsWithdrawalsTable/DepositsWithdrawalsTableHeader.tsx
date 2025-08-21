import type { DepositAndWithDrawalSortBy } from '~/utils/UserDataIFs';
import styles from './DepositsWithdrawalsTable.module.css';
import SortIcon from '~/components/Vault/SortIcon';
import type { HeaderCell, TableSortDirection } from '~/utils/CommonIFs';
import { formatTimestamp } from '~/utils/orderbook/OrderBookUtils';
import {
    getAction,
    getFee,
    getNetwork,
    getValueChange,
} from './DepositsWithdrawalsTableRow';

interface DepositsWithdrawalsTableHeaderProps {
    sortBy?: DepositAndWithDrawalSortBy;
    sortDirection: TableSortDirection;
    sortClickHandler: (key: DepositAndWithDrawalSortBy) => void;
}

export const DepositsWithdrawalsTableModel:
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
        name: 'Status',
        key: 'status',
        sortable: true,
        className: 'statusCell',
        exportable: true,
        exportFromRow: (_row: any) => 'Completed',
    },
    {
        name: 'Network',
        key: 'network',
        sortable: true,
        className: 'networkCell',
        exportable: true,
        exportFromRow: (row: any) => getNetwork(row),
    },
    {
        name: 'Action',
        key: 'action',
        sortable: true,
        className: 'actionCell',
        exportable: true,
        exportFromRow: (row: any) => getAction(row),
    },
    {
        name: 'Account Value Change',
        key: 'valueChange',
        sortable: true,
        className: 'valueChangeCell',
        exportable: true,
        exportFromRow: (row: any) => getValueChange(row),
    },
    {
        name: 'Fee',
        key: 'fee',
        sortable: true,
        className: 'feeCell',
        exportable: true,
        exportFromRow: (row: any) => getFee(row),
    },
];

export default function DepositsWithdrawalsTableHeader({
    sortBy,
    sortDirection,
    sortClickHandler,
}: DepositsWithdrawalsTableHeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {DepositsWithdrawalsTableModel.map((header) => (
                <div
                    key={header.key}
                    className={`${styles.cell} ${styles.headerCell} ${styles[header.className]} ${header.sortable ? styles.sortable : ''}`}
                    onClick={() => {
                        if (header.sortable) {
                            sortClickHandler(
                                header.key as DepositAndWithDrawalSortBy,
                            );
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
