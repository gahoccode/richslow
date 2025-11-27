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
    stock_code: string;
    /**
     * Industry classification
     */
    industry: string;
    /**
     * Percentage of total assets
     */
    net_asset_percent: number;
    /**
     * Asset type classification
     */
    type_asset: string;
    /**
     * Last update timestamp
     */
    update_at: string;
    /**
     * Fund identifier
     */
    fund_id: number;
    /**
     * Fund abbreviation
     */
    short_name: string;
};

