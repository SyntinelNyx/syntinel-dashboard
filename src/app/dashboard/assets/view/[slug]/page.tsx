"use client";
// import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// import { apiFetch } from "@/lib/api-fetch";
// import { useToast } from "@/hooks/use-toast";

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
  // const { toast } = useToast();
  const asset = fakeAsset;

  // const [asset, setAsset] = useState<AssetDetails | null>(null);
  //
  // useEffect(() => {
  //   async function fetchAssets() {
  //     try {
  //       const res = await apiFetch(`/assets/${slug}`);
  //       const json = await res.json();
  //
  //       setAsset(json);
  //     } catch (error) {
  //       const errorMessage =
  //         error instanceof Error
  //           ? error.message
  //           : "An Unknown Error Has Occurred";
  //
  //       toast({
  //         variant: "destructive",
  //         title: "Asset Detail Fetch Failed",
  //         description: errorMessage,
  //       });
  //     }
  //   }
  //
  //   fetchAssets();
  // }, [toast]);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-8">
      <div className="mb-6">
        <Link href="/dashboard/assets" className="flex items-center text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assets
        </Link>
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

const fakeAsset: AssetDetails = {
  assetId: "c2b77f00-6b4c-4f42-94bb-83c32c1e8372",
  ipAddress: "192.168.1.45",
  sysinfoId: "f6a2c11a-6e2d-4097-96c2-9bfa5b3d4e7f",
  rootAccountId: "bce4d9d9-913b-4be8-9885-bf27b4c7797f",
  registeredAt: "sometimes today",
  systemInformation: {
    hostname: "server-prod-01",
    uptime: 123456,
    bootTime: 1714141414,
    procs: 230,
    os: "Ubuntu",
    platform: "linux",
    platformFamily: "debian",
    platformVersion: "24.04",
    kernelVersion: "6.5.0-27-generic",
    kernelArch: "x86_64",
    virtualizationSystem: "kvm",
    virtualizationRole: "host",
    hostId: "a1b2c3d4e5f67890",
    cpuVendorId: "GenuineIntel",
    cpuCores: 8,
    cpuModelName: "Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz",
    cpuMhz: 3600.00,
    cpuCacheSize: 12288,
    memory: 34359738368, // 32 GB
    disk: 68719476736,   // 64 GB
    createdAt: "sometime today",
  },
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-semibold text-muted-foreground">{label}</div>
      <div className="text-base font-medium break-words">{value}</div>
    </div>
  );
}

