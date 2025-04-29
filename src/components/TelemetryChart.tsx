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
};

type TelemetryData = {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
};

type ChartType = "line" | "bar" | "area";

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
  const [UptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [TelemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTelemetryData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch data based on chart type
        let endpoint = "/telemetry";

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
          const formattedData = json.map((item: any) => ({
            time: formatTimeDisplay(item.TelemetryTime || item.CheckTime),
            activeAssets: item.AssetsUp,
          }));

          setUptimeData(formattedData);
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
          setUptimeData([
            { time: "00:00", activeAssets: 124 },
            { time: "04:00", activeAssets: 122 },
            { time: "08:00", activeAssets: 130 },
            { time: "12:00", activeAssets: 142 },
            { time: "16:00", activeAssets: 145 },
            { time: "20:00", activeAssets: 148 },
            { time: "24:00", activeAssets: 140 },
          ]);
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
  }, [chartType]); // Re-fetch when chart type changes

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
                label={{ value: "Time", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: 'Active Assets', angle: -90, position: 'insideLeft' }} 
                domain={[0, totalAssets || 'auto']}
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
      </CardHeader>
      <CardContent className="px-2 pt-2">
        <div className="h-[350px]">{renderChart()}</div>
      </CardContent>
    </Card>
  );
}
