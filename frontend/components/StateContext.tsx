import React, { createContext, useState } from 'react';

interface AppContextInterface {
    user: string | null;
    setUser: (user: string | null) => void;
    csrfToken: string | null;
    setcsrfToken: (csrfToken: string | null) => void;
}

const AppContext = createContext<AppContextInterface>({
    user: null,
    setUser: () => { },
    csrfToken: null,
    setcsrfToken: () => { }
});

interface AppContextProviderProps {
    children: React.ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [csrfToken, setcsrfToken] = useState<string | null>(null);

    return (
        <AppContext.Provider value={{ user, setUser, csrfToken, setcsrfToken }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => React.useContext(AppContext);