export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}

export class ExchangeManager {
  private static instance: ExchangeManager;
  private connections: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance() {
    if (!ExchangeManager.instance) {
      ExchangeManager.instance = new ExchangeManager();
    }
    return ExchangeManager.instance;
  }

  async connect(exchange: string, creds: ExchangeCredentials): Promise<boolean> {
    console.log(`[TomAutoBot] Connecting to ${exchange} with key: ${creds.apiKey.substring(0, 4)}...`);
    // Simulated connection delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // In production, this is where real CCXT / broker API calls would go:
    // const client = new ccxt[exchange]({ apiKey: creds.apiKey, secret: creds.apiSecret });
    // await client.fetchBalance();

    this.connections.set(exchange, true);
    return true;
  }

  disconnect(exchange: string) {
    this.connections.delete(exchange);
  }

  isConnected(exchange: string): boolean {
    return this.connections.get(exchange) ?? false;
  }

  getConnected(): string[] {
    return Array.from(this.connections.keys()).filter(k => this.connections.get(k));
  }
}
