export interface Holding {
  id: number;
  artist: string;
  tokens: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  profit: number;
  profitPercentage: number;
  allocation: number;
}

export interface Transaction {
  id: number;
  type: 'BUY' | 'SELL';
  artist: string;
  tokens: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface PortfolioData {
  totalValue: number;
  totalProfit: number;
  profitPercentage: number;
  holdings: Holding[];
  recentTransactions: Transaction[];
}

export type TimeFrame = '1D' | '1W' | '1M' | '1Y'; 