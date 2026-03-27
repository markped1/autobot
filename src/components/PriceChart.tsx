import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';

interface PriceChartProps {
  isActive: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ isActive }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lastPriceRef = useRef<number>(100);

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

    // Use addSeries with AreaSeries for v5+
    const series = chart.addSeries(AreaSeries, {
      lineColor: '#3b82f6',
      topColor: 'rgba(59, 130, 246, 0.4)',
      bottomColor: 'rgba(59, 130, 246, 0.0)',
      lineWidth: 2,
    });

    // Initial data
    const initialData = [];
    const now = Math.floor(Date.now() / 1000);
    let lastPrice = 100;
    for (let i = 100; i >= 0; i--) {
      lastPrice = lastPrice + (Math.random() - 0.5) * 2;
      initialData.push({
        time: (now - i) as any,
        value: lastPrice,
      });
    }
    series.setData(initialData);
    lastPriceRef.current = lastPrice;

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
      interval = setInterval(() => {
        lastPriceRef.current += (Math.random() - 0.48) * 2;
        seriesRef.current?.update({
          time: (Math.floor(Date.now() / 1000)) as any,
          value: lastPriceRef.current,
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  return <div ref={chartContainerRef} className="w-full h-[300px]" />;
};
