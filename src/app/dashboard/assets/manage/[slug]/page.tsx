"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, LucideToggleRight } from "lucide-react";

// Update type for snapshot data to match the provided structure
type Snapshot = {
  id: string;
  host: string;
  path: string;
  startTime: string; // Adding this as it's used in your table
  endTime: string;
  assetId: string;
};

export default function AssetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { toast } = useToast();
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);

  useEffect(() => {
    // Initialize terminal
    if (typeof window !== "undefined" && terminalRef.current) {
      // Clean up previous terminal instance if it exists
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }

      // Create new terminal
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        scrollback: 1000,
        convertEol: true,
        theme: {
          background: "#1a1b26",
          foreground: "#c0caf5",
          cursor: "#c0caf5",
        },
      });

      xtermRef.current = term;
      term.open(terminalRef.current);
      term.write("Connected to asset: \x1B[1;3;32m" + slug + "\x1B[0m\r\n$ ");
      console.log("Terminal initialized for asset:", slug);

      // Use a local variable to track input within this hook
      let localCommandBuffer = "";

      term.onData((data) => {
        if (data === "\x7F") {
          // Backspace
          if (localCommandBuffer.length > 0) {
            localCommandBuffer = localCommandBuffer.substring(
              0,
              localCommandBuffer.length - 1,
            );
            term.write("\b \b"); // Erase character
          }
          return;
        }

        // Echo back input for visual feedback
        term.write(data);

        // If enter key is pressed, process the command
        if (data === "\r" || data === "\n") {
          // Store command to be processed
          const command = localCommandBuffer.trim();

          console.log("Command entered:", command);

          // Reset buffer
          localCommandBuffer = "";

          // Execute command
          if (command) {
            // Removed redundant line causing error
            executeCommand(command, term);
          } else {
            // Just show a new prompt for empty commands
            term.write("\r\n$ ");
          }
        } else {
          // Add to command buffer (except for control characters)
          if (data.charCodeAt(0) >= 32) {
            localCommandBuffer += data;
          }
        }
      });

      const executeCommand = async (command: string, term: XTerm) => {
        try {
          // term.write(`Executing command: ${command}\r\n`);

          const response = await apiFetch(`/assets/${slug}/terminal`, {
            method: "POST",
            body: JSON.stringify({ command }),
          });

          if (!response.ok) {
            throw new Error(`Command failed with status: ${response.status}`);
          }

          const result = await response.json();

          const parsedOutput = JSON.parse(result);

          const escapedOutput = parsedOutput.result;

          const terminal = escapedOutput;
          
          console.log(terminal);
          // Use .split('\n') to properly handle newlines in the terminal
          const lines = terminal.split('\n');
          for (let i = 0; i < lines.length; i++) {
            term.write(lines[i]);
            // Add carriage return + newline for all lines except the last one
            if (i < lines.length - 1) {
              term.write('\r\n');
            }
          }
          term.write('\r\n');
          term.scrollToBottom();

          console.log(terminal);
        } catch (error) {
          // Handle errors
          console.error("Command execution error:", error);
          term.write(
            `\x1B[1;3;31mError: ${error instanceof Error ? error.message : "Unknown error"}\x1B[0m\r\n`,
          );
        } finally {
          // Show prompt for next command
          term.write("$ ");
          term.scrollToBottom();
        }
      };

      return () => {
        // Clean up on unmount
        if (xtermRef.current) {
          xtermRef.current.dispose();
        }
      };
    }
  }, [slug]);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/assets/snapshots/${slug}`, {
          method: "Get",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshots: ${response.status}`);
        }

        const data = await response.json();
        setSnapshots(data);
      } catch (error) {
        console.error("Error fetching snapshots:", error);
        toast({
          title: "Error",
          description: "Failed to load snapshots",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnapshots();
  }, [slug, toast]);

  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      // This is where you would make an API call to create a snapshot
      await apiFetch(`/assets/create-snapshots/${slug}`, { method: "POST" });

      toast({
        title: "Success",
        description: "Snapshot created successfully",
      });
    } catch (error) {
      console.error("Error creating snapshot:", error);
      toast({
        title: "Error",
        description: "Failed to create snapshot",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return "N/A";

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (isNaN(start) || isNaN(end)) return "Invalid time";

    const durationMs = end - start;
    if (durationMs < 0) return "Invalid duration";

    // Format duration in a human-readable way
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <Link
          href="/dashboard/assets"
          className="flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assets
        </Link>
      </div>
      <h1 className="mb-6 text-7xl font-bold"></h1>

      {/* Terminal Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Terminal Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-hidden rounded-md border bg-[#1a1b26]">
            <div ref={terminalRef} className="h-full" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Snapshots</h2>
          <Button onClick={handleCreateSnapshot} disabled={isCreatingSnapshot}>
            {isCreatingSnapshot ? "Creating..." : "Create Snapshot"}
          </Button>
        </div>

        {isLoading ? (
          <p>Loading snapshots...</p>
        ) : (
          <Table>
            <TableCaption>List of snapshots for this asset</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center">
                    No snapshots available
                  </TableCell>
                </TableRow>
              ) : (
                snapshots.map((snapshot) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="font-medium">
                      {snapshot.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{snapshot.host}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {snapshot.path}
                    </TableCell>
                    <TableCell>{formatDate(snapshot.startTime)}</TableCell>
                    <TableCell>{formatDate(snapshot.endTime)}</TableCell>
                    <TableCell className="text-right">
                      {calculateDuration(snapshot.startTime, snapshot.endTime)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
