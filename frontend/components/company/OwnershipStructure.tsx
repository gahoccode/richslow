"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ShareholderInfo, Subsidiary } from "@/lib/api"
import { formatPercentage } from "@/lib/formatters"
import { Building2, Users, TrendingDown } from "lucide-react"

interface OwnershipStructureProps {
  shareholders?: ShareholderInfo[];
  subsidiaries?: Subsidiary[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function OwnershipStructure({
  shareholders,
  subsidiaries,
  loading = false,
  title = "Ownership Structure",
  description = "Shareholders and subsidiaries information"
}: OwnershipStructureProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">Loading ownership data...</p>
        </CardContent>
      </Card>
    )
  }

  const hasData = (shareholders && shareholders.length > 0) || (subsidiaries && subsidiaries.length > 0);

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-muted-foreground">No ownership data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="shareholders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shareholders" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Shareholders
              {shareholders && shareholders.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {shareholders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="subsidiaries" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Subsidiaries
              {subsidiaries && subsidiaries.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {subsidiaries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shareholders" className="mt-4">
            {!shareholders || shareholders.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-sm">No shareholder data available</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {shareholders.map((shareholder, index) => {
                    // Extract fields from API response
                    const name = shareholder.share_holder;
                    const percentage = shareholder.share_own_percent;

                    return (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {name || `Shareholder ${index + 1}`}
                            </h4>
                          </div>
                          {percentage !== undefined && (
                            <Badge variant="default" className="flex-shrink-0">
                              {formatPercentage(percentage)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="subsidiaries" className="mt-4">
            {!subsidiaries || subsidiaries.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground text-sm">No subsidiary data available</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {subsidiaries.map((subsidiary, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">
                            {subsidiary.sub_company_name || `Subsidiary ${index + 1}`}
                          </h4>
                        </div>
                        {subsidiary.sub_own_percent !== undefined && (
                          <Badge variant="default" className="flex-shrink-0">
                            {formatPercentage(subsidiary.sub_own_percent)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
