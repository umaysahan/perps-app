import { useMemo, useRef } from 'react';
import GenericTable from '~/components/Tables/GenericTable/GenericTable';
import { sortTwapHistory } from '~/processors/processUserFills';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import { EXTERNAL_PAGE_URL_PREFIX } from '~/utils/Constants';
import type { TwapHistoryIF, UserFillSortBy } from '~/utils/UserDataIFs';
import HistoryTwapTableHeader, {
    HistoryTwapTableModel,
} from './HistoryTwapTableHeader';
import HistoryTwapTableRow from './HistoryTwapTableRow';
import { useInfoApi } from '~/hooks/useInfoApi';
interface HistoryTwapTableProps {
    data: TwapHistoryIF[];
    isFetched: boolean;
    selectedFilter?: string;
    pageMode?: boolean;
}

export default function HistoryTwapTable(props: HistoryTwapTableProps) {
    const { data, isFetched, selectedFilter, pageMode } = props;

    const { symbol } = useTradeDataStore();

    const { fetchTwapHistory } = useInfoApi();

    const { userAddress } = useUserDataStore();

    const currentUserRef = useRef<string>('');
    currentUserRef.current = userAddress;

    const viewAllLink = useMemo(() => {
        return `${EXTERNAL_PAGE_URL_PREFIX}/twapHistory/${currentUserRef.current}`;
    }, [userAddress]);

    const filteredData = useMemo(() => {
        switch (selectedFilter) {
            case 'all':
                return data;
            case 'active':
                return data.filter((twap) => twap.state.coin === symbol);
            case 'long':
                return data.filter((twap) => twap.state.side === 'buy');
            case 'short':
                return data.filter((twap) => twap.state.side === 'sell');
        }
        return data;
    }, [data, selectedFilter, symbol]);

    return (
        <>
            <GenericTable<
                TwapHistoryIF,
                UserFillSortBy,
                (
                    address: string,
                    aggregateByTime: boolean,
                ) => Promise<TwapHistoryIF[]>
            >
                storageKey={`HistoryTwapTable_${currentUserRef.current}`}
                data={filteredData as any}
                renderHeader={(sortDirection, sortClickHandler, sortBy) => (
                    <HistoryTwapTableHeader
                        sortBy={sortBy as UserFillSortBy}
                        sortDirection={sortDirection}
                        sortClickHandler={sortClickHandler}
                    />
                )}
                renderRow={(twap, index) => (
                    <HistoryTwapTableRow
                        key={`twap-${index}`}
                        twap={twap as any}
                    />
                )}
                sorterMethod={sortTwapHistory}
                isFetched={isFetched}
                pageMode={pageMode}
                viewAllLink={viewAllLink}
                skeletonRows={7}
                skeletonColRatios={[2, 1, 1, 1, 1, 1, 1, 1]}
                defaultSortBy={'time'}
                defaultSortDirection={'desc'}
                heightOverride={`${pageMode ? '100%' : '90%'}`}
                tableModel={HistoryTwapTableModel}
                csvDataFetcher={fetchTwapHistory}
                csvDataFetcherArgs={[userAddress, true]}
            />
        </>
    );
}
