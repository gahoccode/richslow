/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FinancialStatementsResponse } from '../models/FinancialStatementsResponse';
import { PeriodType } from '../models/PeriodType';
import type { StatementsRequest } from '../models/StatementsRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FinancialStatementsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Fetch Financial Statements
     * Fetch comprehensive financial statements for a given stock ticker.
     *
     * Returns income statement, balance sheet, and cash flow data.
     * @returns FinancialStatementsResponse Successful Response
     * @throws ApiError
     */
    public fetchFinancialStatementsApiStatementsPost({
        requestBody,
    }: {
        requestBody: StatementsRequest,
    }): CancelablePromise<FinancialStatementsResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/statements',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Fetch Financial Statements Get
     * Fetch financial statements using GET method for easier frontend integration.
     *
     * Returns the last N years of financial statements (annual or quarterly).
     * @returns FinancialStatementsResponse Successful Response
     * @throws ApiError
     */
    public fetchFinancialStatementsGetApiStatementsTickerGet({
        ticker,
        period = PeriodType.YEAR,
        years = 5,
    }: {
        ticker: string,
        period?: PeriodType,
        /**
         * Number of years to fetch
         */
        years?: number,
    }): CancelablePromise<FinancialStatementsResponse> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/statements/{ticker}',
            path: {
                'ticker': ticker,
            },
            query: {
                'period': period,
                'years': years,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Health Check
     * Health check endpoint.
     * @returns any Successful Response
     * @throws ApiError
     */
    public healthCheckApiHealthGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/health',
        });
    }
}
