/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type IncomeStatementData = {
    /**
     * Stock ticker symbol
     */
    ticker?: (string | null);
    /**
     * Report year
     */
    year_report?: (number | null);
    /**
     * Period identifier (e.g., '2024-Q1' for quarterly, None for annual)
     */
    period_id?: (string | null);
    /**
     * Total revenue in billions VND
     */
    revenue?: (number | null);
    /**
     * Revenue year-over-year growth %
     */
    revenue_yoy?: (number | null);
    /**
     * Gross sales
     */
    sales?: (number | null);
    /**
     * Sales deductions
     */
    sales_deductions?: (number | null);
    /**
     * Net sales
     */
    net_sales?: (number | null);
    /**
     * Cost of sales
     */
    cost_of_sales?: (number | null);
    /**
     * Selling expenses
     */
    selling_expenses?: (number | null);
    /**
     * General & administrative expenses
     */
    general_admin_expenses?: (number | null);
    /**
     * Gross profit
     */
    gross_profit?: (number | null);
    /**
     * Operating profit/loss
     */
    operating_profit?: (number | null);
    /**
     * Profit before tax
     */
    profit_before_tax?: (number | null);
    /**
     * Net profit for the year
     */
    net_profit?: (number | null);
    /**
     * Profit attributable to parent company
     */
    attributable_to_parent?: (number | null);
    /**
     * Attributable to parent (Bn. VND)
     */
    attributable_to_parent_vnd?: (number | null);
    /**
     * Attributable to parent YoY %
     */
    attributable_to_parent_yoy?: (number | null);
    /**
     * Minority interest
     */
    minority_interest?: (number | null);
    /**
     * Financial income
     */
    financial_income?: (number | null);
    /**
     * Financial expenses
     */
    financial_expenses?: (number | null);
    /**
     * Interest expenses
     */
    interest_expenses?: (number | null);
    /**
     * Current business income tax
     */
    business_tax_current?: (number | null);
    /**
     * Deferred business income tax
     */
    business_tax_deferred?: (number | null);
    /**
     * Other income
     */
    other_income?: (number | null);
    /**
     * Other income/expenses
     */
    other_income_expenses?: (number | null);
    /**
     * Net other income/expenses
     */
    net_other_income?: (number | null);
    /**
     * Gain/(loss) from joint ventures
     */
    gain_loss_joint_ventures?: (number | null);
    /**
     * Net income from associated companies
     */
    net_income_associated_companies?: (number | null);
};

