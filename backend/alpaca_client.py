# ============================================================
# backend/alpaca_client.py — Dev C
# Alpaca Paper Trading client and helper functions
# ============================================================

import os
import requests
from dotenv import load_dotenv

# Load env from project root
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ALPACA_API_KEY = os.getenv('ALPACA_API_KEY', '')
ALPACA_API_SECRET = os.getenv('ALPACA_API_SECRET', '')
ALPACA_BASE_URL = os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets')

HEADERS = {
    'APCA-API-KEY-ID': ALPACA_API_KEY,
    'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
    'Content-Type': 'application/json',
}

# Common crypto symbols for detection
CRYPTO_SYMBOLS = {
    'BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'UNI', 'AAVE',
    'DOT', 'MATIC', 'SHIB', 'LTC', 'BCH', 'XLM', 'ALGO', 'ATOM',
    'ADA', 'XRP', 'USDT', 'USDC',
}


def _api_url(path: str) -> str:
    """Build full Alpaca API URL."""
    return f"{ALPACA_BASE_URL}/{path}"


def is_crypto(ticker: str) -> bool:
    """Detect if a ticker is a crypto asset."""
    t = ticker.upper().replace('/', '')
    # BTC/USD -> BTCUSD, or just BTC
    if '/' in ticker:
        return True
    if t.endswith('USD') and t[:-3] in CRYPTO_SYMBOLS:
        return True
    if t in CRYPTO_SYMBOLS:
        return True
    return False


def normalize_crypto_symbol(ticker: str) -> str:
    """Normalize crypto ticker to Alpaca format (e.g. BTC -> BTC/USD)."""
    t = ticker.upper().strip()
    if '/' in t:
        return t  # Already in BTC/USD format
    if t.endswith('USD') and t[:-3] in CRYPTO_SYMBOLS:
        return t[:-3] + '/USD'  # BTCUSD -> BTC/USD
    if t in CRYPTO_SYMBOLS:
        return t + '/USD'  # BTC -> BTC/USD
    return t


def get_account() -> dict:
    """
    Get account details: buying power, portfolio value, cash, day trade count.
    Returns an AccountSummary dict.
    """
    resp = requests.get(_api_url('/account'), headers=HEADERS)
    resp.raise_for_status()
    acct = resp.json()
    return {
        'buyingPower': float(acct.get('buying_power', 0)),
        'portfolioValue': float(acct.get('portfolio_value', 0)),
        'cash': float(acct.get('cash', 0)),
        'dayTradeCount': int(acct.get('daytrade_count', 0)),
    }


def get_positions() -> list[dict]:
    """
    Get current positions with P&L.
    Returns a list of Position dicts.
    """
    resp = requests.get(_api_url('/positions'), headers=HEADERS)
    resp.raise_for_status()
    positions = resp.json()
    return [
        {
            'ticker': pos.get('symbol', ''),
            'qty': float(pos.get('qty', 0)),
            'avgEntryPrice': float(pos.get('avg_entry_price', 0)),
            'currentPrice': float(pos.get('current_price', 0)),
            'unrealizedPL': float(pos.get('unrealized_pl', 0)),
            'unrealizedPLPercent': float(pos.get('unrealized_plpc', 0)) * 100,
        }
        for pos in positions
    ]


def submit_order(
    ticker: str,
    qty: float | None = None,
    side: str = 'buy',
    order_type: str = 'market',
    limit_price: float | None = None,
    stop_price: float | None = None,
    stop_loss: float | None = None,
    notional: float | None = None,
) -> dict:
    """
    Submit a trade order to Alpaca.

    Supports:
    - market, limit, stop, stop_limit orders
    - Fractional shares (e.g. qty=0.5)
    - Dollar-based orders via notional (e.g. notional=30 to buy $30 worth)
    - Optional stop-loss via bracket (OTO) order

    Either qty or notional must be provided. notional takes priority.
    notional is only supported for market orders.

    Returns a TradeResult dict.
    """
    # --- Validate inputs ---
    if notional is None and qty is None:
        return {
            'success': False,
            'error': 'Either qty or notional must be provided.',
        }

    if notional is not None and order_type != 'market':
        return {
            'success': False,
            'error': 'Notional (dollar amount) orders are only supported for market orders.',
        }

    # --- Validate buying power for buy orders ---
    if side == 'buy':
        account = get_account()
        # For market orders, estimate cost (we can't know exact price, so use a rough check)
        # For limit orders, use the limit price
        if order_type == 'limit' and limit_price and qty:
            estimated_cost = limit_price * qty
        elif notional:
            estimated_cost = notional
        else:
            estimated_cost = 0

        if estimated_cost > 0 and estimated_cost > account['buyingPower']:
            return {
                'success': False,
                'error': f"Insufficient buying power. Required: ${estimated_cost:.2f}, Available: ${account['buyingPower']:.2f}",
            }

    # --- Determine if this is a crypto trade ---
    crypto = is_crypto(ticker)
    # Normalize crypto tickers to Alpaca's required format (BTC -> BTC/USD, BTCUSD -> BTC/USD)
    symbol = normalize_crypto_symbol(ticker) if crypto else ticker.upper()

    # --- Build the order payload ---
    # Crypto must ALWAYS use 'gtc'. For stocks, fractional orders require 'day'.
    if crypto:
        tif = 'gtc'
    else:
        tif = 'day'

    order_data: dict = {
        'symbol': symbol,
        'side': side,
        'type': order_type,
        'time_in_force': tif,
    }

    # Use notional (dollar amount) or qty
    if notional is not None:
        order_data['notional'] = str(round(notional, 2))
    else:
        order_data['qty'] = str(qty)

    # Add limit price for limit / stop_limit orders
    if order_type in ('limit', 'stop_limit') and limit_price is not None:
        order_data['limit_price'] = str(limit_price)

    # Add stop price for stop / stop_limit orders
    if order_type in ('stop', 'stop_limit') and stop_price is not None:
        order_data['stop_price'] = str(stop_price)

    # --- Bracket order (stop-loss) — not supported for crypto ---
    if stop_loss is not None and not crypto:
        order_data['order_class'] = 'oto'
        order_data['stop_loss'] = {'stop_price': str(stop_loss)}

    print(f"[submit_order] Sending to Alpaca: {order_data}")
    try:
        resp = requests.post(_api_url('/orders'), headers=HEADERS, json=order_data)
        resp.raise_for_status()
        order = resp.json()

        return {
            'success': True,
            'orderId': order.get('id', ''),
            'status': order.get('status', ''),
            'filledPrice': float(order.get('filled_avg_price', 0) or 0),
        }
    except requests.exceptions.HTTPError as e:
        error_body = {}
        try:
            error_body = e.response.json()
        except Exception:
            pass
        error_msg = error_body.get('message', str(e))
        return {
            'success': False,
            'error': error_msg,
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
        }
