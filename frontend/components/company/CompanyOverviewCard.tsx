"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CompanyOverview, CompanyProfile } from "@/lib/api"
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
            <CardTitle className="text-2xl">{profile?.fullname || overview?.shortName || 'Company Overview'}</CardTitle>
            <CardDescription>{profile?.industry || overview?.industryEn || 'Company information'}</CardDescription>
          </div>
          {overview?.stockRating && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              Rating: {overview.stockRating.toFixed(1)}
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
              {profile?.exchange && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange:</span>
                  <span className="font-medium">{profile.exchange}</span>
                </div>
              )}
              {overview?.companyType && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{overview.companyType}</span>
                </div>
              )}
              {overview?.establishedYear && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {overview.establishedYear}
                  </span>
                </div>
              )}
              {overview?.icbCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ICB Code:</span>
                  <span className="font-mono text-xs">{overview.icbCode}</span>
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
              {overview?.noEmployees !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{formatNumber(overview.noEmployees)}</span>
                </div>
              )}
              {overview?.noShareholders !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shareholders:</span>
                  <span className="font-medium">{formatNumber(overview.noShareholders)}</span>
                </div>
              )}
              {overview?.noSubsidiaries !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subsidiaries:</span>
                  <span className="font-medium">{overview.noSubsidiaries}</span>
                </div>
              )}
              {overview?.foreignPercent !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Foreign Own:</span>
                  <span className="font-medium">{formatPercentage(overview.foreignPercent)}</span>
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
              {overview?.outstandingShare !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium">{formatNumber(overview.outstandingShare)}</span>
                </div>
              )}
              {overview?.issueShare !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issued:</span>
                  <span className="font-medium">{formatNumber(overview.issueShare)}</span>
                </div>
              )}
              {overview?.issueddate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium text-xs">{overview.issueddate}</span>
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
        {(overview?.deltaInWeek !== undefined || overview?.deltaInMonth !== undefined || overview?.deltaInYear !== undefined) && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">Price Performance</h4>
            <div className="flex flex-wrap gap-3">
              {getDeltaBadge(overview?.deltaInWeek, '1 Week')}
              {getDeltaBadge(overview?.deltaInMonth, '1 Month')}
              {getDeltaBadge(overview?.deltaInYear, '1 Year')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
