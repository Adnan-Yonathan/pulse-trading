import { NextResponse } from 'next/server';

// Mock stock data - replace with real API integration
const mockStockData = [
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
  { symbol: 'SPY', price: 445.23, change: 1.45, changePercent: 0.33 },
  { symbol: 'QQQ', price: 378.91, change: -2.34, changePercent: -0.61 },
  { symbol: 'IWM', price: 198.45, change: 0.87, changePercent: 0.44 },
  { symbol: 'VTI', price: 234.56, change: 1.23, changePercent: 0.53 },
  { symbol: 'ARKK', price: 45.67, change: -1.23, changePercent: -2.63 },
  { symbol: 'BTC-USD', price: 43234.56, change: 1234.56, changePercent: 2.94 },
  { symbol: 'ETH-USD', price: 2567.89, change: -45.67, changePercent: -1.75 },
  { symbol: 'SOL-USD', price: 98.45, change: 3.21, changePercent: 3.37 },
  { symbol: 'DOGE-USD', price: 0.1234, change: 0.0056, changePercent: 4.76 },
  { symbol: 'ADA-USD', price: 0.4567, change: -0.0123, changePercent: -2.62 },
];

export async function GET() {
  try {
    // TODO: Replace with real stock API integration
    // Example with Alpha Vantage:
    // const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    // const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    // const promises = symbols.map(symbol => 
    //   fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
    // );
    // const responses = await Promise.all(promises);
    // const data = await Promise.all(responses.map(r => r.json()));

    // For now, return mock data with some randomization
    const stocks = mockStockData.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 2,
      change: stock.change + (Math.random() - 0.5) * 0.5,
      changePercent: stock.changePercent + (Math.random() - 0.5) * 0.3,
    }));

    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Stock API error:', error);
    // Return fallback data
    return NextResponse.json(mockStockData);
  }
}
