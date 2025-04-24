"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CalendarIcon, FileIcon, TerminalIcon, UserIcon } from "lucide-react"
import { format } from "date-fns"

type Action = {
  actionName: string
  actionType: "command" | "file"
  createdBy: string
  date: string
  note: string
  command?: string
}

export default function ActionsPage() {
  const [actions, setActions] = useState<Action[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Action>>({
    actionType: "command",
    createdBy: "Current User",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleActionTypeChange = (value: "command" | "file") => {
    setFormData({
      ...formData,
      actionType: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAction: Action = {
      actionName: formData.actionName || "",
      actionType: formData.actionType || "command",
      createdBy: formData.createdBy || "Current User",
      date: format(new Date(), "PPP"),
      note: formData.note || "",
      command: formData.command,
    }

    setActions([...actions, newAction])
    setFormData({
      actionType: "command",
      createdBy: "Current User",
    })
    setOpen(false)
  }

  return (
    <main className="flex min-h-screen w-full flex-col p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actions</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Action</Button>
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
                  <RadioGroup value={formData.actionType} onValueChange={handleActionTypeChange} className="flex gap-4">
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
                    <Label htmlFor="command">Command</Label>
                    <Input
                      id="command"
                      name="command"
                      value={formData.command || ""}
                      onChange={handleInputChange}
                      placeholder="Enter command"
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={formData.note || ""}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action, index) => (
          <Card key={index}>
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
                {action.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {action.actionType === "command" && action.command && (
                <div className="mb-2">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {action.command}
                  </code>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{action.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {actions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <p>No actions created yet</p>
          <p className="text-sm">Click the Create Action button to add one</p>
        </div>
      )}
    </main>
  )
}

