"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import api from "@/lib/api/facade";
import type {
  FundListing,
  FundSearch,
  FundNavReport,
  FundTopHolding,
  FundIndustryHolding,
  FundAssetHolding
} from "@/lib/api/facade";

interface FundsSectionProps {
  loading?: boolean;
}

export function FundsSection({ loading: externalLoading = false }: FundsSectionProps) {
  const [funds, setFunds] = useState<FundListing[]>([]);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [fundDetails, setFundDetails] = useState<{
    navReport: FundNavReport[];
    topHoldings: FundTopHolding[];
    industryAllocation: FundIndustryHolding[];
    assetAllocation: FundAssetHolding[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadFunds();
  }, [filterType]);

  const loadFunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.funds.getListing(filterType);
      setFunds(data.slice(0, 10)); // Show top 10 funds for market page
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load funds");
    } finally {
      setLoading(false);
    }
  };

  const loadFundDetails = async (symbol: string) => {
    setDetailsLoading(true);
    try {
      const [navReport, topHoldings, industryAllocation, assetAllocation] = await Promise.all([
        api.funds.getNavReport(symbol),
        api.funds.getTopHoldings(symbol),
        api.funds.getIndustryAllocation(symbol),
        api.funds.getAssetAllocation(symbol),
      ]);

      setFundDetails({
        navReport: navReport.slice(0, 30), // Show recent 30 days
        topHoldings,
        industryAllocation,
        assetAllocation,
      });
    } catch (err) {
      console.error("Failed to load fund details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleFundSelect = (symbol: string) => {
    setSelectedFund(symbol);
    loadFundDetails(symbol);
  };

  const getFundTypeBadgeVariant = (fundType: string) => {
    switch (fundType.toLowerCase()) {
      case "stock":
      case "quỹ cổ phiếu":
        return "default";
      case "bond":
      case "quỹ trái phiếu":
        return "secondary";
      case "balanced":
      case "quỹ cân bằng":
        return "outline";
      default:
        return "secondary";
    }
  };

  const formatFundType = (fundType: string) => {
    if (fundType.toLowerCase().includes("stock") || fundType.toLowerCase().includes("cổ phiếu")) {
      return "Stock";
    } else if (fundType.toLowerCase().includes("bond") || fundType.toLowerCase().includes("trái phiếu")) {
      return "Bond";
    } else if (fundType.toLowerCase().includes("balanced") || fundType.toLowerCase().includes("cân bằng")) {
      return "Balanced";
    }
    return fundType;
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | null | undefined) => {
    if (!value) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  if (externalLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vietnamese Mutual Funds</CardTitle>
          <CardDescription>
            Top performing funds from Vietnamese markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vietnamese Mutual Funds</CardTitle>
          <CardDescription>
            Top performing funds from Vietnamese markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Vietnamese Mutual Funds</CardTitle>
            <CardDescription>
              Top performing funds from Vietnamese markets
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(undefined)}
            >
              All
            </Button>
            <Button
              variant={filterType === "STOCK" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("STOCK")}
            >
              Stock
            </Button>
            <Button
              variant={filterType === "BOND" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("BOND")}
            >
              Bond
            </Button>
            <Button
              variant={filterType === "BALANCED" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("BALANCED")}
            >
              Balanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fund</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">NAV</TableHead>
                <TableHead className="text-right">1M Change</TableHead>
                <TableHead className="text-right">12M Change</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funds.map((fund) => (
                <TableRow key={fund.fund_id_fmarket} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{fund.short_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getFundTypeBadgeVariant(fund.fund_type)}>
                      {formatFundType(fund.fund_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(fund.nav)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={fund.nav_change_1m && fund.nav_change_1m > 0 ? "text-green-600" : fund.nav_change_1m && fund.nav_change_1m < 0 ? "text-red-600" : ""}>
                      {formatPercentage(fund.nav_change_1m)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={fund.nav_change_12m && fund.nav_change_12m > 0 ? "text-green-600" : fund.nav_change_12m && fund.nav_change_12m < 0 ? "text-red-600" : ""}>
                      {formatPercentage(fund.nav_change_12m)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFundSelect(fund.short_name)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {selectedFund} - Fund Details
                            <Badge variant={getFundTypeBadgeVariant(fund.fund_type)}>
                              {formatFundType(fund.fund_type)}
                            </Badge>
                          </DialogTitle>
                        </DialogHeader>

                        {detailsLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-8 w-48" />
                            <div className="space-y-2">
                              {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                              ))}
                            </div>
                          </div>
                        ) : fundDetails ? (
                          <Tabs defaultValue="holdings" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="holdings">Top Holdings</TabsTrigger>
                              <TabsTrigger value="industry">Industry</TabsTrigger>
                              <TabsTrigger value="assets">Assets</TabsTrigger>
                              <TabsTrigger value="nav">NAV History</TabsTrigger>
                            </TabsList>

                            <TabsContent value="holdings" className="mt-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Stock</TableHead>
                                      <TableHead>Industry</TableHead>
                                      <TableHead className="text-right">Allocation</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fundDetails.topHoldings.map((holding, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{holding.stock_code}</TableCell>
                                        <TableCell>{holding.industry}</TableCell>
                                        <TableCell className="text-right">
                                          {formatPercentage(holding.net_asset_percent)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TabsContent>

                            <TabsContent value="industry" className="mt-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Industry</TableHead>
                                      <TableHead className="text-right">Allocation</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fundDetails.industryAllocation.map((allocation, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{allocation.industry}</TableCell>
                                        <TableCell className="text-right">
                                          {formatPercentage(allocation.net_asset_percent)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TabsContent>

                            <TabsContent value="assets" className="mt-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Asset Type</TableHead>
                                      <TableHead className="text-right">Allocation</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fundDetails.assetAllocation.map((allocation, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{allocation.asset_type}</TableCell>
                                        <TableCell className="text-right">
                                          {formatPercentage(allocation.asset_percent)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TabsContent>

                            <TabsContent value="nav" className="mt-4">
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead className="text-right">NAV per Unit</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {fundDetails.navReport.slice(0, 20).map((nav, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{nav.date}</TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(nav.nav_per_unit)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div>No details available</div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {funds.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No funds found for the selected criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}