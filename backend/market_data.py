# ============================================================
# backend/market_data.py — Dev C
# Market data fetching via Alpaca Data API v2 (stocks + crypto)
# ============================================================

import os
from datetime import datetime, timedelta, timezone
import requests
from dotenv import load_dotenv
from alpaca_client import is_crypto, normalize_crypto_symbol

# Load env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ALPACA_API_KEY = os.getenv('ALPACA_API_KEY', '')
ALPACA_API_SECRET = os.getenv('ALPACA_API_SECRET', '')
STOCK_DATA_URL = 'https://data.alpaca.markets/v2/stocks'
CRYPTO_DATA_URL = 'https://data.alpaca.markets/v1beta3/crypto/us'

HEADERS = {
    'APCA-API-KEY-ID': ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
}

# Period → (timeframe, lookback delta)
PERIOD_CONFIG = {
    '1D': ('5Min', timedelta(days=1)),
    '1W': ('15Min', timedelta(weeks=1)),
    '1M': ('1Day', timedelta(days=30)),
    '3M': ('1Day', timedelta(days=90)),
    '1Y': ('1Week', timedelta(days=365)),
}


def get_stock_bars(
    ticker: str,
    period: str = '1M',
) -> list[dict]:
    """
    Fetch OHLCV bars for a given ticker and period.

    Supported periods: 1D (5min bars), 1W (15min bars), 1M (daily),
                       3M (daily), 1Y (weekly)

    Returns a list of StockBar dicts.
    """
    crypto = is_crypto(ticker)
    symbol = normalize_crypto_symbol(ticker) if crypto else ticker.upper()

    if period not in PERIOD_CONFIG:
        raise ValueError(f"Invalid period '{period}'. Must be one of: {', '.join(PERIOD_CONFIG.keys())}")

    timeframe, lookback = PERIOD_CONFIG[period]
    now = datetime.now(timezone.utc)
    start = (now - lookback).isoformat()

    if crypto:
        # Alpaca crypto data API — v1beta3
        # Symbol format needs %2F encoding for URL (BTC/USD -> BTC%2FUSD)
        encoded_symbol = symbol.replace('/', '%2F')
        params = {
            'timeframe': timeframe,
            'start': start,
            'limit': 1000,
        }
        resp = requests.get(
            f"{CRYPTO_DATA_URL}/bars?symbols={encoded_symbol}",
            headers=HEADERS,
            params=params,
        )
    else:
        # Stock data API
        params = {
            'timeframe': timeframe,
            'start': start,
            'limit': 1000,
            'adjustment': 'raw',
            'feed': 'iex',
        }
        resp = requests.get(f"{STOCK_DATA_URL}/{symbol}/bars", headers=HEADERS, params=params)

    resp.raise_for_status()
    data = resp.json()

    # Crypto response nests bars under the symbol key; stock response has 'bars' directly
    if crypto:
        bars = data.get('bars', {}).get(symbol, []) or []
    else:
        bars = data.get('bars', []) or []

    return [
        {
            'timestamp': bar['t'],
            'open': float(bar['o']),
            'high': float(bar['h']),
            'low': float(bar['l']),
            'close': float(bar['c']),
            'volume': int(bar['v']),
        }
        for bar in bars
    ]


def get_stock_quote(ticker: str) -> dict:
    """
    Fetch latest quote/snapshot for a given ticker (stock or crypto).

    Returns a StockQuote dict with price, change, changePercent, volume.
    """
    crypto = is_crypto(ticker)
    symbol = normalize_crypto_symbol(ticker) if crypto else ticker.upper()

    if crypto:
        # Crypto snapshot via v1beta3
        encoded_symbol = symbol.replace('/', '%2F')
        resp = requests.get(
            f"{CRYPTO_DATA_URL}/snapshots?symbols={encoded_symbol}",
            headers=HEADERS,
        )
        resp.raise_for_status()
        data = resp.json()
        snapshot = data.get('snapshots', {}).get(symbol, {})

        daily_bar = snapshot.get('dailyBar', {})
        prev_daily_bar = snapshot.get('prevDailyBar', {})
        latest_trade = snapshot.get('latestTrade', {})

        current_price = float(latest_trade.get('p', 0))
        prev_close = float(prev_daily_bar.get('c', 0))
    else:
        # Stock snapshot
        resp = requests.get(
            f"{STOCK_DATA_URL}/{symbol}/snapshot",
            headers=HEADERS,
            params={'feed': 'iex'},
        )
        resp.raise_for_status()
        snapshot = resp.json()

        latest_trade = snapshot.get('latestTrade', {})
        daily_bar = snapshot.get('dailyBar', {})
        prev_daily_bar = snapshot.get('prevDailyBar', {})

        current_price = float(latest_trade.get('p', 0))
        prev_close = float(prev_daily_bar.get('c', 0))

    change = current_price - prev_close if prev_close else 0
    change_percent = (change / prev_close * 100) if prev_close else 0

    return {
        'ticker': symbol,
        'price': current_price,
        'change': round(change, 2),
        'changePercent': round(change_percent, 2),
        'volume': int(daily_bar.get('v', 0)),
    }
