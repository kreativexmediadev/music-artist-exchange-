import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User, Portfolio } from '@prisma/client';

interface UserContextType {
  user: User | null;
  portfolio: Portfolio[];
  isLoading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  user: User | null;
  portfolio: Portfolio[];
  timestamp: number;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<CacheData | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      // Check cache first
      if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setUser(cache.user);
        setPortfolio(cache.portfolio);
        return;
      }

      const response = await fetch('/api/users/me');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      setUser(data.user);

      // Update cache
      setCache(prev => ({
        user: data.user,
        portfolio: prev?.portfolio || [],
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    }
  }, [session?.user?.email, cache]);

  const fetchPortfolio = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      // Check cache first
      if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        setPortfolio(cache.portfolio);
        return;
      }

      const response = await fetch('/api/users/portfolio');
      if (!response.ok) throw new Error('Failed to fetch portfolio');
      const data = await response.json();
      setPortfolio(data.portfolio);

      // Update cache
      setCache(prev => ({
        user: prev?.user || null,
        portfolio: data.portfolio,
        timestamp: Date.now()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
    }
  }, [session?.user?.email, cache]);

  const refreshPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([fetchUserData(), fetchPortfolio()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserData, fetchPortfolio]);

  useEffect(() => {
    if (status === 'authenticated') {
      refreshPortfolio();
    } else {
      setIsLoading(status === 'loading');
    }
  }, [status, refreshPortfolio]);

  return (
    <UserContext.Provider value={{ user, portfolio, isLoading, error, refreshPortfolio }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 