"""API routes for historical prices, exchange rates, and gold prices."""

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from vnstock import Vnstock
from vnstock.explorer.misc.exchange_rate import vcb_exchange_rate
from vnstock.explorer.misc.gold_price import btmc_goldprice, sjc_gold_price

from app.schemas.historical_prices import ExchangeRate, GoldBTMC, GoldSJC, StockOHLCV
from app.services.service_historical_prices import (
    process_exchange_rate_data,
    process_gold_btmc_data,
    process_gold_sjc_data,
    process_stock_ohlcv_data,
)

router = APIRouter(prefix="/api", tags=["Historical Prices"])


@router.get("/stock-prices/{ticker}", response_model=list[StockOHLCV])
async def fetch_stock_prices(
    ticker: str,
    start_date: str = Query(
        ..., description="Start date in YYYY-MM-DD format", examples=["2024-01-01"]
    ),
    end_date: str = Query(
        ..., description="End date in YYYY-MM-DD format", examples=["2024-12-31"]
    ),
    interval: str = Query(
        "1D", description="Time interval (1D for daily, 1W for weekly, 1M for monthly)"
    ),
):
    """
    Fetch historical stock OHLCV data for a Vietnamese stock ticker.

    Returns time series data including open, high, low, close prices and volume.

    **Parameters:**
    - **ticker**: Vietnamese stock symbol (e.g., FPT, VCB, HPG)
    - **start_date**: Start date in YYYY-MM-DD format
    - **end_date**: End date in YYYY-MM-DD format
    - **interval**: Time interval - 1D (daily), 1W (weekly), 1M (monthly)

    **Example:**
    ```
    GET /api/stock-prices/FPT?start_date=2024-01-01&end_date=2024-12-31&interval=1D
    ```
    """
    try:
        # Fetch stock data using vnstock
        stock = Vnstock().stock(symbol=ticker.upper(), source="VCI")
        df = stock.quote.history(start=start_date, end=end_date, interval=interval)

        if df is None or df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No price data found for ticker {ticker} in the specified date range",
            )

        # Process and validate data
        return process_stock_ohlcv_data(df)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch stock prices: {str(e)}"
        ) from e


@router.get("/exchange-rates", response_model=list[ExchangeRate])
async def fetch_exchange_rates(
    date: str = Query(
        None,
        description="Date in YYYY-MM-DD format (defaults to today)",
        examples=["2024-05-10"],
    )
):
    """
    Fetch VCB (Vietcombank) exchange rates for major currencies.

    Returns buy/sell rates for 20+ currencies including USD, EUR, GBP, JPY, CNY, etc.

    **Parameters:**
    - **date**: Optional date in YYYY-MM-DD format (defaults to current date)

    **Example:**
    ```
    GET /api/exchange-rates?date=2024-05-10
    ```

    **Note:** Dashes ("-") in the original data represent missing values and are converted to None.
    """
    try:
        # Use today's date if not provided
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        # Fetch exchange rate data
        df = vcb_exchange_rate(date=date)

        if df is None or df.empty:
            raise HTTPException(
                status_code=404, detail=f"No exchange rate data found for date {date}"
            )

        # Process and validate data
        return process_exchange_rate_data(df)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch exchange rates: {str(e)}"
        ) from e


@router.get("/gold/sjc", response_model=list[GoldSJC])
async def fetch_gold_sjc():
    """
    Fetch current SJC gold prices.

    Returns buy and sell prices for various SJC gold products including bars,
    coins, and jewelry with different purities.

    **Products Include:**
    - SJC gold bars (1L, 10L, 1KG)
    - SJC coins (5c, 2c, 1c, 5 phân)
    - SJC rings (99.99% purity, various weights)
    - Jewelry (99.99%, 99%, 68%, 41.7% purity)

    **Example:**
    ```
    GET /api/gold/sjc
    ```

    **Note:** Prices are in VND per lượng (tael, ~37.5g).
    """
    try:
        # Fetch SJC gold price data
        df = sjc_gold_price()

        if df is None or df.empty:
            raise HTTPException(
                status_code=404, detail="No SJC gold price data available"
            )

        # Process and validate data
        return process_gold_sjc_data(df)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch SJC gold prices: {str(e)}"
        ) from e


@router.get("/gold/btmc", response_model=list[GoldBTMC])
async def fetch_gold_btmc():
    """
    Fetch current BTMC (Bảo Tín Minh Châu) gold prices.

    Returns detailed gold pricing including karat, purity, buy/sell rates,
    and world price comparisons.

    **Information Included:**
    - Product name and type
    - Karat rating (24k, 18k, etc.)
    - Gold content/purity (999.9, 99.9, etc.)
    - Buy price, sell price, world price
    - Last update timestamp

    **Example:**
    ```
    GET /api/gold/btmc
    ```

    **Note:** Prices are in VND. World price provided for reference.
    """
    try:
        # Fetch BTMC gold price data
        df = btmc_goldprice()

        if df is None or df.empty:
            raise HTTPException(
                status_code=404, detail="No BTMC gold price data available"
            )

        # Process and validate data
        return process_gold_btmc_data(df)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch BTMC gold prices: {str(e)}"
        ) from e
