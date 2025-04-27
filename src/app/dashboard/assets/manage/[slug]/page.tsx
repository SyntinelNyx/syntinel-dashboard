'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { apiFetch } from '@/lib/api-fetch';

// Update type for snapshot data to match the provided structure
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
  
  useEffect(() => {
    fetchSnapshots();
  }, [slug]);

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

  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true);
      // This is where you would make an API call to create a snapshot
      await apiFetch(`/assets/create-snapshot/${slug}`, { method: 'POST' });
      
      toast({
        title: "Success",
        description: "Snapshot created successfully",
      });
      
      // Refresh the snapshots list
      fetchSnapshots();
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


  return (
    <div className="p-4">
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
          <div className="text-gray-500">Loading snapshots...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snapshot ID</TableHead>
                <TableHead>Date Taken</TableHead>
                <TableHead>Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell>{snapshot.id}</TableCell>
                  <TableCell>{formatDate(snapshot.endTime)}</TableCell>
                  <TableCell>{snapshot.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

      </div>
    </div>
  );
}