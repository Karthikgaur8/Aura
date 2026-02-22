# ============================================================
# backend/main.py — Dev C
# FastAPI application with trade and market data endpoints
# ============================================================

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

from alpaca_client import get_account, get_positions, submit_order
from market_data import get_stock_bars, get_stock_quote

app = FastAPI(
    title="Aura — Alpaca Trading Backend",
    description="Paper trading and market data API for the Aura voice trading assistant",
    version="0.1.0",
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========================
# Pydantic request models
# ========================

class TradeOrderRequest(BaseModel):
    ticker: str
    qty: Optional[float] = Field(default=None, gt=0, description="Number of shares (supports fractional, e.g. 0.5)")
    side: str = Field(pattern="^(buy|sell)$")
    type: str = Field(pattern="^(market|limit|stop|stop_limit)$")
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    stop_loss: Optional[float] = None
    notional: Optional[float] = Field(default=None, gt=0, description="Dollar amount to trade (e.g. 30 for $30 worth)")


# ========================
# Trade endpoints
# ========================

@app.post("/api/trade")
async def post_trade(order: TradeOrderRequest):
    """
    Submit a trade order to Alpaca paper trading.
    Supports market, limit, stop, and stop_limit orders.
    Optional stop_loss creates a bracket (OTO) order.
    """
    print(f"[POST /api/trade] Received order: ticker={order.ticker}, qty={order.qty}, side={order.side}, type={order.type}, notional={order.notional}")
    try:
        result = submit_order(
            ticker=order.ticker,
            qty=order.qty,
            side=order.side,
            order_type=order.type,
            limit_price=order.limit_price,
            stop_price=order.stop_price,
            stop_loss=order.stop_loss,
            notional=order.notional,
        )
        print(f"[POST /api/trade] Result: {result}")
        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('error', 'Order failed'))
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[POST /api/trade] Exception: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/trade")
async def get_trade(action: str = Query(..., description="'account' or 'positions'")):
    """
    GET /api/trade?action=account  → account summary
    GET /api/trade?action=positions → current positions
    """
    try:
        if action == 'account':
            return get_account()

        if action == 'positions':
            return get_positions()

        raise HTTPException(status_code=400, detail=f"Unknown action '{action}'. Use 'account' or 'positions'.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# Market data endpoints
# ========================

@app.get("/api/market")
async def get_market(
    ticker: str = Query(..., description="Stock ticker symbol, e.g. AAPL"),
    action: str = Query('bars', description="'bars' or 'quote'"),
    period: str = Query('1M', description="Time period: 1D, 1W, 1M, 3M, 1Y"),
):
    """
    GET /api/market?ticker=AAPL&period=1M       → OHLCV bars
    GET /api/market?ticker=AAPL&action=quote     → current price quote
    """
    try:
        if action == 'quote':
            return get_stock_quote(ticker)

        # Validate period
        valid_periods = ['1D', '1W', '1M', '3M', '1Y']
        if period not in valid_periods:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid period '{period}'. Must be one of: {', '.join(valid_periods)}",
            )

        bars = get_stock_bars(ticker, period)
        return {'ticker': ticker.upper(), 'period': period, 'bars': bars}
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========================
# Health check
# ========================

@app.get("/api/health")
async def health():
    """Quick health check — also verifies Alpaca connectivity."""
    try:
        account = get_account()
        return {
            'status': 'ok',
            'alpaca_connected': True,
            'buying_power': account['buyingPower'],
        }
    except Exception as e:
        return {
            'status': 'error',
            'alpaca_connected': False,
            'error': str(e),
        }
