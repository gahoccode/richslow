"""
Data transformation utilities for safely extracting values from pandas DataFrames.

This module provides helper functions to extract data from vnstock API responses
with proper type handling and null safety.
"""

from typing import Any

import pandas as pd


def safe_get_float(row: pd.Series, column_name: str) -> float | None:
    """
    Safely extract a float value from pandas Series.

    Args:
        row: pandas Series representing a DataFrame row
        column_name: Name of the column to extract

    Returns:
        Float value or None if extraction fails or value is NaN

    Side Effects:
        None

    Business Rules:
        - Returns None for missing columns
        - Returns None for NaN/null values
        - Converts numeric types to float
        - Returns None on conversion errors
    """
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return float(value)
    except (ValueError, TypeError, KeyError):
        return None


def safe_get_str(row: pd.Series, column_name: str) -> str | None:
    """
    Safely extract a string value from pandas Series.

    Args:
        row: pandas Series representing a DataFrame row
        column_name: Name of the column to extract

    Returns:
        String value or None if extraction fails or value is NaN

    Side Effects:
        None

    Business Rules:
        - Returns None for missing columns
        - Returns None for NaN/null values
        - Converts values to string
        - Returns None on conversion errors
    """
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return str(value)
    except (ValueError, TypeError, KeyError):
        return None


def safe_get_int(row: pd.Series, column_name: str) -> int | None:
    """
    Safely extract an integer value from pandas Series.

    Args:
        row: pandas Series representing a DataFrame row
        column_name: Name of the column to extract

    Returns:
        Integer value or None if extraction fails or value is NaN

    Side Effects:
        None

    Business Rules:
        - Returns None for missing columns
        - Returns None for NaN/null values
        - Converts numeric types to int
        - Returns None on conversion errors
    """
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return int(value)
    except (ValueError, TypeError, KeyError):
        return None


def safe_convert_float(value: Any) -> float | None:
    """
    Safely convert any value to float.

    Args:
        value: Value to convert

    Returns:
        Float value or None if conversion fails

    Side Effects:
        None

    Business Rules:
        - Returns None for None or NaN input
        - Attempts float conversion
        - Returns None on conversion errors
    """
    if value is None or pd.isna(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def apply_field_mapping(
    row: pd.Series, field_name: str, mapping: dict[str, str]
) -> float | None:
    """
    Apply field mapping to extract value from DataFrame row using centralized mappings.

    Args:
        row: pandas Series representing a row from DataFrame
        field_name: Schema field name (e.g., 'revenue', 'net_profit')
        mapping: Field mapping dictionary (e.g., INCOME_STATEMENT_MAPPINGS)

    Returns:
        Extracted float value or None if not found/invalid

    Side Effects:
        None

    Business Rules:
        - Uses centralized field mappings for API column name lookup
        - Returns None for unmapped field names
        - Returns None for missing columns or invalid values
        - Handles NaN values gracefully
    """
    api_column_name = mapping.get(field_name)
    if api_column_name is None:
        return None
    return safe_get_float(row, api_column_name)
