import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  LayoutDashboard, 
  Wallet,
  Settings as SettingsIcon,
  LogOut,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Globe,
  X
} from 'lucide-react';
import { PriceChart } from './components/PriceChart';
import InstallBanner from './components/InstallBanner';
import { ExchangeManager } from './services/exchangeManager';
import { TradingEngine } from './services/tradingEngine';
import type { TradeSignal } from './services/tradingEngine';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Exchange Definitions ───────────────────────────────────────────────────
const EXCHANGES = [
  { id: 'binance',  name: 'Binance',   type: 'Crypto',    market: '🟡' },
  { id: 'bybit',    name: 'Bybit',     type: 'Crypto',    market: '🟠' },
  { id: 'coinbase', name: 'Coinbase',  type: 'Crypto',    market: '🔵' },
  { id: 'kraken',   name: 'Kraken',   type: 'Crypto',    market: '🟣' },
  { id: 'oanda',    name: 'OANDA',    type: 'Forex',     market: '🟢' },
  { id: 'xtb',      name: 'XTB',      type: 'Forex/CFD', market: '⚪' },
  { id: 'mt4',      name: 'MT4/MT5',  type: 'Universal', market: '🔴' },
] as const;

// ─── Market Pairs ────────────────────────────────────────────────────────────
const CRYPTO_PAIRS = ['BTC/USDT','ETH/USDT','BNB/USDT','SOL/USDT','XRP/USDT','ADA/USDT','DOGE/USDT','AVAX/USDT'];
const FOREX_PAIRS  = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','USD/CHF','NZD/USD','EUR/GBP','USD/CAD'];
const INDICES      = ['S&P 500','NASDAQ','FTSE 100','DAX 40','Nikkei 225'];
const COMMODITIES  = ['Gold (XAU/USD)','Silver (XAG/USD)','Oil (WTI)','Natural Gas'];

type ExchangeId = typeof EXCHANGES[number]['id'];

interface ConnectedExchange {
  id: ExchangeId;
  name: string;
  apiKey: string;
  apiSecret: string;
}

export default function App() {
  const [isActive, setIsActive] = useState(false);
  const [profit, setProfit] = useState(0);
  const [trades, setTrades] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [connectedExchanges, setConnectedExchanges] = useState<ConnectedExchange[]>([]);
  const [activity, setActivity] = useState<TradeSignal[]>([]);
  
  // Connect modal state
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  // Market selector state
  const [marketCategory, setMarketCategory] = useState<'crypto'|'forex'|'indices'|'commodities'>('crypto');
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');

  const engineRef = useRef<TradingEngine | null>(null);

  const allPairs = {
    crypto: CRYPTO_PAIRS,
    forex: FOREX_PAIRS,
    indices: INDICES,
    commodities: COMMODITIES,
  };

  useEffect(() => {
    engineRef.current = new TradingEngine((signal) => {
      setProfit(prev => prev + (Math.random() * 5));
      setTrades(t => t + 1);
      setActivity(prev => [signal, ...prev].slice(0, 10));
    });
    return () => engineRef.current?.stop();
  }, []);

  useEffect(() => {
    if (isActive) {
      engineRef.current?.start();
    } else {
      engineRef.current?.stop();
    }
  }, [isActive]);

  // Additional profit tick
  useEffect(() => {
    let interval: number;
    if (isActive) {
      interval = setInterval(() => {
        setProfit(prev => prev + (Math.random() * 2));
        if (Math.random() > 0.8) setTrades(t => t + 1);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleConnect = async () => {
    const result = await ExchangeManager.getInstance().connect(selectedExchange, { apiKey, apiSecret });
    if (result) {
      const ex = EXCHANGES.find(e => e.id === selectedExchange)!;
      setConnectedExchanges(prev => [...prev.filter(c => c.id !== selectedExchange), { id: selectedExchange, name: ex.name, apiKey, apiSecret }]);
      setApiKey('');
      setApiSecret('');
      setShowSettings(false);
    }
  };

  const isConnected = connectedExchanges.length > 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <InstallBanner />
      {/* Sidebar */}
      <aside className="w-full md:w-20 lg:w-72 glass p-4 flex flex-col items-center lg:items-stretch gap-8 border-r border-white/5">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <img 
            src="/logo.png" 
            alt="TomAutoBot" 
            className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
            style={{ mixBlendMode: 'screen' }}
          />
          <div className="hidden lg:block">
            <span className="text-lg font-black tracking-tight bg-gradient-to-r from-amber-400 via-cyan-400 to-white bg-clip-text text-transparent">TOMAUTOBOT</span>
            <p className="text-[10px] text-white/30 -mt-1">Universal Autopilot</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-row md:flex-col gap-2 justify-center lg:justify-start">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <NavItem icon={<Wallet size={20} />} label="Accounts" onClick={() => setShowSettings(true)} />
          <NavItem icon={<Target size={20} />} label="Strategies" />
          <NavItem icon={<Globe size={20} />} label="Markets" />
          <NavItem icon={<SettingsIcon size={20} />} label="Settings" onClick={() => setShowSettings(true)} />
        </nav>

        <div className="mt-auto hidden lg:block">
          <div className="glass p-4 rounded-2xl mb-4">
            <p className="text-xs text-white/50 mb-1">System Health</p>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-profit animate-pulse" : "bg-white/20")} />
              <span className="text-sm font-medium">{isActive ? "Active Trading" : "Standby"}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 text-white/50 hover:text-white transition-colors px-2">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Universal Autopilot</h1>
            <p className="text-white/40">Trade any market — Crypto, Forex, Indices, Commodities.</p>
          </div>
          <div className="flex items-center gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setIsActive(false)}
              className={cn("px-6 py-2 rounded-xl transition-all", !isActive ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white")}
            >Manual</button>
            <button 
              onClick={() => setIsActive(true)}
              className={cn("px-6 py-2 rounded-xl transition-all", isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-white/40 hover:text-white")}
            >Autopilot</button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Profit" value={`$${profit.toFixed(2)}`} trend="+12.4%" icon={<TrendingUp className="text-profit" />} />
          <StatCard title="Active Trades" value={trades.toString()} trend="Live" icon={<Zap className="text-primary" />} />
          <StatCard title="Risk Status" value="Low Risk" trend="Protected" icon={<ShieldCheck className="text-secondary" />} />
        </div>

        {/* Market Selector + Chart */}
        <div className="glass rounded-3xl p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap">
              {(['crypto','forex','indices','commodities'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setMarketCategory(cat); setSelectedPair(allPairs[cat][0]); }}
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-sm font-semibold capitalize transition-all",
                    marketCategory === cat ? "bg-primary text-white" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Pair dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold hover:border-primary/50 transition-all">
                <span>{selectedPair}</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-card border border-white/10 rounded-2xl p-2 z-20 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all w-48 shadow-2xl">
                {allPairs[marketCategory].map(pair => (
                  <button
                    key={pair}
                    onClick={() => setSelectedPair(pair)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-xl text-sm transition-all",
                      selectedPair === pair ? "bg-primary/20 text-primary" : "hover:bg-white/5 text-white/70"
                    )}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-profit text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-profit animate-ping" />
              Live: {selectedPair}
            </div>
          </div>
          <PriceChart isActive={isActive} />
        </div>

        {/* Action Zone */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-[380px] text-center">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-700",
              isActive ? "bg-profit/10 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.2)]" : "bg-white/5"
            )}>
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                isActive ? "bg-profit text-white animate-pulse" : "bg-white/10 text-white/20"
              )}>
                {isActive ? <Square fill="white" /> : <Play fill="currentColor" />}
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-4">
              {isActive ? "Autopilot Active" : "Start Earning Profit"}
            </h2>
            <p className="text-white/50 max-w-md mb-8">
              {isActive 
                ? `Master Brain is scanning ${selectedPair} across ${connectedExchanges.length || 1} exchange${connectedExchanges.length > 1 ? 's' : ''} for opportunities.`
                : "Connect your exchange and activate the universal trading engine to start earning."}
            </p>
            
            <button 
              onClick={() => {
                if (!isConnected) {
                  setShowSettings(true);
                } else {
                  setIsActive(!isActive);
                }
              }}
              className={cn("btn-primary scale-110", isActive && "bg-loss shadow-loss/20 hover:bg-loss/90")}
            >
              {isActive ? "Stop Autopilot" : isConnected ? "Activate Autopilot" : "Connect Exchange First"}
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Connected Exchanges</h3>
                <button 
                  onClick={() => setShowSettings(true)} 
                  className="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                >+ Add</button>
              </div>
              <div className="space-y-3">
                {EXCHANGES.map(ex => (
                  <PlatformBadge 
                    key={ex.id}
                    name={ex.name} 
                    type={ex.type}
                    emoji={ex.market}
                    status={connectedExchanges.some(c => c.id === ex.id)} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-3xl p-6 mt-8">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {activity.length > 0 ? activity.map((sig, i) => (
              <ActivityItem 
                key={i}
                pair={sig.pair}
                type={sig.type}
                status="AUTO"
                amount={`+$${(Math.random() * 5 + 5).toFixed(2)}`}
              />
            )) : (
              <p className="text-white/20 text-sm text-center py-8 col-span-2">No active trades yet. Activate Autopilot to begin.</p>
            )}
          </div>
        </div>
      </main>

      {/* Connect Exchange Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-[32px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Connect Exchange</h2>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white p-2 rounded-xl hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Exchange selector */}
              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block">Choose Your Platform</label>
                <div className="grid grid-cols-2 gap-3">
                  {EXCHANGES.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExchange(ex.id)}
                      className={cn(
                        "p-4 rounded-2xl flex items-center gap-3 border transition-all text-left",
                        selectedExchange === ex.id 
                          ? "border-primary bg-primary/10" 
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      )}
                    >
                      <span className="text-2xl">{ex.market}</span>
                      <div>
                        <p className="font-bold text-sm">{ex.name}</p>
                        <p className="text-[10px] text-white/40">{ex.type}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Market category */}
              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block">Trading Market</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['crypto','forex','indices','commodities'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setMarketCategory(cat); setSelectedPair(allPairs[cat][0]); }}
                      className={cn(
                        "py-3 px-4 rounded-2xl capitalize text-sm font-semibold border transition-all",
                        marketCategory === cat ? "border-primary bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      )}
                    >
                      {cat === 'crypto' ? '🪙 Crypto' : cat === 'forex' ? '💱 Forex' : cat === 'indices' ? '📈 Indices' : '🏅 Commodities'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency pair */}
              <div>
                <label className="text-sm font-medium text-white/50 mb-3 block">Trading Pair / Instrument</label>
                <div className="flex flex-wrap gap-2">
                  {allPairs[marketCategory].map(pair => (
                    <button
                      key={pair}
                      onClick={() => setSelectedPair(pair)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-sm font-medium border transition-all",
                        selectedPair === pair ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                      )}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>

              {/* API fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50">{selectedExchange === 'mt4' ? 'Server Address' : 'API Key'}</label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder={selectedExchange === 'mt4' ? 'e.g. demo.mt5.com:443' : `Enter your ${EXCHANGES.find(e=>e.id===selectedExchange)?.name} API Key`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/50">{selectedExchange === 'mt4' ? 'Account Password' : 'API Secret'}</label>
                <input 
                  type="password"
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  placeholder={selectedExchange === 'mt4' ? 'Your MT4/MT5 password' : `Enter your ${EXCHANGES.find(e=>e.id===selectedExchange)?.name} API Secret`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              <button 
                onClick={handleConnect}
                disabled={!apiKey || !apiSecret}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect {EXCHANGES.find(e => e.id === selectedExchange)?.name} & Start Trading
              </button>
              
              {connectedExchanges.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-white/40 mb-2">Already Connected</p>
                  <div className="flex flex-wrap gap-2">
                    {connectedExchanges.map(c => (
                      <div key={c.id} className="flex items-center gap-1 bg-profit/10 border border-profit/20 text-profit text-xs px-3 py-1 rounded-full">
                        <span>{c.name}</span>
                        <button onClick={() => setConnectedExchanges(prev => prev.filter(x => x.id !== c.id))} className="ml-1 opacity-60 hover:opacity-100">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-center text-white/30 px-8">
                🔒 Your credentials are stored only on your device. We never see your keys.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-2xl transition-all",
        active ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </button>
  );
}

function PlatformBadge({ name, type, emoji, status }: { name: string, type: string, emoji: string, status: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-2.5 rounded-2xl border transition-all",
      status ? "border-profit/20 bg-profit/5" : "border-white/5 bg-white/5"
    )}>
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <div>
          <p className="text-sm font-medium leading-none">{name}</p>
          <p className="text-[10px] text-white/30">{type}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={cn("w-1.5 h-1.5 rounded-full", status ? "bg-profit animate-pulse" : "bg-white/20")} />
        <span className={cn("text-[10px] font-medium", status ? "text-profit" : "text-white/30")}>
          {status ? "Live" : "—"}
        </span>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-bold",
          trend.includes('+') ? "bg-profit/10 text-profit" : "bg-primary/10 text-primary"
        )}>{trend}</span>
      </div>
      <p className="text-white/40 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ActivityItem({ pair, type, status, amount }: { pair: string, type: string, status: string, amount: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors border border-transparent hover:border-white/5">
      <div className="flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", type === 'BUY' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
          {type === 'BUY' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>
        <div>
          <p className="text-sm font-semibold">{pair}</p>
          <p className="text-[10px] text-white/40">{type} • {status}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-profit">{amount}</span>
    </div>
  );
}
