import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type UserContextType = {
  smbId: number | null;
  smbName: string | null;
  ownerName: string | null;
  smbCategory: string[] | null;
  smbAddress: string | null;
  smbPhoneNumber: string | null;
  smbPassword: string | null;
  setSmbId: (id: number | null) => void;
  setSmbName: (name: string | null) => void;
  setOwnerName: (name: string | null) => void;
  setSmbCategory: (category: string[] | null) => void;
  setSmbAddress: (address: string | null) => void;
  setSmbPhoneNumber: (phone: string | null) => void;
  setSmbPassword: (password: string | null) => void;
  logout: () => void;
  isInitialized: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [smbId, setSmbId] = useState<number | null>(null);
  const [smbName, setSmbName] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [smbCategory, setSmbCategory] = useState<string[] | null>(null);
  const [smbAddress, setSmbAddress] = useState<string | null>(null);
  const [smbPhoneNumber, setSmbPhoneNumber] = useState<string | null>(null);
  const [smbPassword, setSmbPassword] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const storedId = localStorage.getItem('smbId');
    const storedName = localStorage.getItem('smbName');
    const storedUsername = localStorage.getItem('username');
    const storedCategory = localStorage.getItem('smbCategory');
    const storedAddress = localStorage.getItem('smbAddress');
    const storedPhone = localStorage.getItem('smbPhoneNumber');
    const storedPassword = localStorage.getItem('smbPassword');

    if (storedId) setSmbId(Number(storedId));
    if (storedName) setSmbName(storedName);
    if (storedUsername) setOwnerName(storedUsername);
    if (storedCategory) {
      try {
        const parsed = JSON.parse(storedCategory);
        setSmbCategory(Array.isArray(parsed) ? parsed : null);
      } catch {
        setSmbCategory(null);
      }
    }
    if (storedAddress) setSmbAddress(storedAddress);
    if (storedPhone) setSmbPhoneNumber(storedPhone);
    if (storedPassword) setSmbPassword(storedPassword);

    setIsInitialized(true);
  }, []);

  const logout = () => {
    setSmbId(null);
    setSmbName(null);
    setOwnerName(null);
    setSmbCategory(null);
    setSmbAddress(null);
    setSmbPhoneNumber(null);
    setSmbPassword(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        smbId,
        smbName,
        ownerName,
        smbCategory,
        smbAddress,
        smbPhoneNumber,
        smbPassword,
        setSmbId,
        setSmbName,
        setOwnerName,
        setSmbCategory,
        setSmbAddress,
        setSmbPhoneNumber,
        setSmbPassword,
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
