/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Historical NAV data model.
 *
 * Time-series Net Asset Value data from vnstock fund.details.nav_report() API.
 * Used for performance tracking and charting.
 */
export type FundNavReport = {
    /**
     * Date in YYYY-MM-DD format
     */
    nav_date: string;
    /**
     * NAV value per unit
     */
    nav_per_unit: number;
    /**
     * Fund identifier
     */
    fund_id: number;
};

