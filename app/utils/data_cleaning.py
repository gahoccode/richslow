"""Data cleaning utilities for processing vnstock API responses.

This module provides utility functions for cleaning and transforming raw data
from vnstock API responses into formats compatible with Pydantic schemas.
"""

from datetime import datetime


def clean_price_string(value: str | None) -> float | None:
    """Convert Vietnamese price format string to float.

    Handles comma-separated thousands and dash characters representing missing values.

    Args:
        value: Price string from vnstock API (e.g., "16,391.52", "-", None)

    Returns:
        Float value with commas removed, or None if value is dash or None

    Examples:
        >>> clean_price_string("16,391.52")
        16391.52
        >>> clean_price_string("-")
        None
        >>> clean_price_string(None)
        None
    """
    if value is None or value == "-" or (isinstance(value, str) and value.strip() == ""):
        return None
    return float(str(value).replace(",", ""))


def clean_price_int(value: str | None) -> int | None:
    """Convert Vietnamese price format string to integer.

    Handles comma-separated thousands and dash characters representing missing values.

    Args:
        value: Price string from vnstock API (e.g., "7,542,000", "-", None)

    Returns:
        Integer value with commas removed, or None if value is dash or None

    Examples:
        >>> clean_price_int("7,542,000")
        7542000
        >>> clean_price_int("-")
        None
        >>> clean_price_int(None)
        None
    """
    if value is None or value == "-" or (isinstance(value, str) and value.strip() == ""):
        return None
    return int(str(value).replace(",", ""))


def parse_exchange_date(value: str) -> datetime:
    """Parse vnstock exchange rate date format.

    Args:
        value: Date string in format "YYYY-MM-DD" (e.g., "2024-05-10")

    Returns:
        Parsed datetime object

    Raises:
        ValueError: If date string format is invalid

    Examples:
        >>> parse_exchange_date("2024-05-10")
        datetime.datetime(2024, 5, 10, 0, 0)
    """
    return datetime.strptime(value, "%Y-%m-%d")


def parse_btmc_datetime(value: str) -> datetime:
    """Parse vnstock BTMC gold price datetime format.

    Args:
        value: Datetime string in format "DD/MM/YYYY HH:MM" (e.g., "28/05/2024 08:52")

    Returns:
        Parsed datetime object

    Raises:
        ValueError: If datetime string format is invalid

    Examples:
        >>> parse_btmc_datetime("28/05/2024 08:52")
        datetime.datetime(2024, 5, 28, 8, 52)
    """
    return datetime.strptime(value, "%d/%m/%Y %H:%M")
