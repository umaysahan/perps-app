import React, { useState, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronUp } from 'react-icons/fa';
import styles from './Pagination.module.css';

interface PaginationProps {
    page: number;
    totalCount: number;
    rowsPerPage: number;
    rowsOptions?: number[];
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    page,
    totalCount,
    rowsPerPage,
    rowsOptions = [10, 20, 50, 100],
    onPageChange,
    onRowsPerPageChange,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    const handleSelectRows = useCallback(
        (opt: number) => {
            onRowsPerPageChange(opt);
            setDropdownOpen(false);
        },
        [onRowsPerPageChange],
    );

    return (
        <div className={styles.paginationContainer}>
            <div className={styles.rowsPerPage}>
                Rows per page:
                <div
                    className={styles.rowSelector}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {rowsPerPage} <FaChevronUp className={styles.chevron} />
                </div>
                {dropdownOpen && (
                    <div className={styles.dropupMenu}>
                        {rowsOptions.map((opt) => (
                            <div
                                key={opt}
                                className={styles.dropdownItem}
                                onClick={() => handleSelectRows(opt)}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.pageInfo}>
                {page * rowsPerPage + 1} -{' '}
                {Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
            </div>

            <div className={styles.pageButtons}>
                <button
                    className={styles.pageButton}
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                >
                    <FaChevronLeft />
                </button>
                <button
                    className={styles.pageButton}
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
