"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, PencilIcon, ServerIcon } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

type Asset = {
  assetId: string;
  hostname: string;
};

type Environment = {
  id?: string;
  name: string;
  prevEnvId: string | null;
  nextEnvId: string | null;
  assets?: Asset[];
};

export default function EnvironmentOrchestration() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [environmentAssets, setEnvironmentAssets] = useState<Asset[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [envRes, assetRes] = await Promise.all([
          apiFetch("/env/retrieve"),
          apiFetch("/assets/min"),
        ]);

        const [envData, assetData] = await Promise.all([
          envRes.json(),
          assetRes.json(),
        ]);

        setEnvironments(envData);
        setEnvironmentAssets(assetData);
      } catch (error) {
        console.error("Failed to load environments or assets", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const [newEnvironment, setNewEnvironment] = useState<Environment>({
    name: "",
    prevEnvId: "",
    nextEnvId: "",
    assets: [],
  })

  const [open, setOpen] = useState<boolean>(false)
  const handleInputChange = (field: string, value: string) => {
    setNewEnvironment({
      ...newEnvironment,
      [field]: value,
    })
  }

  const createEnvironment = async () => {
    if (!newEnvironment.name.trim()) return;

    try {
      const payload = {
        name: newEnvironment.name,
        prevEnvId: newEnvironment.prevEnvId === "none" ? "" : newEnvironment.prevEnvId,
        nextEnvId: newEnvironment.nextEnvId === "none" ? "" : newEnvironment.nextEnvId,
      };

      const response = await apiFetch("/env/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Failed to create environment");
        return;
      }

      setNewEnvironment({ name: "", prevEnvId: "", nextEnvId: "", assets: [] });
      setOpen(false);
      window.location.replace("");
    } catch (error) {
      console.error("Error creating environment", error);
    }
  };

  return (
    <div className="container mx-10 py-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Environment Orchestration</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create New Environment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Environment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Environment Name</Label>
                <Input
                  id="name"
                  value={newEnvironment.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. QA, Production"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="previous">Previous Environment</Label>
                <Select
                  value={newEnvironment.prevEnvId ?? ""}
                  onValueChange={(value) => handleInputChange("prevEnvId", value)}
                >
                  <SelectTrigger id="previous">
                    <SelectValue placeholder="Select previous environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {environments?.map((env) => (
                      <SelectItem key={`prev-${env.id}`} value={env.id ?? ""}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="next">Next Environment</Label>
                <Select
                  value={newEnvironment.nextEnvId ?? ""}
                  onValueChange={(value) => handleInputChange("nextEnvId", value)}
                >
                  <SelectTrigger id="next">
                    <SelectValue placeholder="Select next environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {environments?.map((env) => (
                      <SelectItem key={`next-${env.id}`} value={env.id ?? ""}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={createEnvironment}>Create Environment</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Environment Flow</h2>
        {loading ? (
          <div className="text-center py-10">Loading environments...</div>
        ) : (
          environments ? (
            <EnvironmentFlow environments={environments} environmentAssets={environmentAssets} />
          ) : (
            <div className="text-center py-10">No environments available</div>
          )
        )}
      </div>
    </div>
  )
}

function EnvironmentFlow({
  environments,
  environmentAssets,
}: {
  environments: Environment[];
  environmentAssets: Asset[];
}) {
  const { toast } = useToast();
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  const startingEnvironments = environments.filter((env) => env.prevEnvId === null);

  const buildChain = (startId: string | null): Environment[] => {
    if (!startId) return [];
    const current = environments.find((env) => env.id === startId);
    if (!current) return [];
    return [current, ...buildChain(current.nextEnvId)];
  };

  const handleCardClick = (env: Environment) => {
    setSelectedEnv(env);
    setDetailsOpen(true);
  };

  const toggleAssetSelection = (asset: Asset) => {
    setSelectedAssets((prev) =>
      prev.some((a) => a.assetId === asset.assetId)
        ? prev.filter((a) => a.assetId !== asset.assetId)
        : [...prev, asset],
    );
  };

  useEffect(() => {
    if (selectedEnv && selectedEnv.assets) {
      setSelectedAssets(selectedEnv.assets);
      setEditMode(false);
    }
  }, [selectedEnv]);

  const handleSaveAssets = async () => {
    try {
      const res = await apiFetch(`/env/add-asset`, {
        method: "POST",
        body: JSON.stringify({
          environmentId: selectedEnv?.id,
          assetIds: selectedAssets.map((a) => a.assetId),
        }),
      });

      if (!res.ok) throw new Error("Failed to save assets");

      toast({ title: "Assets updated", description: "Assets for environment updated successfully" });
      setDetailsOpen(false);
      setSelectedAssets([]);
      location.reload();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error saving assets",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  return (
    <>
      <div className="p-8 rounded-lg overflow-x-auto flex justify-center">
        <div className="flex items-center min-w-max">
          {startingEnvironments.map((startEnv) => {
            const chain = buildChain(startEnv.id ?? "");
            return (
              <div key={startEnv.id} className="flex items-center">
                {chain.map((env, index) => (
                  <div key={env.id} className="flex items-center">
                    <Card
                      className="cursor-pointer hover:shadow-md transition-shadow min-w-[180px]"
                      onClick={() => handleCardClick(env)}
                    >
                      <CardContent className="p-6">
                        <h3 className="font-medium text-lg">{env.name}</h3>
                        <div className="text-sm text-muted-foreground mt-2">
                          {(env.assets ?? []).length} asset
                          {(env.assets ?? []).length !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                    </Card>
                    {index < chain.length - 1 && <ArrowRight className="mx-4 h-6 w-6" />}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedEnv?.name} Environment</DialogTitle>
          </DialogHeader>

          {selectedEnv && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{selectedEnv.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Previous:</span>
                  <span>
                    {selectedEnv.prevEnvId
                      ? environments.find((e) => e.id === selectedEnv.prevEnvId)?.name || "None"
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next:</span>
                  <span>
                    {selectedEnv.nextEnvId
                      ? environments.find((e) => e.id === selectedEnv.nextEnvId)?.name || "None"
                      : "None"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Assets:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode((prev) => !prev)}
                  className="gap-1"
                >
                  <PencilIcon className="h-3 w-3" />
                  {editMode ? "Cancel" : "Edit"}
                </Button>
              </div>

              {editMode ? (
                <>
                  <ScrollArea className="h-[200px] border rounded-md p-2">
                    <div className="grid grid-cols-1 gap-2">
                      {environmentAssets.map((asset) => (
                        <div
                          key={asset.assetId}
                          className={cn(
                            "flex items-center space-x-2 border rounded-md p-2",
                            selectedAssets.some((a) => a.assetId === asset.assetId)
                              ? "border-primary bg-primary/5"
                              : "",
                          )}
                        >
                          <Checkbox
                            checked={selectedAssets.some((a) => a.assetId === asset.assetId)}
                            onCheckedChange={() => toggleAssetSelection(asset)}
                            id={`asset-${asset.assetId}`}
                          />
                          <Label
                            htmlFor={`asset-${asset.assetId}`}
                            className="flex-1 flex items-center cursor-pointer"
                          >
                            <ServerIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{asset.hostname}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-end pt-4 gap-2">
                    <Button variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveAssets}>Save</Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedEnv.assets?.map((asset) => (
                    <Badge key={asset.assetId} variant="outline">
                      {asset.hostname}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
