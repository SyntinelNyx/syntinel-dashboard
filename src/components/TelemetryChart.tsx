"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An interactive bar chart";

const chartData = [
  { date: "2024-04-01", staging: 222, production: 150 },
  { date: "2024-04-02", staging: 97, production: 180 },
  { date: "2024-04-03", staging: 167, production: 120 },
  { date: "2024-04-04", staging: 242, production: 260 },
  { date: "2024-04-05", staging: 373, production: 290 },
  { date: "2024-04-06", staging: 301, production: 340 },
  { date: "2024-04-07", staging: 245, production: 180 },
  { date: "2024-04-08", staging: 409, production: 320 },
  { date: "2024-04-09", staging: 59, production: 110 },
  { date: "2024-04-10", staging: 261, production: 190 },
  { date: "2024-04-11", staging: 327, production: 350 },
  { date: "2024-04-12", staging: 292, production: 210 },
  { date: "2024-04-13", staging: 342, production: 380 },
  { date: "2024-04-14", staging: 137, production: 220 },
  { date: "2024-04-15", staging: 120, production: 170 },
  { date: "2024-04-16", staging: 138, production: 190 },
  { date: "2024-04-17", staging: 446, production: 360 },
  { date: "2024-04-18", staging: 364, production: 410 },
  { date: "2024-04-19", staging: 243, production: 180 },
  { date: "2024-04-20", staging: 89, production: 150 },
  { date: "2024-04-21", staging: 137, production: 200 },
  { date: "2024-04-22", staging: 224, production: 170 },
  { date: "2024-04-23", staging: 138, production: 230 },
  { date: "2024-04-24", staging: 387, production: 290 },
  { date: "2024-04-25", staging: 215, production: 250 },
  { date: "2024-04-26", staging: 75, production: 130 },
  { date: "2024-04-27", staging: 383, production: 420 },
  { date: "2024-04-28", staging: 122, production: 180 },
  { date: "2024-04-29", staging: 315, production: 240 },
  { date: "2024-04-30", staging: 454, production: 380 },
  { date: "2024-05-01", staging: 165, production: 220 },
  { date: "2024-05-02", staging: 293, production: 310 },
  { date: "2024-05-03", staging: 247, production: 190 },
  { date: "2024-05-04", staging: 385, production: 420 },
  { date: "2024-05-05", staging: 481, production: 390 },
  { date: "2024-05-06", staging: 498, production: 520 },
  { date: "2024-05-07", staging: 388, production: 300 },
  { date: "2024-05-08", staging: 149, production: 210 },
  { date: "2024-05-09", staging: 227, production: 180 },
  { date: "2024-05-10", staging: 293, production: 330 },
  { date: "2024-05-11", staging: 335, production: 270 },
  { date: "2024-05-12", staging: 197, production: 240 },
  { date: "2024-05-13", staging: 197, production: 160 },
  { date: "2024-05-14", staging: 448, production: 490 },
  { date: "2024-05-15", staging: 473, production: 380 },
  { date: "2024-05-16", staging: 338, production: 400 },
  { date: "2024-05-17", staging: 499, production: 420 },
  { date: "2024-05-18", staging: 315, production: 350 },
  { date: "2024-05-19", staging: 235, production: 180 },
  { date: "2024-05-20", staging: 177, production: 230 },
  { date: "2024-05-21", staging: 82, production: 140 },
  { date: "2024-05-22", staging: 81, production: 120 },
  { date: "2024-05-23", staging: 252, production: 290 },
  { date: "2024-05-24", staging: 294, production: 220 },
  { date: "2024-05-25", staging: 201, production: 250 },
  { date: "2024-05-26", staging: 213, production: 170 },
  { date: "2024-05-27", staging: 420, production: 460 },
  { date: "2024-05-28", staging: 233, production: 190 },
  { date: "2024-05-29", staging: 78, production: 130 },
  { date: "2024-05-30", staging: 340, production: 280 },
  { date: "2024-05-31", staging: 178, production: 230 },
  { date: "2024-06-01", staging: 178, production: 200 },
  { date: "2024-06-02", staging: 470, production: 410 },
  { date: "2024-06-03", staging: 103, production: 160 },
  { date: "2024-06-04", staging: 439, production: 380 },
  { date: "2024-06-05", staging: 88, production: 140 },
  { date: "2024-06-06", staging: 294, production: 250 },
  { date: "2024-06-07", staging: 323, production: 370 },
  { date: "2024-06-08", staging: 385, production: 320 },
  { date: "2024-06-09", staging: 438, production: 480 },
  { date: "2024-06-10", staging: 155, production: 200 },
  { date: "2024-06-11", staging: 92, production: 150 },
  { date: "2024-06-12", staging: 492, production: 420 },
  { date: "2024-06-13", staging: 81, production: 130 },
  { date: "2024-06-14", staging: 426, production: 380 },
  { date: "2024-06-15", staging: 307, production: 350 },
  { date: "2024-06-16", staging: 371, production: 310 },
  { date: "2024-06-17", staging: 475, production: 520 },
  { date: "2024-06-18", staging: 107, production: 170 },
  { date: "2024-06-19", staging: 341, production: 290 },
  { date: "2024-06-20", staging: 408, production: 450 },
  { date: "2024-06-21", staging: 169, production: 210 },
  { date: "2024-06-22", staging: 317, production: 270 },
  { date: "2024-06-23", staging: 480, production: 530 },
  { date: "2024-06-24", staging: 132, production: 180 },
  { date: "2024-06-25", staging: 141, production: 190 },
  { date: "2024-06-26", staging: 434, production: 380 },
  { date: "2024-06-27", staging: 448, production: 490 },
  { date: "2024-06-28", staging: 149, production: 200 },
  { date: "2024-06-29", staging: 103, production: 160 },
  { date: "2024-06-30", staging: 446, production: 400 },
];

const chartConfig = {
  uptime: {
    label: "Uptime",
  },
  staging: {
    label: "Staging",
    color: "hsl(var(--chart-1))",
  },
  production: {
    label: "Production",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TelemetryChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("staging");

  const total = React.useMemo(
    () => ({
      staging: chartData.reduce((acc, curr) => acc + curr.staging, 0),
      production: chartData.reduce((acc, curr) => acc + curr.production, 0),
    }),
    [],
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Asset Uptime</CardTitle>
          <CardDescription>
            Showing uptime of assets for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["staging", "production"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}min
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
