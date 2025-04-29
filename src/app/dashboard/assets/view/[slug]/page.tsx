"use client";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

export default function AssetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { toast } = useToast();
  const [asset, setAsset] = useState<AssetDetails | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-lg font-semibold">Loading asset details...</p>
      </div>
    );
  }

  if (!asset || !asset.systemInformation) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-lg font-semibold text-destructive">
          Failed to load asset details.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <Card>
        <CardHeader className="text-2xl">
          <CardTitle>Asset Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Asset ID" value={slug} />
              <DetailItem label="IP Address" value={asset.ipAddress} />
              <DetailItem label="Root Account ID" value={asset.rootAccountId} />
              <DetailItem label="Registered At" value={new Date(asset.registeredAt).toLocaleString()} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold">System Information</h2>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Hostname" value={asset.systemInformation.hostname} />
              <DetailItem label="Operating System" value={asset.systemInformation.os} />
              <DetailItem label="Platform" value={asset.systemInformation.platform} />
              <DetailItem label="Platform Version" value={asset.systemInformation.platformVersion} />
              <DetailItem label="Kernel Version" value={asset.systemInformation.kernelVersion} />
              <DetailItem label="Kernel Architecture" value={asset.systemInformation.kernelArch} />
              <DetailItem label="CPU Model" value={asset.systemInformation.cpuModelName} />
              <DetailItem label="CPU Cores" value={asset.systemInformation.cpuCores.toString()} />
              <DetailItem label="CPU MHz" value={asset.systemInformation.cpuMhz.toFixed(2)} />
              <DetailItem label="Memory (bytes)" value={asset.systemInformation.memory.toLocaleString()} />
              <DetailItem label="Disk (bytes)" value={asset.systemInformation.disk.toLocaleString()} />
              <DetailItem label="Uptime (seconds)" value={asset.systemInformation.uptime.toLocaleString()} />
              <DetailItem label="Boot Time (timestamp)" value={new Date(asset.systemInformation.bootTime * 1000).toLocaleString()} />
              <DetailItem label="Virtualization System" value={asset.systemInformation.virtualizationSystem} />
              <DetailItem label="Virtualization Role" value={asset.systemInformation.virtualizationRole} />
              <DetailItem label="Host ID" value={asset.systemInformation.hostId} />
              <DetailItem label="Created At" value={new Date(asset.systemInformation.createdAt).toLocaleString()} />
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
      <div className="text-base font-medium break-words">{value}</div>
    </div>
  );
}

