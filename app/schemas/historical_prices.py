from pydantic import BaseModel, Field
from datetime import datetime


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
    buy_cash: float = Field(alias="buy_cash", description="Buy cash")
    buy_transfer: float = Field(alias="buy_transfer", description="Buy transfer")
    sell: float = Field(..., description="Sell price")
    date: datetime = Field(..., description="Timestamp")
