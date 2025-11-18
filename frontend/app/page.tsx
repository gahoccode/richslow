"use client";

import React from "react";
import { useTicker } from "@/contexts/TickerContext";
import { useStockData } from "@/hooks/useStockData";
import { TickerSelector } from "@/components/TickerSelector";
import { DateRangePicker } from "@/components/DateRangePicker";
import { MetricCard } from "@/components/MetricCard";
import { ChartAreaGradient } from "@/components/charts/ChartAreaGradient";
import { ChartBarDefault } from "@/components/charts/ChartBarDefault";
import { ChartStockPriceVolume } from "@/components/charts/ChartStockPriceVolume";
import { ChartBarNegative } from "@/components/charts/ChartBarNegative";
import { ChartDividendTimeline } from "@/components/charts/ChartDividendTimeline";
import { FinancialRatiosDashboard } from "@/components/FinancialRatiosDashboard";
import { FinancialStatementsTabs } from "@/components/FinancialStatementsTabs";
import { FloatingNav } from "@/components/FloatingNav";
import { CompanyOverviewCard } from "@/components/company/CompanyOverviewCard";
import { NewsFeed } from "@/components/company/NewsFeed";
import { CorporateEventsTimeline } from "@/components/company/CorporateEventsTimeline";
import { OwnershipStructure } from "@/components/company/OwnershipStructure";
import { useCompanyData } from "@/hooks/useCompanyData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { ticker, startDate, endDate, period } = useTicker();
  const { data, loading, criticalLoading, secondaryLoading, deferredLoading, error } = useStockData(ticker, startDate, endDate, period);
  const { data: companyData, loading: companyLoading } = useCompanyData(ticker);

  // Transform API data for charts - memoized to prevent recalculation on every render
  const profitabilityData = React.useMemo(() =>
    data.statements?.income_statements?.map((stmt) => ({
      period: stmt.year_report?.toString() || 'N/A',
      revenue: stmt.revenue || 0,
      grossProfit: stmt.gross_profit || 0,
      operatingProfit: stmt.operating_profit || 0,
      netProfit: stmt.net_profit || 0,
    })) || [],
    [data.statements?.income_statements]
  );

  const priceData = React.useMemo(() =>
    data.prices?.map((price) => ({
      time: price.time || '',
      close: price.close || 0,
      open: price.open || 0,
      high: price.high || 0,
      low: price.low || 0,
      volume: price.volume || 0,
    })) || [],
    [data.prices]
  );

  // Quarterly revenue data for ChartBarDefault
  const quarterlyRevenueData = React.useMemo(() =>
    data.statements?.income_statements?.map((stmt) => ({
      period: stmt.year_report?.toString() || 'N/A',
      revenue: stmt.revenue || 0,
    })) || [],
    [data.statements?.income_statements]
  );

  // Insider trading data for ChartBarNegative - aggregate by month
  const insiderData = React.useMemo(() => {
    if (!data.insiderDeals || data.insiderDeals.length === 0) return [];

    const monthlyData: Record<string, { month: string; buyVolume: number; sellVolume: number }> = {};

    data.insiderDeals.forEach((deal) => {
      if (!deal.deal_announce_date || !deal.deal_quantity) return;

      const date = new Date(deal.deal_announce_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, buyVolume: 0, sellVolume: 0 };
      }

      const quantity = Math.abs(deal.deal_quantity);
      if (deal.deal_action === 'Mua') {
        monthlyData[monthKey].buyVolume += quantity;
      } else {
        monthlyData[monthKey].sellVolume += quantity;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [data.insiderDeals]);

  // Skeleton chart component for loading states
  const SkeletonChart = ({ title, description }: { title: string; description: string }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-[250px] w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">RichSlow</h1>
            <span className="text-sm text-muted-foreground hidden md:block">
              Vietnamese Stock Market Analysis
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <TickerSelector />
              <DateRangePicker />
            </div>
            {loading && (
              <div className="text-sm text-muted-foreground hidden lg:block">Loading...</div>
            )}
            {error && (
              <div className="text-sm text-destructive hidden lg:block">Error loading data</div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Financial analysis and market data visualization for {ticker}
          </p>
        </div>

        {/* Metric Cards Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="P/E Ratio"
            value={data.ratios?.pe as number | undefined}
            unit="x"
            loading={criticalLoading}
            description="Price to Earnings"
          />
          <MetricCard
            title="ROE"
            value={data.ratios?.roe ? (data.ratios.roe as number) / 100 : null}
            unit="%"
            loading={criticalLoading}
            description="Return on Equity"
          />
          <MetricCard
            title="D/E Ratio"
            value={data.ratios?.de as number | undefined}
            unit="x"
            loading={criticalLoading}
            description="Debt to Equity"
            invertColors={true}
          />
          <MetricCard
            title="Current Ratio"
            value={data.ratios?.current_ratio as number | undefined}
            unit="x"
            loading={criticalLoading}
            description="Liquidity Ratio"
          />
        </div>

        {/* Charts Grid - Progressive Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* STAGE 1: Critical Charts (Load First) */}
          {criticalLoading ? (
            <>
              <SkeletonChart
                title="Revenue & Profitability"
                description={`Financial performance from ${startDate} to ${endDate}`}
              />
              <SkeletonChart
                title="Stock Price & Volume"
                description="Price trends with trading volume"
              />
              <SkeletonChart
                title="Quarterly Revenue"
                description="Revenue comparison by reporting period"
              />
            </>
          ) : (
            <>
              {/* Revenue & Profitability Trend */}
              <ChartAreaGradient
                data={profitabilityData}
                title="Revenue & Profitability"
                description={`Financial performance from ${startDate} to ${endDate}`}
              />

              {/* Stock Price Movement */}
              <ChartStockPriceVolume
                data={priceData}
                ticker={ticker}
                title="Stock Price & Volume"
                description="Price trends with trading volume"
              />

              {/* Quarterly Revenue Comparison */}
              <ChartBarDefault
                data={quarterlyRevenueData}
                title="Quarterly Revenue"
                description="Revenue comparison by reporting period"
              />
            </>
          )}

          {/* STAGE 2: Secondary Charts (Load After Critical) */}
          {secondaryLoading ? (
            <>
              <SkeletonChart
                title="Insider Trading"
                description="Buy and sell transactions by company insiders"
              />
              {data.dividends && data.dividends.length > 0 && (
                <SkeletonChart
                  title="Dividend History"
                  description="Historical dividend payment timeline"
                />
              )}
            </>
          ) : (
            <>
              {/* Insider Trading Activity */}
              <ChartBarNegative
                data={insiderData}
                title="Insider Trading"
                description="Buy and sell transactions by company insiders"
              />

              {/* Dividend Timeline */}
              {data.dividends && data.dividends.length > 0 && (
                <ChartDividendTimeline
                  data={data.dividends}
                  title="Dividend History"
                  description="Historical dividend payment timeline"
                />
              )}
            </>
          )}

        </div>

        {/* Financial Statements Section - Full Width Tabs */}
        <div className="mt-8">
          {criticalLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <FinancialStatementsTabs
              statements={data.statements || undefined}
              ratios={data.ratios ? [data.ratios] : undefined}
              loading={criticalLoading}
            />
          )}
        </div>

        {/* Financial Ratios Dashboard - Full Width Section */}
        <div className="mt-8">
          {deferredLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[500px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <FinancialRatiosDashboard
              ratios={data.ratios || undefined}
              industryBenchmark={data.industryBenchmark || undefined}
              statements={data.statements || undefined}
              loading={deferredLoading}
            />
          )}
        </div>

        {/* Company Information Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Company Information</h2>

          {/* Company Overview - Full Width */}
          <div className="mb-6">
            {companyLoading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : (
              <CompanyOverviewCard
                overview={companyData.overview}
                profile={companyData.profile}
                loading={companyLoading}
              />
            )}
          </div>

          {/* News, Events, and Ownership - 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* News Feed */}
            <NewsFeed
              news={companyData.news}
              loading={companyLoading}
            />

            {/* Corporate Events Timeline */}
            <CorporateEventsTimeline
              events={companyData.events}
              loading={companyLoading}
            />
          </div>

          {/* Ownership Structure - Full Width */}
          <OwnershipStructure
            shareholders={companyData.shareholders}
            subsidiaries={companyData.subsidiaries}
            loading={companyLoading}
          />
        </div>

        {/* Data Summary */}
        {!loading && !error && (
          <div className="mt-8 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Price Points:</span>{" "}
                <span className="font-mono">{priceData.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Periods:</span>{" "}
                <span className="font-mono">{profitabilityData.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Latest Close:</span>{" "}
                <span className="font-mono">
                  {priceData[priceData.length - 1]?.close?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Latest Revenue:</span>{" "}
                <span className="font-mono">
                  {(profitabilityData[profitabilityData.length - 1]?.revenue / 1e9).toFixed(2)}B
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
      <FloatingNav />
    </div>
  );
}
