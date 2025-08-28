import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ExternalPage from '~/components/ExternalPage/ExternalPage';
import DepositsWithdrawalsTable from '~/components/Trade/DepositsWithdrawalsTable/DepositsWithdrawalsTable';
import type { TransactionData } from '~/components/Trade/DepositsWithdrawalsTable/DepositsWithdrawalsTableRow';
import { useInfoApi } from '~/hooks/useInfoApi';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';

export default function DepositsAndWithdrawals() {
    const { address } = useParams<{ address?: string }>();
    const walletAddress = useUserDataStore((s) => s.userAddress);
    const targetAddress = address ?? walletAddress;

    const { fetchUserNonFundingLedgerUpdates } = useInfoApi();
    const transactions = useTradeDataStore(
        (s) => s.userNonFundingLedgerUpdates,
    );
    const setTransactions = useTradeDataStore(
        (s) => s.setUserNonFundingLedgerUpdates,
    );

    const [isFetched, setIsFetched] = useState(false);

    useEffect(() => {
        if (!targetAddress) return;
        fetchUserNonFundingLedgerUpdates(targetAddress)
            .then((txs: TransactionData[]) => setTransactions(txs))
            .catch(console.error)
            .finally(() => setIsFetched(true));
    }, [targetAddress]);

    return (
        <ExternalPage title='Deposits & Withdrawals'>
            <DepositsWithdrawalsTable
                data={transactions}
                isFetched={isFetched}
                pageMode
            />
        </ExternalPage>
    );
}
