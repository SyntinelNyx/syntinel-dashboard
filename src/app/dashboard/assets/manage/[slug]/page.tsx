"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-fetch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";

type Snapshot = {
  id: string;
  endTime: string;
  size: string
}

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
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/assets/snapshots/${slug}`, { method: 'Get' });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshots: ${response.status}`);
        }
        
        const data = await response.json();
        setSnapshots(data || []); // Ensure we always set an array
      } catch (error) {
        console.error("Error fetching snapshots:", error);
        toast({
          title: "Error",
          description: "Failed to load snapshots",
          variant: "destructive",
        });
        setSnapshots([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [slug, toast]);

  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);

      await apiFetch(`/assets/create-snapshot/${slug}`, { method: 'POST' });
      
      toast({
        title: "Success",
        description: "Snapshot created successfully",
      });
      
      const updatedSnapshots = await apiFetch(`/assets/snapshots/${slug}`, { method: 'GET' }).then(res => res.json());
      setSnapshots(updatedSnapshots || []);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (sizeInBytes: string | number) => {
    const bytes = typeof sizeInBytes === 'string' ? parseInt(sizeInBytes, 10) : sizeInBytes;
    
    if (isNaN(bytes)) return 'Unknown size';
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSnapshots = [...snapshots].sort((a, b) => {
    if (!sortConfig) return 0;

    const { key, direction } = sortConfig;
    const aValue = key === 'size' ? parseInt(a[key as keyof Snapshot] as string, 10) : new Date(a[key as keyof Snapshot] as string).getTime();
    const bValue = key === 'size' ? parseInt(b[key as keyof Snapshot] as string, 10) : new Date(b[key as keyof Snapshot] as string).getTime();

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="mx-auto mt-8 max-w-6xl p-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-2xl font-bold mb-6"></h1>

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
          <Button 
            onClick={handleCreateSnapshot} 
            disabled={isCreatingSnapshot}
          >
            {isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}
          </Button>
        </div>
        {isLoading ? (
          <div className="text-gray-500">Loading snapshots...</div>
        ) : sortedSnapshots.length === 0 ? (
          <div className="text-gray-500 py-4 text-center">
            No snapshots available. Create your first snapshot using the button above.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>Snapshot ID</TableHead> */}
                <TableHead onClick={() => handleSort('endTime')} className="cursor-pointer">
                  Date Taken {sortConfig?.key === 'endTime' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </TableHead>
                <TableHead onClick={() => handleSort('size')} className="cursor-pointer">
                  Size {sortConfig?.key === 'size' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSnapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell>{formatDate(snapshot.endTime)}</TableCell>
                  <TableCell>{formatSize(snapshot.size)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </div>
    </div>
  );
}