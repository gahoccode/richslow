"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartRadarMultiple } from "@/components/charts/ChartRadarMultiple";
import { ChartRadialStacked } from "@/components/charts/ChartRadialStacked";
import { ChartLiquidityProgress } from "@/components/charts/ChartLiquidityProgress";
import { ChartEfficiencyMetrics } from "@/components/charts/ChartEfficiencyMetrics";
import { ChartLeverageGauge } from "@/components/charts/ChartLeverageGauge";
import { Skeleton } from "@/components/ui/skeleton";

// Import types from API
import type { CompanyRatioVCI, IndustryBenchmark, FinancialStatements } from "@/lib/api/facade";

interface CompanyRatios extends Partial<CompanyRatioVCI> {}

interface FinancialRatiosDashboardProps {
  ratios?: CompanyRatios;
  industryBenchmark?: IndustryBenchmark;
  statements?: FinancialStatements;
  loading?: boolean;
}

export function FinancialRatiosDashboard({
  ratios,
  industryBenchmark,
  statements,
  loading
}: FinancialRatiosDashboardProps) {
  // Track active tab and which tabs have been viewed
  const [activeTab, setActiveTab] = React.useState<string>("valuation");
  const [viewedTabs, setViewedTabs] = React.useState<Set<string>>(new Set(["valuation"]));

  // Add current tab to viewed tabs when it changes
  React.useEffect(() => {
    setViewedTabs(prev => new Set([...prev, activeTab]));
  }, [activeTab]);

  // Prepare valuation radar data
  const valuationRadarData = React.useMemo(() => {
    if (!ratios) return [];

    return [
      {
        metric: "P/E",
        company: ratios.pe || 0,
        industry: industryBenchmark?.benchmarks?.pe_ratio?.median,
        fullName: "Price to Earning"
      },
      {
        metric: "P/B",
        company: ratios.pb || 0,
        industry: industryBenchmark?.benchmarks?.pb_ratio?.median,
        fullName: "Price to Book"
      },
      {
        metric: "P/S",
        company: ratios.ps || 0,
        industry: industryBenchmark?.benchmarks?.ps_ratio?.median,
        fullName: "Price to Sales"
      },
      {
        metric: "EV/EBITDA",
        company: ratios.ev_per_ebitda || 0,
        industry: industryBenchmark?.benchmarks?.ev_ebitda?.median,
        fullName: "Enterprise Value to EBITDA"
      },
    ];
  }, [ratios, industryBenchmark]);

  // Prepare profitability gauge data
  const profitabilityGauges = React.useMemo(() => {
    if (!ratios) return undefined;

    return {
      roe: ratios.roe || 0,
      roa: ratios.roa || 0,
      roic: ratios.roic || 0,
    };
  }, [ratios]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Financial Ratios Analysis</CardTitle>
        <CardDescription>
          Comprehensive ratio metrics across valuation, profitability, liquidity, efficiency, and leverage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="valuation"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="valuation">Valuation</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
            <TabsTrigger value="leverage">Leverage</TabsTrigger>
          </TabsList>

          {/* Tab 1: Valuation */}
          <TabsContent value="valuation" className="mt-0">
            <div className="py-4">
              <ChartRadarMultiple
                data={valuationRadarData}
                variant="valuation"
                industryName={industryBenchmark?.industry_name}
                title="Valuation Metrics"
                description="Key valuation ratios vs industry benchmark"
              />
            </div>
          </TabsContent>

          {/* Tab 2: Profitability */}
          <TabsContent value="profitability" className="mt-0">
            <div className="py-4">
              <ChartRadialStacked
                data={profitabilityGauges}
                title="Profitability Metrics"
                description="ROE, ROA, and ROIC performance"
              />
            </div>
          </TabsContent>

          {/* Tab 3: Liquidity - Lazy Loaded */}
          <TabsContent value="liquidity" className="mt-0">
            <div className="py-4">
              {viewedTabs.has("liquidity") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Liquidity Ratios</CardTitle>
                    <CardDescription>
                      Short-term financial health and ability to meet obligations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartLiquidityProgress
                      data={{
                        current_ratio: ratios?.current_ratio,
                        quick_ratio: ratios?.quick_ratio,
                        cash_ratio: ratios?.cash_ratio,
                      }}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Skeleton className="h-[400px] w-full" />
                  <p className="text-sm text-muted-foreground">Loading liquidity data...</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 4: Efficiency - Lazy Loaded */}
          <TabsContent value="efficiency" className="mt-0">
            <div className="py-4">
              {viewedTabs.has("efficiency") ? (
                <ChartEfficiencyMetrics
                  ratios={{
                    ae: ratios?.ae as number | undefined,
                    fae: ratios?.fae as number | undefined,
                    dso: ratios?.dso as number | undefined,
                    dpo: ratios?.dpo as number | undefined,
                    ccc: ratios?.ccc as string | null | undefined,
                  }}
                  statements={statements}
                  loading={loading}
                />
              ) : (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Skeleton className="h-[400px] w-full" />
                  <p className="text-sm text-muted-foreground">Loading efficiency data...</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 5: Leverage - Lazy Loaded */}
          <TabsContent value="leverage" className="mt-0">
            <div className="py-4">
              {viewedTabs.has("leverage") ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Leverage Analysis</CardTitle>
                    <CardDescription>
                      Debt-to-Equity ratio compared with industry median
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartLeverageGauge
                      companyDE={ratios?.de as number | undefined}
                      industryDE={industryBenchmark?.benchmarks?.de_ratio?.median}
                      loading={loading}
                    />
                  </CardContent>
                </Card>
              ) : (
                <div className="py-12 flex flex-col items-center gap-4">
                  <Skeleton className="h-[400px] w-full" />
                  <p className="text-sm text-muted-foreground">Loading leverage data...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
