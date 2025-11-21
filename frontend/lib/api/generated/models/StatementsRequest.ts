/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PeriodType } from './PeriodType';
export type StatementsRequest = {
    /**
     * Stock ticker symbol
     */
    ticker: string;
    /**
     * Start date in YYYY-MM-DD format
     */
    start_date: string;
    /**
     * End date in YYYY-MM-DD format
     */
    end_date: string;
    /**
     * Analysis period
     */
    period?: PeriodType;
};

