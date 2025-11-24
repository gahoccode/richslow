"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CompanyOverview, CompanyProfile } from "@/lib/api/facade"
import { formatNumber, formatPercentage } from "@/lib/formatters"
import { Building2, Users, Globe, Calendar, TrendingUp, TrendingDown } from "lucide-react"

interface CompanyOverviewCardProps {
  overview?: CompanyOverview;
  profile?: CompanyProfile;
  loading?: boolean;
}

export function CompanyOverviewCard({ overview, profile, loading = false }: CompanyOverviewCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
          <CardDescription>Loading company information...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (!overview && !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Overview</CardTitle>
          <CardDescription>Company information</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No company data available</p>
        </CardContent>
      </Card>
    )
  }

  const getDeltaBadge = (delta: number | undefined, label: string) => {
    if (delta === undefined || delta === null) return null;
    const isPositive = delta >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {formatPercentage(Math.abs(delta))}
        </Badge>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{profile?.company_name || overview?.short_name || 'Company Overview'}</CardTitle>
            <CardDescription>{overview?.industry || 'Company information'}</CardDescription>
          </div>
          {overview?.stock_rating && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              Rating: {overview.stock_rating.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="space-y-2 text-sm">
              {overview?.exchange && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange:</span>
                  <span className="font-medium">{overview.exchange}</span>
                </div>
              )}
              {overview?.company_type && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{overview.company_type}</span>
                </div>
              )}
              {overview?.established_year && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {overview.established_year}
                  </span>
                </div>
              )}
              {overview?.industry_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industry ID:</span>
                  <span className="font-mono text-xs">{overview.industry_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* People & Structure */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              People & Structure
            </h4>
            <div className="space-y-2 text-sm">
              {overview?.no_employees !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{formatNumber(overview.no_employees)}</span>
                </div>
              )}
              {overview?.no_shareholders !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shareholders:</span>
                  <span className="font-medium">{formatNumber(overview.no_shareholders)}</span>
                </div>
              )}
              {overview?.foreign_percent !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Foreign Own:</span>
                  <span className="font-medium">{formatPercentage(overview.foreign_percent)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shares & Website */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Shares & Links
            </h4>
            <div className="space-y-2 text-sm">
              {overview?.outstanding_share !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium">{formatNumber(overview.outstanding_share)}</span>
                </div>
              )}
              {overview?.issue_share !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="font-medium">{formatNumber(overview.issue_share)}</span>
                </div>
              )}
              {overview?.website && (
                <div className="pt-1">
                  <a
                    href={overview.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                  >
                    <Globe className="h-3 w-3" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Badges */}
        {(overview?.delta_in_week !== undefined || overview?.delta_in_month !== undefined || overview?.delta_in_year !== undefined) && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Price Performance</h4>
            <div className="flex flex-wrap gap-3">
              {getDeltaBadge(overview?.delta_in_week, '1 Week')}
              {getDeltaBadge(overview?.delta_in_month, '1 Month')}
              {getDeltaBadge(overview?.delta_in_year, '1 Year')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
