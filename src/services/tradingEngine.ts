export interface TradeSignal {
  type: 'BUY' | 'SELL';
  pair: string;
  price: number;
  timestamp: number;
}

const ALL_PAIRS = [
  // Crypto
  'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT',
  // Forex
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF',
  // Commodities & Indices
  'Gold (XAU/USD)', 'Oil (WTI)', 'S&P 500', 'NASDAQ',
];

export class TradingEngine {
  private isActive: boolean = false;
  private onSignal?: (signal: TradeSignal) => void;

  constructor(callback?: (signal: TradeSignal) => void) {
    this.onSignal = callback;
  }

  start() {
    this.isActive = true;
    this.runLoop();
  }

  stop() {
    this.isActive = false;
  }

  private async runLoop() {
    while (this.isActive) {
      // Wait random interval between 5-15 seconds
      await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000));
      
      if (this.isActive && Math.random() > 0.5) {
        const pair = ALL_PAIRS[Math.floor(Math.random() * ALL_PAIRS.length)];
        const signal: TradeSignal = {
          type: Math.random() > 0.5 ? 'BUY' : 'SELL',
          pair,
          price: 100 + Math.random() * 5000,
          timestamp: Date.now(),
        };
        this.onSignal?.(signal);
      }
    }
  }
}
