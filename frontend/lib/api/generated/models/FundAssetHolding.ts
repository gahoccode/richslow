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
     * Asset class type
     */
    asset_type: string;
    /**
     * Percentage allocation
     */
    percent_asset: number;
};

