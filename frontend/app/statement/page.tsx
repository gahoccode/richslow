"use client"

import { useState } from "react"
import useSWR from "swr"
import { useTicker } from "@/contexts/TickerContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TickerSelector } from "@/components/TickerSelector"
import { PeriodSelector } from "@/components/ui/PeriodSelector"
import { IncomeStatementTable } from "@/components/statements/IncomeStatementTable"
import { BalanceSheetTable } from "@/components/statements/BalanceSheetTable"
import { CashFlowStatementTable } from "@/components/statements/CashFlowStatementTable"
import { StatementTableWrapper } from "@/components/statements/StatementTableWrapper"
import api from "@/lib/api/facade"

const YEAR_OPTIONS = [
  { label: 'Last 3 years', value: 3 },
  { label: 'Last 5 years', value: 5 },
  { label: 'Last 10 years', value: 10 },
  { label: 'All years (20)', value: 20 },
];

export default function StatementPage() {
  const { ticker, period } = useTicker();
  const [selectedYears, setSelectedYears] = useState(5);

  const { data, isLoading, error } = useSWR(
    `/api/statements/${ticker}?period=${period}&years=${selectedYears}`,
    () => api.statements.getStatements(ticker, { period, years: selectedYears })
  );

  const years = data?.years || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Statements</h1>
          <p className="text-muted-foreground">
            Comprehensive {period === 'quarter' ? 'quarterly' : 'annual'} financial data
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <TickerSelector />
        <PeriodSelector />

        <div className="w-[200px]">
          <label className="text-sm font-medium mb-2 block">Time Range</label>
          <Select
            value={selectedYears.toString()}
            onValueChange={(value) => setSelectedYears(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          Failed to load financial statements. Please try again.
        </div>
      )}

      {/* Tabbed Tables */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income">Income Statement</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-6">
          <StatementTableWrapper
            title="Income Statement"
            description="Revenue, expenses, and profitability"
            years={years}
            loading={isLoading}
          >
            {data?.income_statements && (
              <IncomeStatementTable
                data={data.income_statements}
                years={years}
              />
            )}
          </StatementTableWrapper>
        </TabsContent>

        <TabsContent value="balance" className="mt-6">
          <StatementTableWrapper
            title="Balance Sheet"
            description="Assets, liabilities, and equity"
            years={years}
            loading={isLoading}
          >
            {data?.balance_sheets && (
              <BalanceSheetTable
                data={data.balance_sheets}
                years={years}
              />
            )}
          </StatementTableWrapper>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <StatementTableWrapper
            title="Cash Flow Statement"
            description="Operating, investing, and financing activities"
            years={years}
            loading={isLoading}
          >
            {data?.cash_flows && (
              <CashFlowStatementTable
                data={data.cash_flows}
                years={years}
              />
            )}
          </StatementTableWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
