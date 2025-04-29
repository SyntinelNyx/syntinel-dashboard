"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import {
  CalendarIcon,
  FileIcon,
  TerminalIcon,
  UserIcon,
  UploadIcon,
  PlayIcon,
  XIcon,
  ServerIcon,
  MoveIcon,
} from "lucide-react"
import Cookies from "js-cookie";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-fetch";

type Action = {
  actionId: string;
  actionName: string;
  actionType: string;
  actionPayload: string;
  actionNote: string;
  createdBy: string;
  createdAt: string;
}

type Asset = {
  assetId: string;
  hostname: string;
};

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [open, setOpen] = useState<boolean>(false)
  const [formData, setFormData] = useState<Partial<Action>>({
    actionType: "command",
    createdBy: "undefined",
  })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState<boolean>(true);

  const [workflowOpen, setWorkflowOpen] = useState<boolean>(false)
  const [workflowAssets, setWorkflowAssets] = useState<Asset[]>([]);
  const [selectedActions, setSelectedActions] = useState<Action[]>([])
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([])

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleActionTypeChange = (value: string) => {
    setFormData({
      ...formData,
      actionType: value,
      actionPayload: ""
    })
    if (value !== "file") {
      setSelectedFile(null)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        setSelectedFile(file)
        setFormData({
          ...formData,
          actionPayload: file.name,
        })
      }
    },
    [formData],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setFormData({
        ...formData,
        actionPayload: file.name,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let response;

      if (formData.actionType === "command") {
        const csrfToken = Cookies.get("csrf_token");

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }

        response = await apiFetch("/action/create", {
          method: "POST",
          headers,
          body: JSON.stringify({
            actionName: formData.actionName,
            actionType: "command",
            actionPayload: formData.actionPayload,
            actionNote: formData.actionNote,
          }),
        });
      } else if (formData.actionType === "file" && selectedFile) {
        const form = new FormData();
        form.append("actionName", formData.actionName ?? "")
        form.append("actionType", "file");
        form.append("actionPayload", selectedFile);
        form.append("actionNote", formData.actionNote ?? "")

        response = await apiFetch("/action/create", {
          method: "POST",
          body: form,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: "Missing required fields.",
        });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast({
        title: "Action Created Successfully!",
        description: "Your action has been saved.",
      });

      setFormData({
        actionType: "command",
        createdBy: "Current User",
      });
      setSelectedFile(null);
      setOpen(false);
      window.location.replace("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create action",
        description: (error instanceof Error ? error.message : "Unknown error"),
      });
    }
  };

  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      actions: selectedActions.map(action => ({ actionId: action.actionId })),
      assets: selectedAssets.map(asset => ({ assetId: asset.assetId })),
    };

    try {
      const response = await apiFetch("/action/run", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast({
        title: "Workflow Ran Successfully!",
        description: "Your workflow has been ran successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed running workflow",
        description: (error instanceof Error ? error.message : "Unknown error"),
      });
    }

    setSelectedActions([])
    setSelectedAssets([])
    setWorkflowOpen(false)
  }

  const toggleActionSelection = (action: Action) => {
    if (selectedActions.some((a) => a.actionId === action.actionId)) {
      setSelectedActions(selectedActions.filter((a) => a.actionId !== action.actionId))
    } else {
      setSelectedActions([...selectedActions, action])
    }
  }

  const toggleAssetSelection = (asset: Asset) => {
    if (selectedAssets.some((a) => a.assetId === asset.assetId)) {
      setSelectedAssets(selectedAssets.filter((a) => a.assetId !== asset.assetId))
    } else {
      setSelectedAssets([...selectedAssets, asset])
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setSelectedActions((items) => {
        const oldIndex = items.findIndex((item) => item.actionId === active.id)
        const newIndex = items.findIndex((item) => item.actionId === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSortableContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [actionsRes, assetsRes] = await Promise.all([
          apiFetch("/action/retrieve"),
          apiFetch("/assets/min"),
        ]);
        const actionsJson = await actionsRes.json();
        const assetsJson = await assetsRes.json();
        setActions(actionsJson);
        setWorkflowAssets(assetsJson);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to Load Data",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  return (
    <TooltipProvider>
      <main className="flex min-h-screen w-full flex-col p-4">
        <div className="flex justify-between items-center my-6">
          <h1 className="text-2xl font-bold">Actions</h1>
          <div>
            {actions && actions.length > 0 && (
              <Dialog open={workflowOpen} onOpenChange={setWorkflowOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="mx-1">
                    Run Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                  <form onSubmit={handleWorkflowSubmit}>
                    <DialogHeader>
                      <DialogTitle>Create and Run Workflow</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label className="text-base">Select Actions</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Select actions and drag to reorder them in your workflow
                        </p>

                        <div className="grid grid-cols-1 gap-2 mb-4">
                          {actions.length > 0 ? (
                            actions.map((action) => (
                              <div
                                key={action.actionId}
                                className={cn(
                                  "flex items-center space-x-2 border rounded-md p-2",
                                  selectedActions.some((a) => a.actionId === action.actionId) ? "border-primary bg-primary/5" : "",
                                )}
                              >
                                <Checkbox
                                  checked={selectedActions.some((a) => a.actionId === action.actionId)}
                                  onCheckedChange={() => toggleActionSelection(action)}
                                  id={`action-${action.actionId}`}
                                />
                                <Label
                                  htmlFor={`action-${action.actionId}`}
                                  className="flex-1 flex items-center cursor-pointer"
                                >
                                  {action.actionType === "command" ? (
                                    <TerminalIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  ) : (
                                    <FileIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                                  )}
                                  {action.actionName}
                                </Label>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-4 text-muted-foreground">
                              No actions available. Create some actions first.
                            </div>
                          )}
                        </div>

                        {selectedActions.length > 0 && (
                          <>
                            <Label className="text-base">Workflow Order</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              Drag and drop to reorder actions in your workflow
                            </p>

                            <div className="border rounded-md p-2 bg-muted/30" onClick={handleSortableContainerClick}>
                              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext
                                  items={selectedActions.map((a) => a.actionId)}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {selectedActions.map((action, index) => (
                                    <SortableItem
                                      key={action.actionId}
                                      action={action}
                                      index={index}
                                      onRemove={() => toggleActionSelection(action)}
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                          </>
                        )}
                      </div>

                      <Separator />

                      <div className="grid gap-2">
                        <Label className="text-base">Select Assets</Label>
                        <p className="text-sm text-muted-foreground mb-2">Choose assets to run the workflow on</p>

                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          <div className="grid grid-cols-1 gap-2">
                            {workflowAssets.map((asset) => (
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

                        {selectedAssets.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedAssets.map((asset) => (
                              <Badge key={asset.assetId} variant="secondary" className="flex items-center gap-1">
                                <ServerIcon className="h-3 w-3" />
                                <span>{asset.hostname}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 ml-1 p-0"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    toggleAssetSelection(asset)
                                  }}
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={selectedActions.length === 0 || selectedAssets.length === 0}>
                        Run Workflow
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="mx-1">Create Action</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Action</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="actionName">Action Name</Label>
                      <Input
                        id="actionName"
                        name="actionName"
                        value={formData.actionName || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Action Type</Label>
                      <RadioGroup
                        value={formData.actionType}
                        onValueChange={handleActionTypeChange}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="command" id="command" />
                          <Label htmlFor="command" className="flex items-center gap-1">
                            <TerminalIcon className="h-4 w-4" />
                            Command
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="file" id="file" />
                          <Label htmlFor="file" className="flex items-center gap-1">
                            <FileIcon className="h-4 w-4" />
                            File
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.actionType === "command" && (
                      <div className="grid gap-2">
                        <Label htmlFor="actionPayload">Command</Label>
                        <Input
                          id="actionPayload"
                          name="actionPayload"
                          value={formData.actionPayload || ""}
                          onChange={handleInputChange}
                          placeholder="Enter command"
                        />
                      </div>
                    )}
                    {formData.actionType === "file" && (
                      <div className="grid gap-2">
                        <Label>File</Label>
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer",
                            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                            selectedFile ? "bg-muted/50" : "",
                          )}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />

                          {selectedFile ? (
                            <>
                              <FileIcon className="h-10 w-10 text-muted-foreground" />
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedFile(null)
                                  setFormData({
                                    ...formData,
                                    actionPayload: undefined,
                                  })
                                }}
                              >
                                Change File
                              </Button>
                            </>
                          ) : (
                            <>
                              <UploadIcon className="h-10 w-10 text-muted-foreground" />
                              <p className="text-sm font-medium">Drag & drop a file here or click to browse</p>
                              <p className="text-xs text-muted-foreground">Upload a file to attach to this action</p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="actionNote">Note</Label>
                      <Textarea
                        id="actionNote"
                        name="actionNote"
                        value={formData.actionNote || ""}
                        onChange={handleInputChange}
                        placeholder="Add a note about this action"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save Action</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-muted-foreground text-lg animate-pulse">
              Loading actions...
            </div>
          </div>
        ) : !actions || actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No actions created yet</p>
            <p className="text-sm">Click the Create Action button to add one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{action.actionName}</span>
                    {action.actionType === "command" ? (
                      <TerminalIcon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserIcon className="h-3 w-3" />
                    {action.createdBy} •
                    <CalendarIcon className="h-3 w-3 ml-1" />
                    {action.createdAt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {action.actionType === "command" && action.actionPayload && (
                    <div className="mb-2">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {action.actionPayload}
                      </code>
                    </div>
                  )}
                  {action.actionType === "file" && action.actionPayload && (
                    <div className="mb-2 flex items-center gap-2">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{action.actionPayload}</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{action.actionNote}</p>
                </CardContent>
                <div className="absolute bottom-3 right-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            toast({
                              title: "Action Ran Successful!",
                              description: "Action ran on all assets from the previous scan",
                            });
                          }}
                        >
                          <PlayIcon className="h-4 w-4" />
                          <span className="sr-only">Run action on last scanned assets</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run action on last scanned assets</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </TooltipProvider >
  )
}

function SortableItem({ action, index, onRemove }: { action: Action; index: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.actionId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  const handleDragHandleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between bg-background border rounded-md p-2 mb-2",
        isDragging ? "shadow-lg border-primary opacity-80" : "",
      )}
      {...attributes}
    >
      <div className="flex items-center">
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-muted mr-2">{index + 1}</span>
        <span>{action.actionName}</span>
      </div>
      <div className="flex items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab hover:bg-muted rounded-md"
          onClick={handleDragHandleClick}
          {...listeners}
        >
          <MoveIcon className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Drag to reorder</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRemoveClick}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
