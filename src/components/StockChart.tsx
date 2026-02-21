// ============================================================
// StockChart.tsx — Dev A
// Renders a stock chart from OHLCV data
// Uses lightweight-charts or recharts
// ============================================================
'use client';

import React from 'react';
import type { StockBar } from '@/types';

interface StockChartProps {
    ticker: string;
    data: StockBar[];
    period: string;
}

export default function StockChart({ ticker, data, period }: StockChartProps) {
    // TODO: Dev A — implement chart using lightweight-charts or recharts
    return (
        <div className="stock-chart">
            <h3>{ticker} — {period}</h3>
            <div className="chart-placeholder">
                {data.length > 0 ? `${data.length} data points loaded` : 'Loading chart...'}
            </div>
        </div>
    );
}
