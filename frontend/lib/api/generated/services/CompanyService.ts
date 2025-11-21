/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CompanyEventsTCBS } from '../models/CompanyEventsTCBS';
import type { CompanyInsiderDeals } from '../models/CompanyInsiderDeals';
import type { CompanyNews } from '../models/CompanyNews';
import type { CompanyOfficer } from '../models/CompanyOfficer';
import type { CompanyOverviewTCBS } from '../models/CompanyOverviewTCBS';
import type { CompanyProfile } from '../models/CompanyProfile';
import type { CompanyRatioVCI } from '../models/CompanyRatioVCI';
import type { CompanyReportsVCI } from '../models/CompanyReportsVCI';
import type { CompanyShareholders } from '../models/CompanyShareholders';
import type { CompanySubsidiaries } from '../models/CompanySubsidiaries';
import type { DividendHistory } from '../models/DividendHistory';
import type { TradingStatsVCI } from '../models/TradingStatsVCI';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CompanyService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get Company Overview Endpoint
     * Get company overview information from TCBS.
     *
     * Retrieves basic company information including industry classification,
     * shareholder details, trading statistics, and company metadata.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * CompanyOverviewTCBS: Company overview data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyOverviewTCBS Successful Response
     * @throws ApiError
     */
    public getCompanyOverviewEndpointApiCompanyTickerOverviewGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<CompanyOverviewTCBS> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/overview',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Profile Endpoint
     * Get company profile information from TCBS.
     *
     * Retrieves detailed company profile including business description,
     * company history, development strategies, and risk factors.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * CompanyProfile: Company profile data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyProfile Successful Response
     * @throws ApiError
     */
    public getCompanyProfileEndpointApiCompanyTickerProfileGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<CompanyProfile> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/profile',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Shareholders Endpoint
     * Get company shareholder information from TCBS.
     *
     * Retrieves list of major shareholders and their ownership percentages.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyShareholders: Shareholder data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyShareholders Successful Response
     * @throws ApiError
     */
    public getCompanyShareholdersEndpointApiCompanyTickerShareholdersGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyShareholders>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/shareholders',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Officers Endpoint
     * Get company officer information from TCBS.
     *
     * Retrieves list of company officers, management team, and their positions.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyOfficer: Officer data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyOfficer Successful Response
     * @throws ApiError
     */
    public getCompanyOfficersEndpointApiCompanyTickerOfficersGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyOfficer>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/officers',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Subsidiaries Endpoint
     * Get company subsidiary information from TCBS.
     *
     * Retrieves list of subsidiary companies and ownership percentages.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanySubsidiaries: Subsidiary data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanySubsidiaries Successful Response
     * @throws ApiError
     */
    public getCompanySubsidiariesEndpointApiCompanyTickerSubsidiariesGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanySubsidiaries>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/subsidiaries',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Dividends Endpoint
     * Get company dividend history from TCBS.
     *
     * Retrieves historical dividend payments and corporate actions.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of DividendHistory: Dividend data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns DividendHistory Successful Response
     * @throws ApiError
     */
    public getCompanyDividendsEndpointApiCompanyTickerDividendsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<DividendHistory>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/dividends',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Insider Deals Endpoint
     * Get company insider trading information from TCBS.
     *
     * Retrieves insider trading activities by company officers and major shareholders.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyInsiderDeals: Insider deal data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyInsiderDeals Successful Response
     * @throws ApiError
     */
    public getCompanyInsiderDealsEndpointApiCompanyTickerInsiderDealsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyInsiderDeals>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/insider-deals',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Events Endpoint
     * Get company corporate events from TCBS.
     *
     * Retrieves upcoming and past corporate events including shareholder meetings,
     * dividend payments, and other corporate actions.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyEventsTCBS: Corporate event data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyEventsTCBS Successful Response
     * @throws ApiError
     */
    public getCompanyEventsEndpointApiCompanyTickerEventsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyEventsTCBS>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/events',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company News Endpoint
     * Get company news from TCBS.
     *
     * Retrieves recent news articles and announcements related to the company.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyNews: Company news data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyNews Successful Response
     * @throws ApiError
     */
    public getCompanyNewsEndpointApiCompanyTickerNewsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyNews>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/news',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Ratio Endpoint
     * Get company financial ratios from VCI.
     *
     * Retrieves comprehensive financial ratios including profitability,
     * liquidity, efficiency, and valuation metrics across multiple periods.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyRatioVCI: Financial ratio data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyRatioVCI Successful Response
     * @throws ApiError
     */
    public getCompanyRatioEndpointApiCompanyTickerRatioGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyRatioVCI>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/ratio',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Reports Endpoint
     * Get company financial reports from VCI.
     *
     * Retrieves available financial reports with download links and metadata.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * List of CompanyReportsVCI: Financial report data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns CompanyReportsVCI Successful Response
     * @throws ApiError
     */
    public getCompanyReportsEndpointApiCompanyTickerReportsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<Array<CompanyReportsVCI>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/reports',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Get Company Trading Stats Endpoint
     * Get company trading statistics from VCI.
     *
     * Retrieves trading statistics including foreign ownership limits,
     * price bands, and trading volume information.
     *
     * Args:
     * ticker: Stock ticker symbol
     *
     * Returns:
     * TradingStatsVCI: Trading statistics data
     *
     * Raises:
     * HTTPException: If ticker is invalid or data retrieval fails
     * @returns TradingStatsVCI Successful Response
     * @throws ApiError
     */
    public getCompanyTradingStatsEndpointApiCompanyTickerTradingStatsGet({
        ticker,
    }: {
        /**
         * Stock ticker symbol (e.g., 'VCB', 'FPT')
         */
        ticker: string,
    }): CancelablePromise<TradingStatsVCI> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/company/{ticker}/trading-stats',
            path: {
                'ticker': ticker,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
