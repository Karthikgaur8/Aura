// ============================================================
// StockChart.tsx — Dev A
// Renders a candlestick stock chart using lightweight-charts v5
// Dark theme with glowing green/red candles
// ============================================================
'use client';

import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType, type IChartApi, type ISeriesApi, type CandlestickSeriesOptions } from 'lightweight-charts';
import { motion } from 'framer-motion';
import type { StockBar } from '@/types';

interface StockChartProps {
    ticker: string;
    data: StockBar[];
    period: string;
}

export default function StockChart({ ticker, data, period }: StockChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: 'rgba(255,255,255,0.5)',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.04)' },
                horzLines: { color: 'rgba(255,255,255,0.04)' },
            },
            crosshair: {
                vertLine: { color: 'rgba(139,92,246,0.3)', width: 1, style: 2, labelBackgroundColor: '#8b5cf6' },
                horzLine: { color: 'rgba(139,92,246,0.3)', width: 1, style: 2, labelBackgroundColor: '#8b5cf6' },
            },
            rightPriceScale: {
                borderColor: 'rgba(255,255,255,0.08)',
            },
            timeScale: {
                borderColor: 'rgba(255,255,255,0.08)',
                timeVisible: true,
                secondsVisible: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: 380,
        });

        chartRef.current = chart;

        // v5 API: use addSeries with CandlestickSeries type
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderUpColor: '#22c55e',
            borderDownColor: '#ef4444',
            wickUpColor: 'rgba(34,197,94,0.6)',
            wickDownColor: 'rgba(239,68,68,0.6)',
        } as CandlestickSeriesOptions);

        seriesRef.current = candleSeries;

        if (data.length > 0) {
            const isIntraday = period === '1D' || period === '1W';
            const chartData = data.map((bar) => ({
                time: isIntraday
                    ? (Math.floor(new Date(bar.timestamp).getTime() / 1000) as import('lightweight-charts').UTCTimestamp)
                    : (bar.timestamp.slice(0, 10) as unknown as import('lightweight-charts').Time),
                open: bar.open,
                high: bar.high,
                low: bar.low,
                close: bar.close,
            }));
            candleSeries.setData(chartData);
            chart.timeScale().fitContent();
        }

        // Resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            chart.applyOptions({ width });
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, [data]);

    // Price change calculation
    const priceChange = data.length >= 2
        ? data[data.length - 1].close - data[0].open
        : 0;
    const priceChangePercent = data.length >= 2
        ? ((priceChange / data[0].open) * 100)
        : 0;
    const isPositive = priceChange >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full rounded-2xl p-5 glass-card"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white text-glow-purple">
                        {ticker}
                    </h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                            background: 'rgba(139,92,246,0.15)',
                            color: '#a78bfa',
                            border: '1px solid rgba(139,92,246,0.2)',
                        }}>
                        {period}
                    </span>
                </div>
                {data.length >= 2 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                            ${data[data.length - 1].close.toFixed(2)}
                        </span>
                        <span className="text-xs font-medium"
                            style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
                            {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                        </span>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden" />
        </motion.div>
    );
}
