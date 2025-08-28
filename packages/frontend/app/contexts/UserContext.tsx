import { useSession } from '@fogo/sessions-sdk-react';
import React, {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type SetStateAction,
} from 'react';

interface AppContextType {
    isUserConnected: boolean;
    setIsUserConnected: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
    isUserConnected: false,
    setIsUserConnected: () => {},
});

export interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [isUserConnected, setIsUserConnected] = useState(false);

    return (
        <AppContext.Provider value={{ isUserConnected, setIsUserConnected }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
