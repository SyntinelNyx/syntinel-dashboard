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
        console.error('Error fetching snapshots:', error);
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