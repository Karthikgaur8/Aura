// ============================================================
// TradeReceipt.tsx — Dev A
// Glassmorphic trade confirmation card
// Shows: Ticker, Shares, Est. Total, Order Type, Stop Loss
// ============================================================
'use client';

import React from 'react';
import type { TradeReceipt as TradeReceiptType } from '@/types';

interface TradeReceiptProps {
    receipt: TradeReceiptType;
}

export default function TradeReceipt({ receipt }: TradeReceiptProps) {
    // TODO: Dev A — glassmorphism card with smooth slide-up animation
    return (
        <div className="trade-receipt">
            <h3>Trade Confirmation</h3>
            <div className="receipt-details">
                <div className="receipt-row">
                    <span>Ticker</span>
                    <span>{receipt.ticker}</span>
                </div>
                <div className="receipt-row">
                    <span>Shares</span>
                    <span>{receipt.qty}</span>
                </div>
                <div className="receipt-row">
                    <span>Order Type</span>
                    <span>{receipt.orderType}</span>
                </div>
                <div className="receipt-row">
                    <span>Est. Total</span>
                    <span>${receipt.estimatedTotal.toFixed(2)}</span>
                </div>
                {receipt.stopLoss && (
                    <div className="receipt-row">
                        <span>Stop Loss</span>
                        <span>${receipt.stopLoss.toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
