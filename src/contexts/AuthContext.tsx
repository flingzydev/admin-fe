import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
}

interface AuthContextType extends AuthState {
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'auth_state';

const getInitialState = (): AuthState => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (error) {
            console.error('Failed to parse auth state:', error);
        }
    }
    return {
        isAuthenticated: false,
        accessToken: null,
    };
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getInitialState);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    }, [authState]);

    const login = (token: string) => {
        setAuthState({
            isAuthenticated: true,
            accessToken: token,
        });
    };

    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            accessToken: null,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}; 