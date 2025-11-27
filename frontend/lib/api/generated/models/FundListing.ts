/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Fund listing data model.
 *
 * Represents comprehensive fund information including performance metrics,
 * ownership, and management fees from vnstock fund.listing() API.
 */
export type FundListing = {
    /**
     * Fund abbreviation (e.g., 'VCBF-BCF')
     */
    short_name: string;
    /**
     * Full fund name
     */
    name: string;
    /**
     * Fund type: STOCK, BOND, or BALANCED
     */
    fund_type: string;
    /**
     * Fund management company name
     */
    fund_owner_name: string;
    /**
     * Annual management fee percentage
     */
    management_fee: number;
    /**
     * Fund inception date
     */
    inception_date?: (string | null);
    /**
     * Current Net Asset Value
     */
    nav: number;
    /**
     * NAV change from previous day
     */
    nav_change_previous: number;
    /**
     * NAV change from last year
     */
    nav_change_last_year?: (number | null);
    /**
     * NAV change since inception
     */
    nav_change_inception: number;
    /**
     * 1-month NAV change
     */
    nav_change_1m?: (number | null);
    /**
     * 3-month NAV change
     */
    nav_change_3m?: (number | null);
    /**
     * 6-month NAV change
     */
    nav_change_6m?: (number | null);
    /**
     * 12-month NAV change
     */
    nav_change_12m?: (number | null);
    /**
     * 24-month NAV change
     */
    nav_change_24m?: (number | null);
    /**
     * 36-month NAV change
     */
    nav_change_36m?: (number | null);
    /**
     * 36-month annualized return
     */
    nav_change_36m_annualized?: (number | null);
    /**
     * Last NAV update timestamp
     */
    nav_update_at: string;
    /**
     * Unique fund identifier from fmarket
     */
    fund_id_fmarket: number;
    /**
     * Official fund code
     */
    fund_code: string;
    /**
     * VSD fee identifier
     */
    vsd_fee_id: string;
};

