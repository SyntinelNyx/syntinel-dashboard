'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
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
import { BackButton } from "@/components/BackButton";

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
    <div className="mx-auto mt-8 max-w-6xl p-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <h1 className="text-2xl font-bold mb-6">Asset: {slug}</h1>

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
