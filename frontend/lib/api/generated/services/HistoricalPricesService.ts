/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExchangeRate } from '../models/ExchangeRate';
import type { GoldBTMC } from '../models/GoldBTMC';
import type { GoldSJC } from '../models/GoldSJC';
import type { StockOHLCV } from '../models/StockOHLCV';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class HistoricalPricesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Fetch Stock Prices
     * Fetch historical stock OHLCV data for a Vietnamese stock ticker.
     *
     * Returns time series data including open, high, low, close prices and volume.
     *
     * **Parameters:**
     * - **ticker**: Vietnamese stock symbol (e.g., FPT, VCB, HPG)
     * - **start_date**: Start date in YYYY-MM-DD format
     * - **end_date**: End date in YYYY-MM-DD format
     * - **interval**: Time interval - 1D (daily), 1W (weekly), 1M (monthly)
     *
     * **Example:**
     * ```
     * GET /api/stock-prices/FPT?start_date=2024-01-01&end_date=2024-12-31&interval=1D
     * ```
     * @returns StockOHLCV Successful Response
     * @throws ApiError
     */
    public fetchStockPricesApiStockPricesTickerGet({
        ticker,
        startDate,
        endDate,
        interval = '1D',
    }: {
        ticker: string,
        /**
         * Start date in YYYY-MM-DD format
         */
        startDate: string,
        /**
         * End date in YYYY-MM-DD format
         */
        endDate: string,
        /**
         * Time interval (1D for daily, 1W for weekly, 1M for monthly)
         */
        interval?: string,
    }): CancelablePromise<Array<StockOHLCV>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock-prices/{ticker}',
            path: {
                'ticker': ticker,
            },
            query: {
                'start_date': startDate,
                'end_date': endDate,
                'interval': interval,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Fetch Exchange Rates
     * Fetch VCB (Vietcombank) exchange rates for major currencies.
     *
     * Returns buy/sell rates for 20+ currencies including USD, EUR, GBP, JPY, CNY, etc.
     *
     * **Parameters:**
     * - **date**: Optional date in YYYY-MM-DD format (defaults to current date)
     *
     * **Example:**
     * ```
     * GET /api/exchange-rates?date=2024-05-10
     * ```
     *
     * **Note:** Dashes ("-") in the original data represent missing values and are converted to None.
     * @returns ExchangeRate Successful Response
     * @throws ApiError
     */
    public fetchExchangeRatesApiExchangeRatesGet({
        date,
    }: {
        /**
         * Date in YYYY-MM-DD format (defaults to today)
         */
        date?: string,
    }): CancelablePromise<Array<ExchangeRate>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/exchange-rates',
            query: {
                'date': date,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Fetch Gold Sjc
     * Fetch current SJC gold prices.
     *
     * Returns buy and sell prices for various SJC gold products including bars,
     * coins, and jewelry with different purities.
     *
     * **Products Include:**
     * - SJC gold bars (1L, 10L, 1KG)
     * - SJC coins (5c, 2c, 1c, 5 phân)
     * - SJC rings (99.99% purity, various weights)
     * - Jewelry (99.99%, 99%, 68%, 41.7% purity)
     *
     * **Example:**
     * ```
     * GET /api/gold/sjc
     * ```
     *
     * **Note:** Prices are in VND per lượng (tael, ~37.5g).
     * @returns GoldSJC Successful Response
     * @throws ApiError
     */
    public fetchGoldSjcApiGoldSjcGet(): CancelablePromise<Array<GoldSJC>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/gold/sjc',
        });
    }
    /**
     * Fetch Gold Btmc
     * Fetch current BTMC (Bảo Tín Minh Châu) gold prices.
     *
     * Returns detailed gold pricing including karat, purity, buy/sell rates,
     * and world price comparisons.
     *
     * **Information Included:**
     * - Product name and type
     * - Karat rating (24k, 18k, etc.)
     * - Gold content/purity (999.9, 99.9, etc.)
     * - Buy price, sell price, world price
     * - Last update timestamp
     *
     * **Example:**
     * ```
     * GET /api/gold/btmc
     * ```
     *
     * **Note:** Prices are in VND. World price provided for reference.
     * @returns GoldBTMC Successful Response
     * @throws ApiError
     */
    public fetchGoldBtmcApiGoldBtmcGet(): CancelablePromise<Array<GoldBTMC>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/gold/btmc',
        });
    }
}
