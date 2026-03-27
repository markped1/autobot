import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface PriceChartProps {
  isActive: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ isActive }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastPriceRef = useRef<number>(40000);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.5)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 300,
      timeScale: {
        borderVisible: false,
      },
      rightPriceScale: {
        borderVisible: false,
      },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981', // profit color
      downColor: '#ef4444', // loss color
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    // Initial OHLC data
    const initialData: CandlestickData[] = [];
    const now = Math.floor(Date.now() / 1000);
    let lastClose = 40000;
    
    for (let i = 100; i >= 0; i--) {
      const open = lastClose + (Math.random() - 0.5) * 50;
      const close = open + (Math.random() - 0.5) * 100;
      const high = Math.max(open, close) + Math.random() * 50;
      const low = Math.min(open, close) - Math.random() * 50;
      
      initialData.push({
        time: (now - i * 60) as any,
        open,
        high,
        low,
        close,
      });
      lastClose = close;
    }
    
    series.setData(initialData);
    lastPriceRef.current = lastClose;

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update data when active
  useEffect(() => {
    let interval: number;
    if (isActive && seriesRef.current) {
      interval = window.setInterval(() => {
        const lastClose = lastPriceRef.current;
        const open = lastClose + (Math.random() - 0.5) * 50;
        const close = open + (Math.random() - 0.5) * 100;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        
        lastPriceRef.current = close;
        
        seriesRef.current?.update({
          time: (Math.floor(Date.now() / 1000)) as any,
          open,
          high,
          low,
          close,
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};
