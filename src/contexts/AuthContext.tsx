
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('geolearn_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Admin credentials
    if (username === 'anandagunawan' && password === 'mynameisanan') {
      const adminUser = { 
        id: '1', 
        username: 'anandagunawan', 
        email: 'admin@geolearn.com',
        role: 'admin' as const,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };
      setUser(adminUser);
      localStorage.setItem('geolearn_user', JSON.stringify(adminUser));
      return true;
    }
    
    // Check registered users
    const registeredUsers = JSON.parse(localStorage.getItem('geolearn_registered_users') || '[]');
    const foundUser = registeredUsers.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      const userObj = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: 'user' as const,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
      };
      setUser(userObj);
      localStorage.setItem('geolearn_user', JSON.stringify(userObj));
      return true;
    }
    
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if username or email already exists
    const registeredUsers = JSON.parse(localStorage.getItem('geolearn_registered_users') || '[]');
    const userExists = registeredUsers.find((u: any) => u.username === username || u.email === email);
    
    if (userExists) {
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      role: 'user'
    };
    
    registeredUsers.push(newUser);
    localStorage.setItem('geolearn_registered_users', JSON.stringify(registeredUsers));
    
    // Auto-login after registration
    const userObj = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: 'user' as const,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face`
    };
    setUser(userObj);
    localStorage.setItem('geolearn_user', JSON.stringify(userObj));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('geolearn_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
