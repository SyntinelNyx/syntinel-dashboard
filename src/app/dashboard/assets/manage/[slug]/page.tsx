'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch } from '@/lib/api-fetch';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Update type for snapshot data to match the provided structure
type Snapshot = {
  id: string;
  host: string;
  path: string;
  startTime: string; // Adding this as it's used in your table
  endTime: string;
  assetId: string;
}

export default function AssetPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { toast } = useToast();
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const [commandBuffer, setCommandBuffer] = useState<string>('');


  useEffect(() => {
    // Initialize terminal
    if (typeof window !== 'undefined' && terminalRef.current) {
      // Clean up previous terminal instance if it exists
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      
      // Create new terminal
      const term = new XTerm({
        cursorBlink: true,
        fontSize: 14,
        theme: {
          background: '#1a1b26',
          foreground: '#c0caf5',
          cursor: '#c0caf5',
        }
      });

      xtermRef.current = term;
      term.open(terminalRef.current);
      term.write('Connected to asset: \x1B[1;3;32m' + slug + '\x1B[0m\r\n$ ');
      console.log('Terminal initialized for asset:', slug);
      term.onData((data) => {
        // Handle backspace
        if (data === '\x7F') {
          if (commandBuffer.length > 0) {
            term.write('\b \b'); // Erase character
            setCommandBuffer(prev => prev.substring(0, prev.length - 1));
          }
          return;
        }
        
        // Echo back input for visual feedback
        term.write(data);
        
        // If enter key is pressed, process the command
        if (data === '\r') {
          // Store command to be processed
          const command = commandBuffer.trim();

          console.log('Command entered:', command);
          
          // Clear the buffer for next command
          setCommandBuffer('');
          
          // Execute command
          if (command) {
            term.write('\r\n');
            executeCommand(command, term);
          } else {
            // Just show a new prompt for empty commands
            term.write('\r\n$ ');
          }
        } else {
          // Add to command buffer
          setCommandBuffer(prev => prev + data);
        }
      });
    }
    const executeCommand = async (command: string, term: XTerm) => {
      try {
        term.write(`Executing command: ${command}\r\n`);
        
        // Make API request to execute command on the asset
        const response = await apiFetch(`/assets/${slug}/shell`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command }),
        });
        
        if (!response.ok) {
          throw new Error(`Command failed with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Display command output
        term.write(`${result.output}\r\n`);
      } catch (error) {
        // Handle errors
        console.error('Command execution error:', error);
        term.write(`\x1B[1;3;31mError: ${error instanceof Error ? error.message : 'Unknown error'}\x1B[0m\r\n`);
      } finally {
        // Show prompt for next command
        term.write('$ ');
      }
    };

    return () => {
      // Clean up on unmount
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, [slug]);

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/assets/snapshots/${slug}`, { method: 'Get' });
        if (!response.ok) {
          throw new Error(`Failed to fetch snapshots: ${response.status}`);
        }

        const data = await response.json();
        setSnapshots(data);
      } catch (error) {
        console.error('Error fetching snapshots:', error);
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
      await apiFetch(`/assets/create-snapshots/${slug}`, { method: 'POST' });

      toast({
        title: "Success",
        description: "Snapshot created successfully",
      });
    } catch (error) {
      console.error('Error creating snapshot:', error);
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
        <Link href="/dashboard/assets" className="flex items-center text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assets
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">Asset: {slug}</h1>

      {/* Terminal Section */}
            <Card className="mb-8">
        <CardHeader>
          <CardTitle>Terminal Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden h-64 bg-[#1a1b26]">
            <div ref={terminalRef} className="h-full" />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Snapshots</h2>
          <Button
            onClick={handleCreateSnapshot}
            disabled={isCreatingSnapshot}
          >
            {isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}
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
                  <TableCell colSpan={6} className="text-center py-4">
                    No snapshots available
                  </TableCell>
                </TableRow>
              ) : (
                snapshots.map((snapshot) => (
                  <TableRow key={snapshot.id}>
                    <TableCell className="font-medium">{snapshot.id.substring(0, 8)}...</TableCell>
                    <TableCell>{snapshot.host}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{snapshot.path}</TableCell>
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
