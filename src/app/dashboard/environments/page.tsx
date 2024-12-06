import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function EnvironmentsPage() {
  const environments = [
    { name: "Staging", description: "Testing environment for developers." },
    {
      name: "Pre-Production",
      description: "Environment for final validation before release.",
    },
    { name: "Production", description: "Live environment for end-users." },
  ];

  return (
    <div className="flex flex-row items-center justify-center gap-4 p-6">
      {environments.map((env, index) => (
        <div key={env.name} className="flex items-center">
          <Card className="w-64">
            <CardHeader>
              <CardTitle>{env.name}</CardTitle>
            </CardHeader>
            <CardContent>{env.description}</CardContent>
          </Card>

          {index < environments.length - 1 && (
            <ArrowRight className="mx-4 text-gray-500" size={24} />
          )}
        </div>
      ))}
    </div>
  );
}
