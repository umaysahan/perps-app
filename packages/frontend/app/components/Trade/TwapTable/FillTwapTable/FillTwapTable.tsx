import { useMemo, useRef } from 'react';
import GenericTable from '~/components/Tables/GenericTable/GenericTable';
import { sortTwapFillHistory } from '~/processors/processUserFills';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import { EXTERNAL_PAGE_URL_PREFIX } from '~/utils/Constants';
import type { TwapSliceFillIF, UserFillSortBy } from '~/utils/UserDataIFs';
import FillTwapTableHeader, { FillTwapTableModel } from './FillTwapTableHeader';
import FillTwapTableRow from './FillTwapTableRow';
import { useInfoApi } from '~/hooks/useInfoApi';

interface FillTwapTableProps {
    data: TwapSliceFillIF[];
    isFetched: boolean;
    selectedFilter?: string;
    pageMode?: boolean;
}

export default function FillTwapTable(props: FillTwapTableProps) {
    const { data, isFetched, selectedFilter, pageMode } = props;

    const { symbol } = useTradeDataStore();

    const { fetchTwapSliceFills } = useInfoApi();
    const { userAddress } = useUserDataStore();

    const currentUserRef = useRef<string>('');
    currentUserRef.current = userAddress;

    const viewAllLink = useMemo(() => {
        return `${EXTERNAL_PAGE_URL_PREFIX}/twapFillHistory/${currentUserRef.current}`;
    }, [userAddress]);

    const filteredData = useMemo(() => {
        switch (selectedFilter) {
            case 'all':
                return data;
            case 'active':
                return data.filter((twap) => twap.coin === symbol);
            case 'long':
                return data.filter((twap) => twap.side === 'buy');
            case 'short':
                return data.filter((twap) => twap.side === 'sell');
        }
        return data;
    }, [data, selectedFilter, symbol]);

    return (
        <>
            <GenericTable<
                TwapSliceFillIF,
                UserFillSortBy,
                (
                    address: string,
                    aggregateByTime: boolean,
                ) => Promise<TwapSliceFillIF[]>
            >
                storageKey={`FillTwapTable_${currentUserRef.current}`}
                data={filteredData as any}
                renderHeader={(sortDirection, sortClickHandler, sortBy) => (
                    <FillTwapTableHeader
                        sortBy={sortBy as UserFillSortBy}
                        sortDirection={sortDirection}
                        sortClickHandler={sortClickHandler}
                    />
                )}
                renderRow={(fill, index) => (
                    <FillTwapTableRow
                        key={`fill-${index}`}
                        fill={fill as any}
                    />
                )}
                sorterMethod={sortTwapFillHistory}
                isFetched={isFetched}
                pageMode={pageMode}
                viewAllLink={viewAllLink}
                skeletonRows={7}
                skeletonColRatios={[2, 1, 1, 1, 1, 1, 1, 1]}
                defaultSortBy={'time'}
                defaultSortDirection={'desc'}
                heightOverride={`${pageMode ? '100%' : '90%'}`}
                tableModel={FillTwapTableModel}
                csvDataFetcher={fetchTwapSliceFills}
                csvDataFetcherArgs={[userAddress, true]}
            />
        </>
    );
}
