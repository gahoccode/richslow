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
     * Fund type: STOCK, BOND, or BALANCED
     */
    fund_type: string;
    /**
     * Current Net Asset Value
     */
    nav?: (number | null);
    /**
     * 1-day NAV change
     */
    nav_change_1d?: (number | null);
    /**
     * 1-week NAV change
     */
    nav_change_1w?: (number | null);
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
     * 1-year NAV change
     */
    nav_change_1y?: (number | null);
    /**
     * 2-year NAV change
     */
    nav_change_2y?: (number | null);
    /**
     * 3-year NAV change
     */
    nav_change_3y?: (number | null);
    /**
     * 1-year annualized return
     */
    nav_change_1y_annualized?: (number | null);
    /**
     * 2-year annualized return
     */
    nav_change_2y_annualized?: (number | null);
    /**
     * 3-year annualized return
     */
    nav_change_3y_annualized?: (number | null);
    /**
     * 12-month annualized return
     */
    nav_change_12m_annualized?: (number | null);
    /**
     * 24-month annualized return
     */
    nav_change_24m_annualized?: (number | null);
    /**
     * 36-month annualized return
     */
    nav_change_36m_annualized?: (number | null);
    /**
     * Fund ownership percentage
     */
    fund_ownership?: (number | null);
    /**
     * Annual management fee
     */
    management_fee?: (number | null);
    /**
     * Fund inception date
     */
    issue_date?: (string | null);
    /**
     * Unique fund identifier
     */
    fund_id: number;
};

