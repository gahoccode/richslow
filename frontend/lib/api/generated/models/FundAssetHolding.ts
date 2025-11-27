/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Asset allocation model.
 *
 * Asset class distribution from vnstock fund.details.asset_holding() API.
 * Shows allocation across stocks, bonds, cash equivalents, etc.
 */
export type FundAssetHolding = {
    /**
     * Percentage allocation
     */
    asset_percent: number;
    /**
     * Asset class type
     */
    asset_type: string;
    /**
     * Fund abbreviation
     */
    short_name: string;
};

