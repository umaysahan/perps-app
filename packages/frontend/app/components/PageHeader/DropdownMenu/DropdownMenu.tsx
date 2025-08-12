import {
    FaDiscord,
    // FaFileAlt,
    // FaMediumM,
    // FaQuestionCircle,
    FaTwitter,
} from 'react-icons/fa';
// import { IoIosInformationCircle } from 'react-icons/io';
// import { useTutorial } from '~/hooks/useTutorial';
import { isEstablished, useSession } from '@fogo/sessions-sdk-react';
import packageJson from '../../../../package.json';
import styles from './DropdownMenu.module.css';

const menuItems = [
    // { name: 'Docs', icon: <FaFileAlt /> },
    { name: 'Twitter', icon: <FaTwitter /> },
    { name: 'Discord', icon: <FaDiscord /> },
    // { name: 'Medium', icon: <FaMediumM /> },
    // { name: 'Privacy', icon: <FaUserSecret /> },
    // { name: 'Terms of Service', icon: <FaFileAlt /> },
    // { name: 'FAQ', icon: <FaQuestionCircle /> },
];

interface DropdownMenuProps {
    setIsDropdownMenuOpen: (open: boolean) => void;
}

const DropdownMenu = ({ setIsDropdownMenuOpen }: DropdownMenuProps) => {
    const sessionState = useSession();
    // const { handleRestartTutorial } = useTutorial();

    // const handleTutorialClick = () => {
    //     console.log(
    //         'Tutorial button clicked in DropdownMenu, restarting tutorial...',
    //     );
    //     handleRestartTutorial();
    // };

    return (
        <div className={styles.container}>
            {menuItems.map((item, index) => (
                <div key={index} className={styles.menuItem}>
                    <span>{item.name}</span>
                    <span>{item.icon}</span>
                </div>
            ))}
            {/* <button
                className={styles.tutorialButton}
                onClick={handleTutorialClick}
            >
                Tutorial <IoIosInformationCircle size={22} />
            </button> */}
            <div className={styles.version}>Version: {packageJson.version}</div>
            {isEstablished(sessionState) && (
                <button
                    className={styles.logoutButton}
                    onClick={() => {
                        sessionState.endSession();
                        setIsDropdownMenuOpen(false);
                    }}
                >
                    Log Out
                </button>
            )}
        </div>
    );
};

export default DropdownMenu;
