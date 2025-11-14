from datetime import datetime

from pydantic import BaseModel, Field


class StockOHLCV(BaseModel):
    time: datetime = Field(..., description="Timestamp")
    open: float = Field(..., description="Open price")
    high: float = Field(..., description="High price")
    low: float = Field(..., description="Low price")
    close: float = Field(..., description="Close price")
    volume: float = Field(..., description="Volume")


class GoldSJC(BaseModel):
    name: str = Field(..., description="Name of asset")
    buy_price: float = Field(..., description="Buy price")
    sell_price: float = Field(..., description="Sell price")


class GoldBTMC(BaseModel):
    name: str = Field(..., description="Name of asset")
    karat: str = Field(..., description="Karats")
    gold_content: str = Field(..., description="Gold content")
    buy_price: int = Field(..., description="Buy price")
    sell_price: int = Field(..., description="Sell price")
    world_price: int = Field(..., description="World price")
    time: datetime = Field(..., description="Timestamp")


class ExchangeRate(BaseModel):
    currency_code: str = Field(..., description="Currency code")
    currency_name: str = Field(..., description="Currency name")
    buy_cash: float | None = Field(
        None, alias="buy _cash", description="Buy cash rate (None if not available)"
    )
    buy_transfer: float | None = Field(
        None,
        alias="buy _transfer",
        description="Buy transfer rate (None if not available)",
    )
    sell: float = Field(..., description="Sell price")
    date: datetime = Field(..., description="Timestamp")


# Response wrapper models for API documentation
class StockPricesResponse(BaseModel):
    """Response model for stock price history endpoint."""

    ticker: str = Field(..., description="Stock ticker symbol")
    start_date: str = Field(..., description="Start date of the data range")
    end_date: str = Field(..., description="End date of the data range")
    interval: str = Field(..., description="Time interval (1D, 1W, 1M)")
    data: list[StockOHLCV] = Field(..., description="List of OHLCV data points")
    count: int = Field(..., description="Number of data points returned")


class ExchangeRatesResponse(BaseModel):
    """Response model for exchange rates endpoint."""

    date: str = Field(..., description="Date of exchange rates")
    data: list[ExchangeRate] = Field(..., description="List of exchange rates")
    count: int = Field(..., description="Number of currencies")


class GoldPricesResponse(BaseModel):
    """Response model for gold prices endpoints."""

    source: str = Field(..., description="Data source (SJC or BTMC)")
    timestamp: datetime = Field(..., description="When the data was fetched")
    data: list[GoldSJC | GoldBTMC] = Field(..., description="List of gold prices")
    count: int = Field(..., description="Number of products")
