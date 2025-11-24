/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IndustryBenchmark } from '../models/IndustryBenchmark';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class IndustryBenchmarkService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Industry Benchmark By Id
     * Get industry benchmark financial ratios by industry ID.
     *
     * Fetches financial ratios for all companies in the specified industry and calculates
     * statistical benchmarks (mean, median, percentiles) for comparison.
     *
     * Args:
     * industry_id: ICB industry classification code
     * min_companies: Minimum number of companies required for valid benchmark
     *
     * Returns:
     * IndustryBenchmark: Statistical benchmarks for key financial ratios
     *
     * Raises:
     * HTTPException: If industry not found or insufficient data available
     * @returns IndustryBenchmark Successful Response
     * @throws ApiError
     */
    public getIndustryBenchmarkByIdApiIndustryBenchmarkIndustryIdGet({
        industryId,
        minCompanies = 5,
    }: {
        /**
         * Industry ID (ICB classification code)
         */
        industryId: number,
        /**
         * Minimum companies required for valid benchmark
         */
        minCompanies?: number,
    }): CancelablePromise<IndustryBenchmark> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/industry/benchmark/{industry_id}',
            path: {
                'industry_id': industryId,
            },
            query: {
                'min_companies': minCompanies,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Industry Benchmark By Name
     * Get industry benchmark financial ratios by industry name.
     *
     * Fetches financial ratios for all companies in the specified industry and calculates
     * statistical benchmarks (mean, median, percentiles) for comparison.
     *
     * Args:
     * industry_name: Name of the industry
     * min_companies: Minimum number of companies required for valid benchmark
     *
     * Returns:
     * IndustryBenchmark: Statistical benchmarks for key financial ratios
     *
     * Raises:
     * HTTPException: If industry not found or insufficient data available
     * @returns IndustryBenchmark Successful Response
     * @throws ApiError
     */
    public getIndustryBenchmarkByNameApiIndustryBenchmarkGet({
        industryName,
        minCompanies = 5,
    }: {
        /**
         * Industry name
         */
        industryName: string,
        /**
         * Minimum companies required for valid benchmark
         */
        minCompanies?: number,
    }): CancelablePromise<IndustryBenchmark> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/industry/benchmark',
            query: {
                'industry_name': industryName,
                'min_companies': minCompanies,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Industry Classifications
     * Get mapping of industry ID to industry names.
     *
     * Returns:
     * Dictionary mapping industry codes to industry names for reference
     * @returns string Successful Response
     * @throws ApiError
     */
    public getIndustryClassificationsApiIndustryClassificationsGet(): CancelablePromise<Record<string, string>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/industry/classifications',
        });
    }
    /**
     * Get Company Industry Benchmark
     * Get industry benchmark for a specific company's industry.
     *
     * Automatically determines the company's industry and returns benchmark data
     * for that industry.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * IndustryBenchmark: Statistical benchmarks for the company's industry
     *
     * Raises:
     * HTTPException: If company not found or industry data unavailable
     * @returns IndustryBenchmark Successful Response
     * @throws ApiError
     */
    public getCompanyIndustryBenchmarkApiIndustryBenchmarkCompanyTickerGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol
         */
        ticker: string,
    }): CancelablePromise<IndustryBenchmark> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/industry/benchmark/company/{ticker}',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
