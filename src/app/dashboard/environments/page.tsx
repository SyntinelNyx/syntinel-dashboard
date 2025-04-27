"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

// Define the Environment type
interface Environment {
  id: string
  name: string
  previousEnvironment: string | null
  nextEnvironment: string | null
  assets: string[]
}

export default function EnvironmentOrchestration() {
  // State for environments
  const [environments, setEnvironments] = useState<Environment[]>([
    {
      id: "dev",
      name: "Development",
      previousEnvironment: null,
      nextEnvironment: "staging",
      assets: ["ubuntu", "debian", "fedora"],
    },
    {
      id: "staging",
      name: "Staging",
      previousEnvironment: "dev",
      nextEnvironment: "preprod",
      assets: ["mizu", "ena", "kana", "mafu"],
    },
    {
      id: "preprod",
      name: "Pre-Production",
      previousEnvironment: "staging",
      nextEnvironment: "prod",
      assets: ["mizu", "ena", "kana", "mafu"],
    },

    {
      id: "prod",
      name: "Production",
      previousEnvironment: "staging",
      nextEnvironment: null,
      assets: ["gentoo", "nixos", "templeos"],
    },
  ])

  // State for the form
  const [newEnvironment, setNewEnvironment] = useState({
    name: "",
    previousEnvironment: "",
    nextEnvironment: "",
    assets: [] as string[],
  })

  // State for dialog
  const [open, setOpen] = useState(false)

  // State for managing asset input:
  const [assetInput, setAssetInput] = useState("")

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setNewEnvironment({
      ...newEnvironment,
      [field]: value,
    })
  }

  // Create a new environment
  const createEnvironment = () => {
    if (!newEnvironment.name.trim()) return

    const id = newEnvironment.name.toLowerCase().replace(/\s+/g, "-")

    // Create the new environment
    const environment: Environment = {
      id,
      name: newEnvironment.name,
      previousEnvironment: newEnvironment.previousEnvironment || null,
      nextEnvironment: newEnvironment.nextEnvironment || null,
      assets: newEnvironment.assets,
    }

    // Update the previous environment's next link
    const updatedEnvironments = environments.map((env) => {
      if (env.id === environment.previousEnvironment) {
        return { ...env, nextEnvironment: id }
      }
      return env
    })

    // Update the next environment's previous link
    const finalEnvironments = updatedEnvironments.map((env) => {
      if (env.id === environment.nextEnvironment) {
        return { ...env, previousEnvironment: id }
      }
      return env
    })

    // Add the new environment
    setEnvironments([...finalEnvironments, environment])

    // Reset form and close dialog
    setNewEnvironment({ name: "", previousEnvironment: "", nextEnvironment: "", assets: [] })
    setAssetInput("")
    setOpen(false)
  }

  const addAsset = () => {
    if (!assetInput.trim()) return
    setNewEnvironment({
      ...newEnvironment,
      assets: [...newEnvironment.assets, assetInput.trim()],
    })
    setAssetInput("")
  }

  const removeAsset = (index: number) => {
    setNewEnvironment({
      ...newEnvironment,
      assets: newEnvironment.assets.filter((_, i) => i !== index),
    })
  }

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
                  value={newEnvironment.previousEnvironment}
                  onValueChange={(value) => handleInputChange("previousEnvironment", value)}
                >
                  <SelectTrigger id="previous">
                    <SelectValue placeholder="Select previous environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {environments.map((env) => (
                      <SelectItem key={`prev-${env.id}`} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="next">Next Environment</Label>
                <Select
                  value={newEnvironment.nextEnvironment}
                  onValueChange={(value) => handleInputChange("nextEnvironment", value)}
                >
                  <SelectTrigger id="next">
                    <SelectValue placeholder="Select next environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {environments.map((env) => (
                      <SelectItem key={`next-${env.id}`} value={env.id}>
                        {env.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="assets">Assets</Label>
                <div className="flex gap-2">
                  <Input
                    id="assets"
                    value={assetInput}
                    onChange={(e) => setAssetInput(e.target.value)}
                    placeholder="Add an asset"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addAsset()
                      }
                    }}
                  />
                  <Button type="button" onClick={addAsset} variant="secondary">
                    Add
                  </Button>
                </div>
                {newEnvironment.assets.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newEnvironment.assets.map((asset, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {asset}
                        <button onClick={() => removeAsset(index)} className="ml-1 rounded-full hover:bg-muted p-1">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button onClick={createEnvironment}>Create Environment</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Environment Flow</h2>
        <EnvironmentFlow environments={environments} />
      </div>

      {/* Environment details are now shown in the popup when clicking on a card */}
    </div>
  )
}

// Component to display the environment flow
function EnvironmentFlow({ environments }: { environments: Environment[] }) {
  // State for the selected environment and dialog
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Find the starting environment (one with no previous)
  const startingEnvironments = environments.filter((env) => env.previousEnvironment === null)

  // Build the flow chain
  const buildChain = (startId: string | null): Environment[] => {
    if (!startId) return []

    const current = environments.find((env) => env.id === startId)
    if (!current) return []

    return [current, ...buildChain(current.nextEnvironment)]
  }

  // Handle card click
  const handleCardClick = (env: Environment) => {
    setSelectedEnv(env)
    setDetailsOpen(true)
  }

  return (
    <>
      <div className="p-8 rounded-lg overflow-x-auto flex justify-center">
        <div className="flex items-center min-w-max">
          {startingEnvironments.map((startEnv) => {
            const chain = buildChain(startEnv.id)

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
                          {env.assets.length} asset{env.assets.length !== 1 ? "s" : ""}
                        </div>
                      </CardContent>
                    </Card>
                    {index < chain.length - 1 && <ArrowRight className="mx-4 h-6 w-6" />}
                  </div>
                ))}
              </div>
            )
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
                    {selectedEnv.previousEnvironment
                      ? environments.find((e) => e.id === selectedEnv.previousEnvironment)?.name || "None"
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next:</span>
                  <span>
                    {selectedEnv.nextEnvironment
                      ? environments.find((e) => e.id === selectedEnv.nextEnvironment)?.name || "None"
                      : "None"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Assets:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEnv.assets.map((asset, index) => (
                    <Badge key={index} variant="outline">
                      {asset}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

