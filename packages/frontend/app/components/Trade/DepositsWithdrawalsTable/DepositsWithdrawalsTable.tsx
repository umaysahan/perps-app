import { useMemo, useRef } from 'react';
import GenericTable from '~/components/Tables/GenericTable/GenericTable';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import type { TableSortDirection } from '~/utils/CommonIFs';
import { EXTERNAL_PAGE_URL_PREFIX } from '~/utils/Constants';
import type {
    DepositAndWithDrawalSortBy,
    DepositAndWithDrawalIF,
} from '~/utils/UserDataIFs';
import DepositsWithdrawalsTableHeader, {
    DepositsWithdrawalsTableModel,
} from './DepositsWithdrawalsTableHeader';
import DepositsWithdrawalsTableRow, {
    type TransactionData,
} from './DepositsWithdrawalsTableRow';
import { useInfoApi } from '~/hooks/useInfoApi';

function sortTransactionData(
    data: TransactionData[],
    sortBy: DepositAndWithDrawalSortBy,
    sortDirection: TableSortDirection,
): TransactionData[] {
    const copy = [...data];
    if (!sortBy || !sortDirection) return copy;

    const { fetchUserNonFundingLedgerUpdates } = useInfoApi();

    const getKey = (tx: TransactionData): string | number => {
        const d = tx.delta as any;
        switch (sortBy) {
            case 'time':
                return tx.time;
            case 'status':
                return 'Completed';
            case 'network':
                return d.token || '';
            case 'action':
                return d.type;
            case 'valueChange':
                return parseFloat(d.amount || d.usdc || '0');
            case 'fee':
                return parseFloat(d.nativeTokenFee || d.fee || '0');
            default:
                return '';
        }
    };

    copy.sort((a, b) => {
        const aKey = getKey(a),
            bKey = getKey(b);
        if (typeof aKey === 'number' && typeof bKey === 'number') {
            return sortDirection === 'asc' ? aKey - bKey : bKey - aKey;
        }
        return sortDirection === 'asc'
            ? String(aKey).localeCompare(String(bKey))
            : String(bKey).localeCompare(String(aKey));
    });

    return copy;
}

interface DepositsWithdrawalsTableProps {
    isFetched: boolean;
    pageMode?: boolean;
    data?: TransactionData[];
}

export default function DepositsWithdrawalsTable(
    props: DepositsWithdrawalsTableProps,
) {
    const { isFetched, pageMode } = props;
    const transactions = useTradeDataStore(
        (s) => s.userNonFundingLedgerUpdates,
    );

    const sortedTxs = useMemo(
        () => [...transactions].sort((a, b) => b.time - a.time),
        [transactions],
    );
    const { fetchUserNonFundingLedgerUpdates } = useInfoApi();

    const { userAddress } = useUserDataStore();
    const currentUserRef = useRef<string>('');
    currentUserRef.current = userAddress;

    const viewAllLink = userAddress
        ? `${EXTERNAL_PAGE_URL_PREFIX}/depositsandwithdrawals/${userAddress}`
        : `${EXTERNAL_PAGE_URL_PREFIX}/depositsandwithdrawals`;

    return (
        <GenericTable<
            TransactionData,
            DepositAndWithDrawalSortBy,
            (
                address: string,
                aggregateByTime: boolean,
            ) => Promise<TransactionData[]>
        >
            storageKey={`DepositsWithdrawalsTable_${currentUserRef.current}`}
            data={sortedTxs}
            renderHeader={(dir, onSort, by) => (
                <DepositsWithdrawalsTableHeader
                    sortBy={by}
                    sortDirection={dir}
                    sortClickHandler={onSort}
                />
            )}
            renderRow={(tx, idx) => (
                <DepositsWithdrawalsTableRow
                    key={`tx-${idx}`}
                    transaction={tx}
                />
            )}
            sorterMethod={sortTransactionData}
            isFetched={isFetched}
            pageMode={pageMode}
            viewAllLink={viewAllLink}
            skeletonRows={7}
            skeletonColRatios={[2, 1, 1, 1, 1, 1, 1, 1]}
            defaultSortBy='time'
            defaultSortDirection='desc'
            tableModel={DepositsWithdrawalsTableModel}
            csvDataFetcher={fetchUserNonFundingLedgerUpdates}
            csvDataFetcherArgs={[userAddress, true]}
        />
    );
}
