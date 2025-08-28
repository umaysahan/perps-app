import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ExternalPage from '~/components/ExternalPage/ExternalPage';
import OpenOrdersTable from '~/components/Trade/OpenOrdersTable/OpenOrdersTable';
import { useInfoApi } from '~/hooks/useInfoApi';
import { useDebugStore } from '~/stores/DebugStore';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { WsChannels } from '~/utils/Constants';
import type { OrderDataIF } from '~/utils/orderbook/OrderBookIFs';

function OpenOrders() {
    const { address } = useParams<{ address: string }>();

    const [isFetched, setIsFetched] = useState(false);
    const [fetchedData, setFetchedData] = useState<OrderDataIF[]>([]);

    const { debugWallet } = useDebugStore();
    const { userOrders, fetchedChannels } = useTradeDataStore();
    const { fetchOpenOrders } = useInfoApi();

    const orderHistoryFetched = useMemo(() => {
        return fetchedChannels.has(WsChannels.USER_HISTORICAL_ORDERS);
    }, [fetchedChannels]);

    const isCurrentUser = useMemo(() => {
        if (address) {
            return address.toLowerCase() === debugWallet.address.toLowerCase();
        } else {
            return true;
        }
    }, [address, debugWallet.address]);

    useEffect(() => {
        if (!isCurrentUser && address) {
            fetchOpenOrders(address).then((data) => {
                setFetchedData(data);
                setIsFetched(true);
            });
        } else if (orderHistoryFetched) {
            setIsFetched(true);
        }
    }, [isCurrentUser, address, orderHistoryFetched]);

    const tableData = useMemo(() => {
        if (isCurrentUser) {
            return userOrders;
        } else {
            return fetchedData;
        }
    }, [isCurrentUser, userOrders, fetchedData]);

    return (
        <ExternalPage title='Open Orders'>
            <OpenOrdersTable
                data={tableData}
                isFetched={isFetched}
                pageMode={true}
            />
        </ExternalPage>
    );
}
export default OpenOrders;
