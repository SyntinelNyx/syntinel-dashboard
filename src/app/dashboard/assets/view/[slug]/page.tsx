"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";
import { TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from "@/components/ui/chart";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";

export type AssetDetails = {
  assetId: string;
  ipAddress: string;
  sysinfoId: string;
  rootAccountId: string;
  registeredAt: string;
  systemInformation: {
    hostname: string;
    uptime: number;
    bootTime: number;
    procs: number;
    os: string;
    platform: string;
    platformFamily: string;
    platformVersion: string;
    kernelVersion: string;
    kernelArch: string;
    virtualizationSystem: string;
    virtualizationRole: string;
    hostId: string;
    cpuVendorId: string;
    cpuCores: number;
    cpuModelName: string;
    cpuMhz: number;
    cpuCacheSize: number;
    memory: number;
    disk: number;
    createdAt: string;
  };
};

type UtilizationData = {
  time: string;
  cpu: number;
  memory: number;
  disk: number;
};

export type TelemetryData = {
  TelemetryTime: string;
  CpuUsage: number;
  MemUsedPercent: number;
  DiskUsedPercent: number;
};

const chartConfig = {
  cpu: {
    label: "CPU Usage",
    color: "hsl(var(--chart-1))",
  },
  memory: {
    label: "Memory Usage",
    color: "hsl(var(--chart-2))",
  },
  disk: {
    label: "Disk Usage",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

export default function AssetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { toast } = useToast();
  const [asset, setAsset] = useState<AssetDetails | null>(null);
  const [utilizationData, setUtilizationData] = useState<UtilizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    async function fetchAssets() {
      try {
        const res = await apiFetch(`/assets/${slug}`);
        const json = await res.json();
        setAsset(json);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An Unknown Error Has Occurred";

        toast({
          variant: "destructive",
          title: "Asset Detail Fetch Failed",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchAssets();
  }, [slug, toast]);

  useEffect(() => {
    async function fetchUtilizationData() {
      try {
        const res = await apiFetch(`/assets/${slug}/telemetry-usage`, {
          method: "GET",
        });
        const json = await res.json();

        // Format the data for the chart
        const formattedData = json.map((item: TelemetryData) => ({
          time: new Date(item.TelemetryTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          cpu: Math.round(item.CpuUsage),
          memory: Math.round(item.MemUsedPercent),
          disk: Math.round(item.DiskUsedPercent),
        }));

        setUtilizationData(formattedData);
      } catch (error) {
        // Dumy data for testing
        setUtilizationData([
          { time: "08:00", cpu: 45, memory: 30, disk: 20 },
          { time: "10:00", cpu: 65, memory: 40, disk: 22 },
          { time: "12:00", cpu: 75, memory: 55, disk: 25 },
          { time: "14:00", cpu: 85, memory: 60, disk: 28 },
          { time: "16:00", cpu: 70, memory: 45, disk: 30 },
          { time: "18:00", cpu: 55, memory: 35, disk: 32 },
        ]);

        console.error("Failed to fetch utilization data:", error);
      } finally {
        setChartLoading(false);
      }
    }

    if (slug) {
      fetchUtilizationData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-lg font-semibold">Loading asset details...</p>
      </div>
    );
  }

  if (!asset || !asset.systemInformation) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-lg font-semibold text-destructive">
          Failed to load asset details.
        </p>
      </div>
    );
  }

  // Find peak values
  const peakCpu =
    utilizationData.length > 0
      ? Math.max(...utilizationData.map((d) => d.cpu))
      : 0;

  const peakMemory =
    utilizationData.length > 0
      ? Math.max(...utilizationData.map((d) => d.memory))
      : 0;

  const peakDisk =
    utilizationData.length > 0
      ? Math.max(...utilizationData.map((d) => d.disk))
      : 0;

  // Get time range if data is available
  const timeRange =
    utilizationData.length > 0
      ? `${utilizationData[0].time} - ${utilizationData[utilizationData.length - 1].time}`
      : "No data available";

  return (
    <div className="mx-auto mt-8 max-w-6xl p-8">
      <div className="mb-6">
        <BackButton />
      </div>

      {/* Usage Analytics Chart */}
      <div className="mb-8 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>
              CPU, memory, and disk utilization over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <p>Loading utilization data...</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={utilizationData}
                  margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 10,
                  }}
                  height={350} // Increased height
                  width={900} // Explicit width
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
                                  {`${entry.name}: ${entry.value}%`}
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
                    dataKey="disk"
                    type="monotone"
                    fill="var(--color-disk)"
                    fillOpacity={0.4}
                    stroke="var(--color-disk)"
                    stackId="3"
                  />
                  <Area
                    dataKey="memory"
                    type="monotone"
                    fill="var(--color-memory)"
                    fillOpacity={0.4}
                    stroke="var(--color-memory)"
                    stackId="2"
                  />
                  <Area
                    dataKey="cpu"
                    type="monotone"
                    fill="var(--color-cpu)"
                    fillOpacity={0.4}
                    stroke="var(--color-cpu)"
                    stackId="1"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Peak Utilization: CPU {peakCpu}% | Memory {peakMemory}% | Disk{" "}
                {peakDisk}%
                <TrendingUp className="ml-2 h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Recorded today between {timeRange}
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader className="text-2xl">
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem label="Asset ID" value={slug} />
              <DetailItem label="IP Address" value={asset.ipAddress} />
              <DetailItem label="Root Account ID" value={asset.rootAccountId} />
              <DetailItem
                label="Registered At"
                value={new Date(asset.registeredAt).toLocaleString()}
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">System Information</h2>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem
                label="Hostname"
                value={asset.systemInformation.hostname}
              />
              <DetailItem
                label="Operating System"
                value={asset.systemInformation.os}
              />
              <DetailItem
                label="Platform"
                value={asset.systemInformation.platform}
              />
              <DetailItem
                label="Platform Version"
                value={asset.systemInformation.platformVersion}
              />
              <DetailItem
                label="Kernel Version"
                value={asset.systemInformation.kernelVersion}
              />
              <DetailItem
                label="Kernel Architecture"
                value={asset.systemInformation.kernelArch}
              />
              <DetailItem
                label="CPU Model"
                value={asset.systemInformation.cpuModelName}
              />
              <DetailItem
                label="CPU Cores"
                value={asset.systemInformation.cpuCores.toString()}
              />
              <DetailItem
                label="CPU MHz"
                value={asset.systemInformation.cpuMhz.toFixed(2)}
              />
              <DetailItem
                label="Memory (bytes)"
                value={asset.systemInformation.memory.toLocaleString()}
              />
              <DetailItem
                label="Disk (bytes)"
                value={asset.systemInformation.disk.toLocaleString()}
              />
              <DetailItem
                label="Uptime (seconds)"
                value={asset.systemInformation.uptime.toLocaleString()}
              />
              <DetailItem
                label="Boot Time (timestamp)"
                value={new Date(
                  asset.systemInformation.bootTime * 1000,
                ).toLocaleString()}
              />
              <DetailItem
                label="Virtualization System"
                value={asset.systemInformation.virtualizationSystem}
              />
              <DetailItem
                label="Virtualization Role"
                value={asset.systemInformation.virtualizationRole}
              />
              <DetailItem
                label="Host ID"
                value={asset.systemInformation.hostId}
              />
              <DetailItem
                label="Created At"
                value={new Date(
                  asset.systemInformation.createdAt,
                ).toLocaleString()}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="break-words text-base font-medium">{value}</div>
    </div>
  );
}
