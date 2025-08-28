import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ExternalPage from '~/components/ExternalPage/ExternalPage';
import OrderHistoryTable from '~/components/Trade/OrderHistoryTable/OrderHistoryTable';
import { useInfoApi } from '~/hooks/useInfoApi';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import { WsChannels } from '~/utils/Constants';
import { useDebugStore } from '~/stores/DebugStore';
import type { OrderDataIF } from '~/utils/orderbook/OrderBookIFs';

function OrderHistory() {
    const { address } = useParams<{ address: string }>();

    const [isFetched, setIsFetched] = useState(false);

    const { userAddress } = useUserDataStore();

    const { orderHistory, fetchedChannels } = useTradeDataStore();

    const { debugWallet } = useDebugStore();

    const orderHistoryFetched = useMemo(() => {
        return fetchedChannels.has(WsChannels.USER_HISTORICAL_ORDERS);
    }, [fetchedChannels]);

    const [fetchedHistoryData, setFetchedHistoryData] = useState<OrderDataIF[]>(
        [],
    );

    const { fetchOrderHistory } = useInfoApi();

    const isCurrentUser = useMemo(() => {
        if (address) {
            return address.toLowerCase() === debugWallet.address.toLowerCase();
        } else {
            return true;
        }
    }, [address, debugWallet.address, userAddress]);

    useEffect(() => {
        if (!isCurrentUser && address) {
            fetchOrderHistory(address).then((data) => {
                setFetchedHistoryData(data);
                setIsFetched(true);
            });
        } else if (orderHistoryFetched) {
            setIsFetched(true);
        }
    }, [isCurrentUser, address, orderHistoryFetched]);

    const tableData = useMemo(() => {
        if (isCurrentUser) {
            return orderHistory;
        } else {
            return fetchedHistoryData;
        }
    }, [
        isCurrentUser,
        orderHistory,
        fetchedHistoryData,
        orderHistoryFetched,
        isFetched,
        address,
        debugWallet.address,
    ]);

    return (
        <ExternalPage title='Order History'>
            <OrderHistoryTable
                data={tableData}
                isFetched={isFetched}
                pageMode={true}
            />
        </ExternalPage>
    );
}
export default OrderHistory;
