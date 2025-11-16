"""Service functions for processing historical price data from vnstock.

This module provides functions to transform raw vnstock DataFrames into validated
Pydantic models for exchange rates, gold prices, and stock OHLCV data.
"""

import pandas as pd

from app.config.field_mappings import HISTORICAL_PRICE_MAPPINGS
from app.schemas.historical_prices import (
    ExchangeRate,
    GoldBTMC,
    GoldSJC,
    StockOHLCV,
)
from app.utils.data_cleaning import (
    clean_price_int,
    clean_price_string,
    parse_btmc_datetime,
    parse_exchange_date,
)
from app.utils.transform import apply_field_mapping


def process_exchange_rate_data(df: pd.DataFrame) -> list[ExchangeRate]:
    """Process vnstock exchange rate DataFrame into validated ExchangeRate models.

    Transforms raw vnstock API data with Vietnamese formatting (comma separators, dashes)
    into validated Pydantic models with proper data types.

    Args:
        df: Raw DataFrame from vnstock vcb_exchange_rate() function
            Expected columns: currency_code, currency_name, buy _cash, buy _transfer, sell, date

    Returns:
        List of validated ExchangeRate models

    Raises:
        ValidationError: If data doesn't match schema requirements

    Example:
        >>> from vnstock.explorer.misc.exchange_rate import vcb_exchange_rate
        >>> df = vcb_exchange_rate(date='2024-05-10')
        >>> rates = process_exchange_rate_data(df)
        >>> rates[0].currency_code
        'AUD'
    """
    records = []
    for _, row in df.iterrows():
        record = {
            "currency_code": row["currency_code"],
            "currency_name": row["currency_name"],
            "buy_cash": clean_price_string(
                apply_field_mapping(row, "buy_cash", HISTORICAL_PRICE_MAPPINGS)
                or row["buy _cash"]
            ),
            "buy_transfer": clean_price_string(
                apply_field_mapping(row, "buy_transfer", HISTORICAL_PRICE_MAPPINGS)
                or row["buy _transfer"]
            ),
            "sell": clean_price_string(row["sell"]),
            "date": parse_exchange_date(row["date"]),
        }
        records.append(ExchangeRate(**record))
    return records


def process_gold_sjc_data(df: pd.DataFrame) -> list[GoldSJC]:
    """Process vnstock SJC gold price DataFrame into validated GoldSJC models.

    Transforms raw vnstock API data with Vietnamese price formatting into
    validated Pydantic models.

    Args:
        df: Raw DataFrame from vnstock sjc_gold_price() function
            Expected columns: name, buy_price, sell_price

    Returns:
        List of validated GoldSJC models

    Raises:
        ValidationError: If data doesn't match schema requirements

    Example:
        >>> from vnstock.explorer.misc.gold_price import sjc_gold_price
        >>> df = sjc_gold_price()
        >>> prices = process_gold_sjc_data(df)
        >>> prices[0].name
        'SJC 1L, 10L, 1KG'
    """
    records = []
    for _, row in df.iterrows():
        record = {
            "name": row["name"],
            "buy_price": clean_price_string(row["buy_price"]),
            "sell_price": clean_price_string(row["sell_price"]),
        }
        records.append(GoldSJC(**record))
    return records


def process_gold_btmc_data(df: pd.DataFrame) -> list[GoldBTMC]:
    """Process vnstock BTMC gold price DataFrame into validated GoldBTMC models.

    Transforms raw vnstock API data with Vietnamese formatting into
    validated Pydantic models with proper datetime parsing.

    Args:
        df: Raw DataFrame from vnstock btmc_goldprice() function
            Expected columns: name, karat, gold_content, buy_price, sell_price,
                            world_price, time

    Returns:
        List of validated GoldBTMC models

    Raises:
        ValidationError: If data doesn't match schema requirements

    Example:
        >>> from vnstock.explorer.misc.gold_price import btmc_goldprice
        >>> df = btmc_goldprice()
        >>> prices = process_gold_btmc_data(df)
        >>> prices[0].karat
        '24k'
    """
    records = []
    for _, row in df.iterrows():
        record = {
            "name": row["name"],
            "karat": row["karat"],
            "gold_content": row["gold_content"],
            "buy_price": clean_price_int(row["buy_price"]),
            "sell_price": clean_price_int(row["sell_price"]),
            "world_price": clean_price_int(row["world_price"]),
            "time": parse_btmc_datetime(row["time"]),
        }
        records.append(GoldBTMC(**record))
    return records


def process_stock_ohlcv_data(df: pd.DataFrame) -> list[StockOHLCV]:
    """Process vnstock stock OHLCV DataFrame into validated StockOHLCV models.

    Transforms raw vnstock historical price data into validated Pydantic models.

    Args:
        df: Raw DataFrame from vnstock stock price functions
            Expected columns: time, open, high, low, close, volume

    Returns:
        List of validated StockOHLCV models

    Raises:
        ValidationError: If data doesn't match schema requirements

    Example:
        >>> from vnstock import Vnstock
        >>> stock = Vnstock().stock(symbol='FPT', source='VCI')
        >>> df = stock.quote.history(start='2024-01-01', end='2024-12-31')
        >>> ohlcv = process_stock_ohlcv_data(df)
        >>> ohlcv[0].close
        89500.0
    """
    records = []
    for _, row in df.iterrows():
        record = {
            "time": row["time"],
            "open": float(row["open"]),
            "high": float(row["high"]),
            "low": float(row["low"]),
            "close": float(row["close"]),
            "volume": float(row["volume"]),
        }
        records.append(StockOHLCV(**record))
    return records
