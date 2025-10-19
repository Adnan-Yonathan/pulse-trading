'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn, getPercentageColor } from '@/lib/utils';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

// Mock stock data - replace with real API integration
const mockStockData: StockData[] = [
  { symbol: 'AAPL', price: 182.45, change: 2.34, changePercent: 1.30 },
  { symbol: 'MSFT', price: 378.91, change: -1.95, changePercent: -0.52 },
  { symbol: 'GOOGL', price: 142.56, change: 3.21, changePercent: 2.30 },
  { symbol: 'AMZN', price: 155.23, change: -0.87, changePercent: -0.56 },
  { symbol: 'TSLA', price: 248.12, change: 12.45, changePercent: 5.28 },
  { symbol: 'META', price: 312.67, change: 4.23, changePercent: 1.37 },
  { symbol: 'NVDA', price: 445.78, change: -8.92, changePercent: -1.96 },
  { symbol: 'NFLX', price: 423.45, change: 2.34, changePercent: 0.56 },
  { symbol: 'AMD', price: 123.45, change: 1.23, changePercent: 1.01 },
  { symbol: 'INTC', price: 45.67, change: -0.23, changePercent: -0.50 },
];

export default function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>(mockStockData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // TODO: Replace with real stock API integration
  // useEffect(() => {
  //   const fetchStockData = async () => {
  //     try {
  //       const response = await fetch('/api/stocks/ticker');
  //       const data = await response.json();
  //       setStocks(data);
  //     } catch (error) {
  //       console.error('Failed to fetch stock data:', error);
  //       // Fallback to mock data
  //       setStocks(mockStockData);
  //     }
  //   };

  //   fetchStockData();
  //   const interval = setInterval(fetchStockData, 30000); // Update every 30 seconds
  //   return () => clearInterval(interval);
  // }, []);

  if (isLoading) {
    return (
      <div className="h-12 bg-robinhood-dark-gray flex items-center justify-center">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 w-16 bg-robinhood-border rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 bg-robinhood-dark-gray overflow-hidden relative">
      <motion.div
        className="flex items-center h-full whitespace-nowrap"
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...stocks, ...stocks].map((stock, index) => (
          <div key={`${stock.symbol}-${index}`} className="flex items-center">
            <div className="flex items-center space-x-2 px-4">
              <span className="text-robinhood-text-primary font-medium text-sm">
                {stock.symbol}
              </span>
              <span className="text-robinhood-text-primary font-mono text-sm">
                ${stock.price.toFixed(2)}
              </span>
              <span
                className={cn(
                  'font-mono text-sm',
                  getPercentageColor(stock.changePercent)
                )}
              >
                {stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="w-2 h-2 bg-robinhood-border rounded-full" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
