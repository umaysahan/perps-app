import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import ExternalPage from '~/components/ExternalPage/ExternalPage';
import TradeHistoryTable from '~/components/Trade/TradeHistoryTable/TradeHistoryTable';
import { useInfoApi } from '~/hooks/useInfoApi';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import type { UserFillIF } from '~/utils/UserDataIFs';

export default function TradeHistory() {
    const { address } = useParams<{ address?: string }>();
    const walletAddress = useUserDataStore((s) => s.userAddress);
    const targetAddress = address ?? walletAddress;

    const userFills = useTradeDataStore((s) => s.userFills);
    const setUserFills = useTradeDataStore((s) => s.setUserFills);

    const { fetchUserFills } = useInfoApi();

    const [isFetched, setIsFetched] = useState(false);

    useEffect(() => {
        if (!targetAddress) return;
        fetchUserFills(targetAddress, true)
            .then((fills: UserFillIF[]) => {
                setUserFills(fills);
                setIsFetched(true);
            })
            .catch(console.error)
            .finally(() => setIsFetched(true));
    }, [targetAddress]);

    return (
        <ExternalPage title='Trade History'>
            <TradeHistoryTable
                data={userFills}
                isFetched={isFetched}
                pageMode
            />
        </ExternalPage>
    );
}
