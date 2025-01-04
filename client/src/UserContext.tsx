import { createContext, useEffect, useState, ReactNode } from 'react';

// Define the shape of the user object
interface User {
  user_id: number;
  name: string;
  email: string;
}

// Define the shape of the context value
interface UserContextType {
  homeRefresh: number;
  listRefresh: number;
  user: User | null; // User can be an object or null
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // For updating the user
  setHomeRefresh: React.Dispatch<React.SetStateAction<number>>;
  setListRefresh: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context with a default value
export const UserContext = createContext<UserContextType | null>(null);

// Define props for the provider component
interface ContextProviderProps {
  children: ReactNode; // Properly typing children
}

const ContextProvider = ({ children }: ContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null); // Initialize user as null
  const [homeRefresh, setHomeRefresh] = useState(0);
  const [listRefresh, setListRefresh] = useState(0);
  useEffect(() => {
    // You can set an initial user or fetch data here if needed
    if (localStorage.length > 0) {
      setUser({user_id: Number(localStorage.getItem('user_id')), name: localStorage.getItem('name') || '', email: localStorage.getItem('email') || ''});
    }
  }, []);

  const contextInfo: UserContextType = { user, homeRefresh, listRefresh, setUser, setHomeRefresh, setListRefresh };

  return (
    <UserContext.Provider value={contextInfo}>
      {children}
    </UserContext.Provider>
  );
};

export default ContextProvider;

