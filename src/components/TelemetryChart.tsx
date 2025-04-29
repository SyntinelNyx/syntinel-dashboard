"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { apiFetch } from "@/lib/api-fetch";

type UptimeData = {
  time: string;
  activeAssets: number;
  originalDate?: Date;
};

type TelemetryData = {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
};

type ChartType = "line" | "bar" | "area";
type SortBy = "month" | "week" | "day";

const chartConfig = {
  activeAssets: {
    label: "Active Assets",
    color: "hsl(var(--chart-1))",
  },
  cpu: {
    label: "CPU Usage",
    color: "hsl(var(--chart-2))",
  },
  memory: {
    label: "Memory Usage",
    color: "hsl(var(--chart-3))",
  },
  disk: {
    label: "Disk Usage",
    color: "hsl(var(--chart-4))",
  },
};

export function TelemetryChart() {
  const [chartType, setChartType] = useState<ChartType>("line");
  const [sortBy, setSortBy] = useState<SortBy>("day");
  const [UptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [TelemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAssets, setTotalAssets] = useState<number>(150);

  useEffect(() => {
    async function fetchTelemetryData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch data based on chart type
        let endpoint = "/telemetry";
        let timeframeParam = "";

        if (chartType === "line" || chartType === "bar") {
          endpoint += "-uptime";

          const response = await apiFetch(endpoint);
          const json = await response.json();

          // Get total assets value if available
          if (json.TotalAssets !== undefined) {
            setTotalAssets(json.TotalAssets);
          } else if (json[0]?.TotalAssets !== undefined) {
            setTotalAssets(json[0].TotalAssets);
          }

          // Format data for uptime charts
          const formattedData = json
            .map((item: any) => ({
              time: formatSortTimeDisplay(
                item.TelemetryTime || item.CheckTime,
                sortBy,
              ),
              activeAssets: item.AssetsUp,
              originalDate: new Date(item.TelemetryTime || item.CheckTime),
            }))
            .sort(
              (a, b) => a.originalDate!.getTime() - b.originalDate!.getTime(),
            );

          // Filter data based on the selected time range
          const now = new Date();
          const filteredData = formattedData.filter((item: UptimeData) => {
            if (!item.originalDate) return false;

            switch (sortBy) {
              case "month":
                // Include data from the current month
                return (
                  item.originalDate.getMonth() === now.getMonth() &&
                  item.originalDate.getFullYear() === now.getFullYear()
                );
              case "week":
                // Include data from the last 7 days
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return item.originalDate >= weekAgo;
              case "day":
              default:
                // Include data from the last 24 hours
                const dayAgo = new Date();
                dayAgo.setHours(now.getHours() - 24);
                return item.originalDate >= dayAgo;
            }
          });

          // Group and aggregate data based on sortBy
          const groupedData = groupDataBySortOption(filteredData, sortBy);

          setUptimeData(groupedData);
        } else if (chartType === "area") {
          endpoint += "-usage-all";

          const response = await apiFetch(endpoint);
          const json = await response.json();

          // Format data for usage charts
          const formattedData = json.map((item: any) => ({
            time: formatTimeDisplay(item.TelemetryTime || item.Hour),
            cpu: Math.round(item.CpuUsage),
            memory: Math.round(item.MemUsedPercent),
            disk: Math.round(item.DiskUsedPercent),
          }));

          setTelemetryData(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch telemetry data:", error);
        setError(
          error instanceof Error ? error.message : "Unknown error occurred",
        );

        // Fallback to mock data on error
        if (chartType === "line" || chartType === "bar") {
          const now = new Date();
          const mockData = [
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 124,
              originalDate: new Date(new Date(now).setHours(0, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 122,
              originalDate: new Date(new Date(now).setHours(4, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 130,
              originalDate: new Date(new Date(now).setHours(8, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 142,
              originalDate: new Date(new Date(now).setHours(12, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 145,
              originalDate: new Date(new Date(now).setHours(16, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 148,
              originalDate: new Date(new Date(now).setHours(20, 0, 0, 0)),
            },
            {
              time: formatSortTimeDisplay(now.toISOString(), sortBy),
              activeAssets: 140,
              originalDate: new Date(new Date(now).setHours(23, 59, 0, 0)),
            },
          ];
        } else {
          setTelemetryData([
            { time: "00:00", cpu: 45, memory: 30, disk: 20 },
            { time: "04:00", cpu: 65, memory: 40, disk: 22 },
            { time: "08:00", cpu: 75, memory: 55, disk: 25 },
            { time: "12:00", cpu: 85, memory: 60, disk: 28 },
            { time: "16:00", cpu: 70, memory: 45, disk: 30 },
            { time: "20:00", cpu: 55, memory: 35, disk: 32 },
            { time: "24:00", cpu: 45, memory: 30, disk: 25 },
          ]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTelemetryData();
  }, [chartType, sortBy]); // Re-fetch when chart type changes

  const formatTimeDisplay = (timeString: string): string => {
    try {
      // Handle ISO format: "2025-04-29T00:00:00-07:00"
      const date = new Date(timeString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }

      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.warn(`Could not parse date: ${timeString}`, e);
      return timeString; // Return original if parsing fails
    }
  };

  const formatSortTimeDisplay = (
    timeString: string,
    sortOption: SortBy,
  ): string => {
    try {
      const date = new Date(timeString);

      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }

      switch (sortOption) {
        case "month":
          // For month view, show day of month (Apr 15)
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        case "week":
          // For week view, show day of week (Mon, Tue, etc.)
          return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        case "day":
        default:
          // For day view, show hour (12 AM, 1 PM, etc.)
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          });
      }
    } catch (e) {
      console.warn(`Could not parse date: ${timeString}`, e);
      return timeString;
    }
  };

  // Function to group data by the selected sort option
  const groupDataBySortOption = (
    data: UptimeData[],
    sortOption: SortBy,
  ): UptimeData[] => {
    if (!data.length) return [];

    const groupedMap = new Map<
      string,
      { count: number; totalAssets: number; date: Date }
    >();

    // Group data points
    data.forEach((item) => {
      if (!item.originalDate) return;

      let key: string;
      const date = item.originalDate;

      switch (sortOption) {
        case "month":
          // For month view, group by day in that month (YYYY-MM-DD)
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "week":
          // For week view, group by day (YYYY-MM-DD) for the past 7 days
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "day":
        default:
          // For day view, group by hour (YYYY-MM-DD HH) for the past 24 hours
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}`;
          break;
      }

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          count: 0,
          totalAssets: 0,
          date: new Date(date), // Store a reference date for this group
        });
      }

      const group = groupedMap.get(key)!;
      group.count++;
      group.totalAssets += item.activeAssets;
    });

    // Convert grouped data to array
    const result = Array.from(groupedMap.entries()).map(([key, value]) => ({
      time: formatSortTimeDisplay(value.date.toISOString(), sortBy),
      activeAssets: Math.round(value.totalAssets / value.count), // Average active assets
      originalDate: value.date,
    }));

    // Sort by date
    return result.sort(
      (a, b) => a.originalDate!.getTime() - b.originalDate!.getTime(),
    );
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex h-[350px] items-center justify-center">
          <p className="text-muted-foreground">Loading chart data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-[350px] flex-col items-center justify-center">
          <p className="font-medium text-destructive">Error loading data</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => {
              setLoading(true);
              setError(null);
              // Re-trigger useEffect by creating a new reference
              setChartType((prev) => prev);
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (chartType) {
      case "line":
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              data={UptimeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{ value: "Time", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Active Assets",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[0, totalAssets || "auto"]}
              />
              <ChartTooltip />
              <Line
                type="monotone"
                dataKey="activeAssets"
                stroke="var(--color-activeAssets)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        );

      case "bar":
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart
              data={UptimeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{ value: "Time", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{
                  value: "Active Assets",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ChartTooltip />
              <Bar
                dataKey="activeAssets"
                fill="var(--color-activeAssets)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        );

      case "area":
        return (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={TelemetryData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{
                  value: "Telemetry Time",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                label={{
                  value: "Usage (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
                domain={[0, 100]}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-md border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{`Time: ${label}`}</p>
                        {payload.map((entry, index) => (
                          <div
                            key={`item-${index}`}
                            className="mt-1 flex items-center gap-2"
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <p style={{ color: entry.color }}>
                              {`${entry.name}: ${entry.value}${entry.name === "activeAssets" ? "" : "%"}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="disk"
                fill="var(--color-disk)"
                fillOpacity={0.4}
                stroke="var(--color-disk)"
                stackId="3"
              />
              <Area
                type="monotone"
                dataKey="memory"
                fill="var(--color-memory)"
                fillOpacity={0.4}
                stroke="var(--color-memory)"
                stackId="2"
              />
              <Area
                type="monotone"
                dataKey="cpu"
                fill="var(--color-cpu)"
                fillOpacity={0.4}
                stroke="var(--color-cpu)"
                stackId="1"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>System Telemetry</CardTitle>
          <CardDescription>
            {chartType === "area"
              ? "Resource utilization across all assets"
              : "Active assets over time"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {(chartType === "line" || chartType === "bar") && (
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortBy)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="day">By Day</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select
            value={chartType}
            onValueChange={(value) => setChartType(value as ChartType)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Telemetry Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2">
        <div className="h-[350px]">{renderChart()}</div>
      </CardContent>
    </Card>
  );
}
