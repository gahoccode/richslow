"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartAreaGradient } from "@/components/charts/ChartAreaGradient"
import { ChartProfitabilityMargins } from "@/components/charts/ChartProfitabilityMargins"
import { ChartCashFlowWaterfall } from "@/components/charts/ChartCashFlowWaterfall"

interface FinancialStatementsTabsProps {
  statements?: {
    income_statements?: Array<{
      year_report?: number | null;
      revenue?: number | null;
      gross_profit?: number | null;
      operating_profit?: number | null;
      net_profit?: number | null;
    }>;
    cash_flows?: Array<{
      year_report?: number | null;
      operating_cash_flow?: number | null;
      investing_cash_flow?: number | null;
      financing_cash_flow?: number | null;
      net_change_in_cash?: number | null;
    }>;
    years?: number[];
  } | null;
  ratios?: Array<{
    year_report?: number;
    gross_margin?: number | null;
    net_profit_margin?: number | null;
    ebit_margin?: number | null;
  }> | null;
  loading?: boolean;
}

export function FinancialStatementsTabs({
  statements,
  ratios,
  loading = false
}: FinancialStatementsTabsProps) {
  // Show skeleton while loading
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  // Prepare revenue & profitability data
  const revenueData = statements?.income_statements?.map((stmt) => ({
    period: stmt.year_report?.toString() || '',
    revenue: stmt.revenue || 0,
    grossProfit: stmt.gross_profit || 0,
    operatingProfit: stmt.operating_profit || 0,
    netProfit: stmt.net_profit || 0,
  })) || [];

  // Prepare profitability margins data from ratios
  const marginData = ratios?.map((ratio) => ({
    period: ratio.year_report?.toString() || '',
    grossMargin: ratio.gross_margin ? ratio.gross_margin * 100 : null,
    ebitMargin: ratio.ebit_margin ? ratio.ebit_margin * 100 : null,
    netMargin: ratio.net_profit_margin ? ratio.net_profit_margin * 100 : null,
  })) || [];

  // Get the most recent cash flow data (latest year)
  const latestCashFlow = statements?.cash_flows?.length
    ? statements.cash_flows[statements.cash_flows.length - 1]
    : null;

  return (
    <Tabs defaultValue="revenue" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
        <TabsTrigger value="profitability">Profitability</TabsTrigger>
        <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue" className="mt-6">
        <ChartAreaGradient
          data={revenueData}
          title="Revenue & Profitability Trends"
          description="Financial performance breakdown over reporting periods"
        />
      </TabsContent>

      <TabsContent value="profitability" className="mt-6">
        <ChartProfitabilityMargins
          data={marginData}
          title="Profitability Margins"
          description="Gross, EBIT, and Net Profit Margins trend analysis"
        />
      </TabsContent>

      <TabsContent value="cashflow" className="mt-6">
        <ChartCashFlowWaterfall
          cashFlowData={latestCashFlow || undefined}
          title="Cash Flow Analysis"
          description={`Cash movements for ${latestCashFlow?.year_report || 'latest reporting period'}`}
        />
        {statements?.cash_flows && statements.cash_flows.length > 1 && (
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Showing data for {latestCashFlow?.year_report}.
            {statements.cash_flows.length - 1} previous {statements.cash_flows.length - 1 === 1 ? 'period' : 'periods'} available.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
