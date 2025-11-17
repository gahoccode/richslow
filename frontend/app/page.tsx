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
import { ChartRadialStacked } from "@/components/charts/ChartRadialStacked";
import { ChartRadarMultiple } from "@/components/charts/ChartRadarMultiple";
import { ChartBarNegative } from "@/components/charts/ChartBarNegative";
import { ChartDividendTimeline } from "@/components/charts/ChartDividendTimeline";

export default function Home() {
  const { ticker, startDate, endDate, period } = useTicker();
  const { data, loading, error } = useStockData(ticker, startDate, endDate, period);

  // Transform API data for charts
  const profitabilityData = data.statements?.income_statements?.map((stmt) => ({
    period: stmt.year_report?.toString() || 'N/A',
    revenue: stmt.revenue || 0,
    grossProfit: stmt.gross_profit || 0,
    operatingProfit: stmt.operating_profit || 0,
    netProfit: stmt.net_profit || 0,
  })) || [];

  const priceData = data.prices?.map((price) => ({
    time: price.time || '',
    close: price.close || 0,
    open: price.open || 0,
    high: price.high || 0,
    low: price.low || 0,
    volume: price.volume || 0,
  })) || [];

  // Quarterly revenue data for ChartBarDefault
  const quarterlyRevenueData = data.statements?.income_statements?.map((stmt) => ({
    period: stmt.year_report?.toString() || 'N/A',
    revenue: stmt.revenue || 0,
  })) || [];

  // Valuation ratios for ChartRadarMultiple (4 metrics with industry benchmark)
  const valuationRadarData = data.ratios ? [
    {
      metric: "P/E",
      company: data.ratios.pe || 0,
      industry: data.industryBenchmark?.benchmarks?.pe_ratio?.median,
      fullName: "Price to Earning"
    },
    {
      metric: "P/B",
      company: data.ratios.pb || 0,
      industry: data.industryBenchmark?.benchmarks?.pb_ratio?.median,
      fullName: "Price to Book"
    },
    {
      metric: "P/S",
      company: data.ratios.ps || 0,
      industry: data.industryBenchmark?.benchmarks?.ps_ratio?.median,
      fullName: "Price to Sales"
    },
    {
      metric: "EV/EBITDA",
      company: data.ratios.ev_per_ebitda || 0,
      industry: data.industryBenchmark?.benchmarks?.ev_ebitda?.median,
      fullName: "Enterprise Value to EBITDA"
    },
  ] : [];

  // Profitability gauges for ChartRadialStacked
  const profitabilityGauges = data.ratios ? {
    roe: data.ratios.roe || 0,
    roa: data.ratios.roa || 0,
    roic: data.ratios.roic || 0,
  } : undefined;

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
            value={data.ratios?.pe}
            unit="x"
            loading={loading}
            description="Price to Earnings"
          />
          <MetricCard
            title="ROE"
            value={data.ratios?.roe ? data.ratios.roe / 100 : null}
            unit="%"
            loading={loading}
            description="Return on Equity"
          />
          <MetricCard
            title="D/E Ratio"
            value={data.ratios?.de}
            unit="x"
            loading={loading}
            description="Debt to Equity"
            invertColors={true}
          />
          <MetricCard
            title="Current Ratio"
            value={data.ratios?.current_ratio}
            unit="x"
            loading={loading}
            description="Liquidity Ratio"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Profitability Gauges */}
          <ChartRadialStacked
            data={profitabilityGauges}
            title="Profitability Metrics"
            description="ROE, ROA, and ROIC performance"
          />

          {/* Valuation Ratios Radar */}
          <ChartRadarMultiple
            data={valuationRadarData}
            variant="valuation"
            industryName={data.industryBenchmark?.industry_name}
            title="Valuation Metrics"
            description="Key valuation ratios vs industry benchmark"
          />

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
    </div>
  );
}
