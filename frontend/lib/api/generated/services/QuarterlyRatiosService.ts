/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class QuarterlyRatiosService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Quarterly Ratios
     * Get quarterly financial ratios for a specific company.
     *
     * Retrieves quarterly financial ratios including cash conversion cycle data
     * for enhanced drill-down analysis on the dashboard.
     *
     * Args:
     * ticker: Stock ticker symbol (e.g., 'VCB', 'FPT')
     *
     * Returns:
     * Quarterly financial statements with ratios data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns any Successful Response
     * @throws ApiError
     */
    public getQuarterlyRatiosApiQuarterlyRatiosTickerGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol
         */
        ticker: string,
    }): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/quarterly/ratios/{ticker}',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
