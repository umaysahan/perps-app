import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Pagination from '~/components/Pagination/Pagination';
import NoDataRow from '~/components/Skeletons/NoDataRow';
import SkeletonTable from '~/components/Skeletons/SkeletonTable/SkeletonTable';
import { useTradeDataStore } from '~/stores/TradeDataStore';
import type { TableSortDirection } from '~/utils/CommonIFs';
import { TableState } from '~/utils/CommonIFs';
import { WsChannels } from '~/utils/Constants';
import type { PositionDataSortBy } from '~/utils/position/PositionIFs';
import { sortPositionData } from '~/utils/position/PositionUtils';
import styles from './PositionsTable.module.css';
import PositionsTableHeader from './PositionsTableHeader';
import PositionsTableRow from './PositionsTableRow';

export default function PositionsTable() {
    const navigate = useNavigate();
    const { coinPriceMap } = useTradeDataStore();
    const [sortBy, setSortBy] = useState<PositionDataSortBy>();
    const [sortDirection, setSortDirection] = useState<TableSortDirection>();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [tableState, setTableState] = useState<TableState>(
        TableState.LOADING,
    );

    const { positions, fetchedChannels } = useTradeDataStore();
    const webDataFetched = useMemo(
        () => fetchedChannels.has(WsChannels.WEB_DATA2),
        [fetchedChannels],
    );

    const sortedPositions = useMemo(
        () => sortPositionData(positions, sortBy, sortDirection, coinPriceMap),
        [positions, sortBy, sortDirection, coinPriceMap],
    );

    const positionsToShow = useMemo(
        () =>
            sortedPositions.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
        [sortedPositions, page, rowsPerPage],
    );

    useEffect(() => {
        if (!webDataFetched) setTableState(TableState.LOADING);
        else
            setTableState(
                positionsToShow.length > 0
                    ? TableState.FILLED
                    : TableState.EMPTY,
            );
    }, [webDataFetched, positionsToShow]);

    const handleSort = (key: string) => {
        // if not on first page, reset
        if (page !== 0) setPage(0);
        setSortBy((prev) =>
            prev === key ? undefined : (key as PositionDataSortBy),
        );
        setSortDirection((prev) => {
            if (prev == null || sortBy !== key) return 'desc';
            if (prev === 'desc') return 'asc';
            return undefined;
        });
    };

    const handleRowsPerPageChange = (newRows: number) => {
        setRowsPerPage(newRows);
        setPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleViewAll = () => navigate('/positions');

    return (
        <div className={styles.tableWrapper}>
            {tableState === TableState.LOADING ? (
                <SkeletonTable
                    rows={7}
                    colRatios={[1, 2, 2, 1, 1, 2, 1, 1, 2, 3, 1]}
                />
            ) : (
                <>
                    <PositionsTableHeader
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        sortClickHandler={handleSort}
                    />
                    <div className={styles.tableBody}>
                        {tableState === TableState.FILLED ? (
                            <>
                                {positionsToShow.map((position, index) => (
                                    <PositionsTableRow
                                        key={index}
                                        position={position}
                                    />
                                ))}
                                {positions.length > rowsPerPage ? (
                                    <Pagination
                                        page={page}
                                        totalCount={positions.length}
                                        rowsPerPage={rowsPerPage}
                                        onPageChange={handlePageChange}
                                        onRowsPerPageChange={
                                            handleRowsPerPageChange
                                        }
                                    />
                                ) : (
                                    <a
                                        href='#'
                                        className={styles.viewAllLink}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleViewAll();
                                        }}
                                    >
                                        View All
                                    </a>
                                )}
                            </>
                        ) : (
                            <NoDataRow />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
