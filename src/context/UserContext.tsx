import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type UserContextType = {
  smbId: number | null;
  smbName: string | null;
  username: string | null;
  token: string | null;
  setSmbId: (id: number | null) => void;
  setSmbName: (name: string | null) => void;
  setUsername: (name: string | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isInitialized: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [smbId, setSmbId] = useState<number | null>(null);
  const [smbName, setSmbName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // טוען נתוני משתמש מ-localStorage או מאתחל את המצב
  useEffect(() => {
    const storedId = localStorage.getItem('smbId');
    const storedName = localStorage.getItem('smbName');
    const storedUsername = localStorage.getItem('username');
    const storedToken = localStorage.getItem('token');

    if (storedId) setSmbId(Number(storedId));
    if (storedName) setSmbName(storedName);
    if (storedUsername) setUsername(storedUsername);
    if (storedToken) setToken(storedToken);

    setIsInitialized(true); // סימון שהcontext מוכן לשימוש
  }, []);

  const logout = () => {
    setSmbId(null);
    setSmbName(null);
    setUsername(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        smbId,
        smbName,
        username,
        token,
        setSmbId,
        setSmbName,
        setUsername,
        setToken,
        logout,
        isInitialized,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
