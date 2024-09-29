import React, { createContext, useState } from 'react';

interface AppContextInterface {
    user: string | null;
    setUser: (user: string | null) => void;
}

const AppContext = createContext<AppContextInterface>({
    user: null,
    setUser: () => { },
});

interface AppContextProviderProps {
    children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);

    return (
        <AppContext.Provider value={{ user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => React.useContext(AppContext);