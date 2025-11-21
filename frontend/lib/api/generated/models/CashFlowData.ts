/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CashFlowData = {
    /**
     * Stock ticker symbol
     */
    ticker?: (string | null);
    /**
     * Report year
     */
    year_report?: (number | null);
    /**
     * Net profit/loss before tax
     */
    profit_before_tax?: (number | null);
    /**
     * Depreciation and amortisation
     */
    depreciation_amortisation?: (number | null);
    /**
     * Provision for credit losses
     */
    provision_credit_losses?: (number | null);
    /**
     * Unrealized foreign exchange gain/loss
     */
    unrealized_fx_gain_loss?: (number | null);
    /**
     * Profit/loss from investing activities
     */
    profit_loss_investing?: (number | null);
    /**
     * Interest expense
     */
    interest_expense?: (number | null);
    /**
     * Operating profit before working capital changes
     */
    operating_profit_before_wc_changes?: (number | null);
    /**
     * Increase/decrease in receivables
     */
    increase_decrease_receivables?: (number | null);
    /**
     * Increase/decrease in inventories
     */
    increase_decrease_inventories?: (number | null);
    /**
     * Increase/decrease in payables
     */
    increase_decrease_payables?: (number | null);
    /**
     * Increase/decrease in prepaid expenses
     */
    increase_decrease_prepaid?: (number | null);
    /**
     * Interest paid
     */
    interest_paid?: (number | null);
    /**
     * Business income tax paid
     */
    business_tax_paid?: (number | null);
    /**
     * Other receipts from operating activities
     */
    other_receipts_operating?: (number | null);
    /**
     * Other payments on operating activities
     */
    other_payments_operating?: (number | null);
    /**
     * Net cash from operating activities
     */
    operating_cash_flow?: (number | null);
    /**
     * Purchase of fixed assets
     */
    purchase_fixed_assets?: (number | null);
    /**
     * Proceeds from disposal of fixed assets
     */
    proceeds_disposal_assets?: (number | null);
    /**
     * Profit/loss from disposal of fixed assets
     */
    profit_loss_disposal_assets?: (number | null);
    /**
     * Loans granted, debt instrument purchases
     */
    loans_granted?: (number | null);
    /**
     * Collection of loans, debt sales proceeds
     */
    collection_loans?: (number | null);
    /**
     * Investment in other entities
     */
    investment_other_entities?: (number | null);
    /**
     * Proceeds from divestment in other entities
     */
    proceeds_divestment?: (number | null);
    /**
     * Gain on dividend
     */
    gain_dividend?: (number | null);
    /**
     * Dividends received
     */
    dividends_received?: (number | null);
    /**
     * Interest income and dividends
     */
    interest_income_dividends?: (number | null);
    /**
     * Net cash from investing activities
     */
    investing_cash_flow?: (number | null);
    /**
     * Increase in charter capital
     */
    increase_charter_capital?: (number | null);
    /**
     * Payments for share repurchases
     */
    share_repurchases?: (number | null);
    /**
     * Proceeds from borrowings
     */
    proceeds_borrowings?: (number | null);
    /**
     * Repayment of borrowings
     */
    repayment_borrowings?: (number | null);
    /**
     * Dividends paid
     */
    dividends_paid?: (number | null);
    /**
     * Finance lease principal payments
     */
    finance_lease_principal_payments?: (number | null);
    /**
     * Cash flows from financial activities
     */
    financing_cash_flow?: (number | null);
    /**
     * Net increase/decrease in cash
     */
    net_change_in_cash?: (number | null);
    /**
     * Cash and cash equivalents at beginning
     */
    cash_beginning?: (number | null);
    /**
     * Foreign exchange differences adjustment
     */
    fx_adjustment?: (number | null);
    /**
     * Cash at end of period
     */
    cash_end_period?: (number | null);
};

