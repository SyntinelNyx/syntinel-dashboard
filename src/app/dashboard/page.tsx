import { TelemetryChart } from "@/components/TelemetryChart";
import UserGrid from "@/components/UserGrid";
import { VulnerabilityChart } from "@/components/VulnerabilityChart";

export default function OverviewPage() {
  return (
    <div className="flex w-full flex-col items-center justify-center space-y-3 p-12">
      <TelemetryChart />
      <div className="flex space-x-3">
        <div className="flex-1" style={{ flex: "0 0 40%" }}>
          <VulnerabilityChart />
        </div>
        <div className="flex-1" style={{ flex: "0 0 60%" }}>
          <UserGrid />
        </div>
      </div>
    </div>
  );
}
