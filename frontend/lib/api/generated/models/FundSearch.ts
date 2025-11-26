/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Fund search result model.
 *
 * Minimal fund information returned from vnstock fund.filter() API
 * for quick search and autocomplete functionality.
 */
export type FundSearch = {
    /**
     * Unique fund identifier
     */
    fund_id: number;
    /**
     * Fund abbreviation
     */
    short_name: string;
};

