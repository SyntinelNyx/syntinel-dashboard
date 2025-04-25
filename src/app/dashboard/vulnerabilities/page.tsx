"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { apiFetch } from "@/lib/api-fetch"
import { useToast } from "@/hooks/use-toast";

type Vulnerability = {
  id: string;
  status: "active" | "resurfaced" | "resolved";
  vulnerability: string;
  severity: string;
  cvss: number;
  assetsAffected: string[];
  lastSeen: string;
};

export default function VulnsPage() {
  const { toast } = useToast();
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchVulns() {
      try {
        const res = await apiFetch("/vuln/retrieve");
        const json = await res.json();

        setVulns(json);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An Unknown Error Has Occurred";

        toast({
          variant: "destructive",
          title: "Vulnerability Fetch Failed",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchVulns();
  }, [toast]);

  return (
    <div className="container w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full mt-12">
          <p className="text-muted-foreground">Loading vulnerabilities...</p>
        </div>
      ) : (
        <DataTable data={vulns ?? []} />
      )}
    </div>
  );
}

const Chip: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span className="m-1 inline-flex items-center rounded-full bg-muted px-2 py-1 text-sm font-medium text-muted-foreground">
      {label}
    </span>
  );
};

const columns: ColumnDef<Vulnerability>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "vulnerability",
    header: "Vulnerability",
    cell: ({ row }) => <div>{row.getValue("vulnerability")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <div className="font-semibold capitalize">{row.getValue("severity")}</div>
    ),
  },
  {
    accessorKey: "cvss",
    header: "CVSS",
    cell: ({ row }) => <div>{row.getValue("cvss")}</div>,
  },
  {
    accessorKey: "assetsAffected",
    header: "Assets Affected",
    cell: ({ row }) => {
      const assets: string[] = row.getValue("assetsAffected");
      return (
        <div className="flex flex-wrap">
          {assets.map((asset) => (
            <Chip key={asset} label={asset} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: "Last Updated",
    cell: ({ row }) => {
      const raw = row.getValue("lastSeen");
      const date = new Date(raw as string);
      return <div>{date.toLocaleString()}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vulnerability = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(vulnerability.id)}
            >
              Copy Vulnerability ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Manage Affected Assets</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];


function DataTable({ data }: { data: Vulnerability[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mt-12 text-2xl font-bold">Vulnerability</h1>
      <div className="mt-2 flex items-center justify-center py-4">
        <Input
          placeholder="Filter vulnerabilities..."
          value={
            (table.getColumn("vulnerability")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("vulnerability")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No vulnerabilities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div >
  );
}


