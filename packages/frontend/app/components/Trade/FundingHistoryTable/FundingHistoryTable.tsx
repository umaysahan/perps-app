import { useMemo, useRef } from 'react';
import GenericTable from '~/components/Tables/GenericTable/GenericTable';
import { sortUserFundings } from '~/processors/processUserFills';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import { useUserDataStore } from '~/stores/UserDataStore';
import { EXTERNAL_PAGE_URL_PREFIX } from '~/utils/Constants';
import type {
    UserFillIF,
    UserFillSortBy,
    UserFundingIF,
    UserFundingSortBy,
} from '~/utils/UserDataIFs';
import FundingHistoryTableHeader, {
    FundingHistoryTableModel,
} from './FundingHistoryTableHeader';
import FundingHistoryTableRow from './FundingHistoryTableRow';
import { useInfoApi } from '~/hooks/useInfoApi';

interface FundingHistoryTableProps {
    userFundings: UserFundingIF[];
    pageMode?: boolean;
    isFetched: boolean;
    selectedFilter?: string;
}

export default function FundingHistoryTable(props: FundingHistoryTableProps) {
    const { pageMode, isFetched, selectedFilter, userFundings } = props;

    const { symbol } = useTradeDataStore();

    const { userAddress } = useUserDataStore();

    const { fetchFundingHistory } = useInfoApi();

    const currentUserRef = useRef<string>('');
    currentUserRef.current = userAddress;

    const filteredData = useMemo(() => {
        switch (selectedFilter) {
            case 'all':
                return userFundings;
            case 'active':
                return userFundings.filter(
                    (funding) => funding.coin === symbol,
                );
            case 'long':
                return userFundings.filter((funding) => funding.szi > 0);
            case 'short':
                return userFundings.filter((funding) => funding.szi < 0);
        }

        return userFundings;
    }, [userFundings, selectedFilter, symbol]);

    const viewAllLink = useMemo(() => {
        return `${EXTERNAL_PAGE_URL_PREFIX}/fundingHistory/${userAddress}`;
    }, [userAddress]);

    return (
        <>
            <GenericTable<
                UserFundingIF,
                UserFundingSortBy,
                (
                    address: string,
                    aggregateByTime: boolean,
                ) => Promise<UserFundingIF[]>
            >
                storageKey={`FundingHistoryTable_${currentUserRef.current}`}
                data={filteredData}
                renderHeader={(sortDirection, sortClickHandler, sortBy) => (
                    <FundingHistoryTableHeader
                        sortBy={sortBy as UserFundingSortBy}
                        sortDirection={sortDirection}
                        sortClickHandler={sortClickHandler}
                    />
                )}
                renderRow={(fundingHistory, index) => (
                    <FundingHistoryTableRow
                        key={`funding-history-${index}`}
                        fundingHistory={fundingHistory}
                    />
                )}
                sorterMethod={sortUserFundings}
                isFetched={isFetched}
                pageMode={pageMode}
                viewAllLink={viewAllLink}
                skeletonRows={7}
                skeletonColRatios={[1, 1, 1, 1, 1, 1]}
                tableModel={FundingHistoryTableModel}
                csvDataFetcher={fetchFundingHistory}
                csvDataFetcherArgs={[userAddress, true]}
            />
        </>
    );
}
