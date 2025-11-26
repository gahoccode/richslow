/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Top holdings data model.
 *
 * Portfolio composition data showing top 10 holdings from
 * vnstock fund.details.top_holding() API.
 */
export type FundTopHolding = {
    /**
     * Stock ticker symbol
     */
    code: string;
    /**
     * Industry classification
     */
    industry: string;
    /**
     * Percentage of total assets
     */
    percent_asset: number;
    /**
     * Last update timestamp
     */
    update_date: string;
    /**
     * Fund identifier
     */
    fund_id: number;
};

