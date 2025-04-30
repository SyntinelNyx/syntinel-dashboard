"use client";
import { useEffect } from "react";

import { TelemetryChart } from "@/components/TelemetryChart";
import { VulnerabilityChart } from "@/components/VulnerabilityChart";
import { VulnerabilitySeverityChart } from "@/components/VulnerabilitySeverityChart"

import { useToast } from "@/hooks/use-toast";

export default function OverviewPage() {
  const { toast } = useToast();

  useEffect(() => {
    const toastData = localStorage.getItem("postAuthToast");
    if (toastData) {
      const { title, description } = JSON.parse(toastData);
      toast({ title, description });
      localStorage.removeItem("postAuthToast");
    }
  }, [toast]);

  return (
    <div className="flex w-full flex-col items-center justify-center space-y-3 p-12">
      <TelemetryChart />
      <div className="flex space-x-3">
        <div className="flex-1" style={{ flex: "0 0 50%" }}>
          <VulnerabilityChart />
        </div>
        <div className="flex-1" style={{ flex: "0 0 50%" }}>
          <VulnerabilitySeverityChart trendingUp={false} />
        </div>
      </div>
    </div>
  );
}
