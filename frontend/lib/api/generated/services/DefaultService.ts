/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DefaultService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Serve Index
     * Serve the main landing page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public serveIndexGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/',
        });
    }
    /**
     * Serve Statements
     * Serve the financial statements page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public serveStatementsStatementsGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/statements',
        });
    }
    /**
     * Serve Dashboard
     * Serve the interactive dashboard page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public serveDashboardDashboardGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/dashboard',
        });
    }
    /**
     * Serve Market
     * Serve the market data page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public serveMarketMarketGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/market',
        });
    }
    /**
     * Root Health
     * Root health check.
     * @returns any Successful Response
     * @throws ApiError
     */
    public rootHealthHealthGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
        });
    }
}
