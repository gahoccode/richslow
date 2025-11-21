/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExchangeRate = {
    /**
     * Currency code
     */
    currency_code: string;
    /**
     * Currency name
     */
    currency_name: string;
    /**
     * Buy cash rate (None if not available)
     */
    buy_cash?: (number | null);
    /**
     * Buy transfer rate (None if not available)
     */
    buy_transfer?: (number | null);
    /**
     * Sell price
     */
    sell: number;
    /**
     * Timestamp
     */
    date: string;
};

