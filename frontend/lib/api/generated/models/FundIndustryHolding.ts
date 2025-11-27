/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Industry allocation model.
 *
 * Sector exposure breakdown from vnstock fund.details.industry_holding() API.
 * Shows percentage allocation across different industries.
 */
export type FundIndustryHolding = {
    /**
     * Industry name
     */
    industry: string;
    /**
     * Percentage allocation
     */
    net_asset_percent: number;
    /**
     * Fund abbreviation
     */
    short_name: string;
};

