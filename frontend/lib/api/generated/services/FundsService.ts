/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FundAssetHolding } from '../models/FundAssetHolding';
import type { FundIndustryHolding } from '../models/FundIndustryHolding';
import type { FundListing } from '../models/FundListing';
import type { FundNavReport } from '../models/FundNavReport';
import type { FundSearch } from '../models/FundSearch';
import type { FundTopHolding } from '../models/FundTopHolding';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FundsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Funds Listing
     * Get list of all funds with optional type filtering.
     *
     * Retrieves comprehensive fund information including NAV, performance metrics,
     * ownership, and management fees. Supports filtering by fund type.
     *
     * Args:
     * fund_type: Optional filter - "STOCK", "BOND", "BALANCED", or None for all funds
     *
     * Returns:
     * List of fund listings with performance data. Returns empty list if no funds found.
     *
     * Raises:
     * HTTPException: 500 if API call fails
     *
     * Example:
     * GET /api/funds/listing
     * GET /api/funds/listing?fund_type=STOCK
     * @returns FundListing Successful Response
     * @throws ApiError
     */
    public getFundsListingApiFundsListingGet({
        fundType,
    }: {
        /**
         * Filter by fund type: STOCK, BOND, BALANCED, or omit for all
         */
        fundType?: (string | null),
    }): CancelablePromise<Array<FundListing>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/listing',
            query: {
                'fund_type': fundType,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Search Funds Endpoint
     * Search for funds by name or abbreviation.
     *
     * Provides quick search functionality for fund discovery and autocomplete.
     *
     * Args:
     * symbol: Partial name or abbreviation to search (e.g., "VCBF", "BCF")
     *
     * Returns:
     * List of matching funds with fund_id and short_name.
     * Returns empty list if no matches found.
     *
     * Raises:
     * HTTPException: 400 if symbol is invalid, 500 if API call fails
     *
     * Example:
     * GET /api/funds/search?symbol=VCBF
     * @returns FundSearch Successful Response
     * @throws ApiError
     */
    public searchFundsEndpointApiFundsSearchGet({
        symbol,
    }: {
        /**
         * Fund name or abbreviation to search
         */
        symbol: string,
    }): CancelablePromise<Array<FundSearch>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/search',
            query: {
                'symbol': symbol,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Nav Report Endpoint
     * Get historical NAV data for a fund.
     *
     * Retrieves time-series Net Asset Value data from fund inception
     * for performance tracking and charting.
     *
     * Args:
     * symbol: Fund abbreviation (e.g., "VCBF-BCF")
     *
     * Returns:
     * List of historical NAV data points sorted by date (newest first).
     * Returns empty list if no data available.
     *
     * Raises:
     * HTTPException: 404 if fund not found, 500 if API call fails
     *
     * Example:
     * GET /api/funds/VCBF-BCF/nav-report
     * @returns FundNavReport Successful Response
     * @throws ApiError
     */
    public getNavReportEndpointApiFundsSymbolNavReportGet({
        symbol,
    }: {
        /**
         * Fund abbreviation (e.g., 'VCBF-BCF')
         */
        symbol: string,
    }): CancelablePromise<Array<FundNavReport>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/{symbol}/nav-report',
            path: {
                'symbol': symbol,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Top Holdings Endpoint
     * Get top 10 holdings of a fund.
     *
     * Retrieves portfolio composition data showing the fund's largest positions.
     *
     * Args:
     * symbol: Fund abbreviation (e.g., "VCBF-BCF")
     *
     * Returns:
     * List of top holdings with stock codes, industries, and allocation percentages.
     * Returns empty list if no holdings data available.
     *
     * Raises:
     * HTTPException: 404 if fund not found, 500 if API call fails
     *
     * Example:
     * GET /api/funds/VCBF-BCF/top-holdings
     * @returns FundTopHolding Successful Response
     * @throws ApiError
     */
    public getTopHoldingsEndpointApiFundsSymbolTopHoldingsGet({
        symbol,
    }: {
        /**
         * Fund abbreviation (e.g., 'VCBF-BCF')
         */
        symbol: string,
    }): CancelablePromise<Array<FundTopHolding>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/{symbol}/top-holdings',
            path: {
                'symbol': symbol,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Industry Allocation Endpoint
     * Get industry allocation breakdown.
     *
     * Retrieves sector exposure data showing percentage allocation across industries.
     *
     * Args:
     * symbol: Fund abbreviation (e.g., "VCBF-BCF")
     *
     * Returns:
     * List of industry allocations with names and percentages.
     * Returns empty list if no allocation data available.
     *
     * Raises:
     * HTTPException: 404 if fund not found, 500 if API call fails
     *
     * Example:
     * GET /api/funds/VCBF-BCF/industry-allocation
     * @returns FundIndustryHolding Successful Response
     * @throws ApiError
     */
    public getIndustryAllocationEndpointApiFundsSymbolIndustryAllocationGet({
        symbol,
    }: {
        /**
         * Fund abbreviation (e.g., 'VCBF-BCF')
         */
        symbol: string,
    }): CancelablePromise<Array<FundIndustryHolding>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/{symbol}/industry-allocation',
            path: {
                'symbol': symbol,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Asset Allocation Endpoint
     * Get asset class allocation.
     *
     * Retrieves asset class distribution showing allocation across stocks, bonds,
     * cash equivalents, and other asset types.
     *
     * Args:
     * symbol: Fund abbreviation (e.g., "VCBF-BCF")
     *
     * Returns:
     * List of asset allocations with types and percentages.
     * Returns empty list if no allocation data available.
     *
     * Raises:
     * HTTPException: 404 if fund not found, 500 if API call fails
     *
     * Example:
     * GET /api/funds/VCBF-BCF/asset-allocation
     * @returns FundAssetHolding Successful Response
     * @throws ApiError
     */
    public getAssetAllocationEndpointApiFundsSymbolAssetAllocationGet({
        symbol,
    }: {
        /**
         * Fund abbreviation (e.g., 'VCBF-BCF')
         */
        symbol: string,
    }): CancelablePromise<Array<FundAssetHolding>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/funds/{symbol}/asset-allocation',
            path: {
                'symbol': symbol,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
