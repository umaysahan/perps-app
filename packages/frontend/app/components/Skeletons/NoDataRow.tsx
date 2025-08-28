import { motion } from 'framer-motion';
import { MdSearchOff } from 'react-icons/md';
import styles from './NoDataRow.module.css';

interface NoDataRowProps {
    text?: string;
}

const NoDataRow: React.FC<NoDataRowProps> = ({ text = 'Data unavailable' }) => {
    return (
        <>
            <div className={styles.noDataWrapper}>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <MdSearchOff className={styles.noDataIcon} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className={styles.noDataText}
                >
                    {text}
                </motion.div>
            </div>
        </>
    );
};

export default NoDataRow;
