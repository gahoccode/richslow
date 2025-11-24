/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BalanceSheetData } from './BalanceSheetData';
import type { CashFlowData } from './CashFlowData';
import type { FinancialRatiosData } from './FinancialRatiosData';
import type { IncomeStatementData } from './IncomeStatementData';
export type FinancialStatementsResponse = {
    /**
     * Stock ticker symbol
     */
    ticker: string;
    /**
     * Report period
     */
    period: string;
    /**
     * Income statement data by year
     */
    income_statements: Array<IncomeStatementData>;
    /**
     * Balance sheet data by year
     */
    balance_sheets: Array<BalanceSheetData>;
    /**
     * Cash flow data by year
     */
    cash_flows: Array<CashFlowData>;
    /**
     * Financial ratios data by year
     */
    ratios: Array<FinancialRatiosData>;
    /**
     * Available years (for annual) or period IDs (for quarterly, e.g., '2024-Q1')
     */
    years: Array<(number | string)>;
    /**
     * Raw financial data
     */
    raw_data?: (Record<string, Array<Record<string, any>>> | null);
};

