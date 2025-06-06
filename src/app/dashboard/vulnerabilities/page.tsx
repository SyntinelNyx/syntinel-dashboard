"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { AlertCircle, AlertTriangle, AlertOctagon, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { VulnerabilityCell } from "@/components/VulnerabilityCell"
import { AssetsAffectedCell } from "@/components/AssetsAffectedCell"

import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

type assetsAffected = {
  assetUUID: string;
  hostname: string;
}

type Vulnerability = {
  id: string;
  status: "new" | "active" | "resurfaced" | "resolved";
  vulnerability: string;
  severity: string;
  assetsAffected: assetsAffected[];
  lastSeen: string;
};

const severityStyles: Record<string, {
  bg: string;
  text: string;
  icon?: React.ReactNode;
  iconColor?: string;
  animate?: string;
}> = {
  unknown: {
    bg: "bg-slate-100 dark:bg-slate-700",
    text: "text-slate-800 dark:text-slate-200",
  },
  low: {
    bg: "bg-green-400 dark:bg-green-700",
    text: "text-white",
    icon: <AlertCircle className="w-5 h-5" />,
    iconColor: "text-green-500",
  },
  medium: {
    bg: "bg-yellow-400 dark:bg-yellow-600",
    text: "text-white",
    icon: <AlertTriangle className="w-5 h-5" />,
    iconColor: "text-yellow-500",
  },
  high: {
    bg: "bg-orange-400 dark:bg-orange-700",
    text: "text-white",
    icon: <AlertOctagon className="w-5 h-5" />,
    iconColor: "text-orange-500",
  },
  critical: {
    bg: "bg-red-600 dark:bg-red-600",
    text: "text-white",
    icon: <AlertOctagon className="w-5 h-5" />,
    iconColor: "text-red-600",
    animate: "animate-custom-pulse",
  },
};

export default function VulnsPage() {
  const { toast } = useToast();
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) { return; }
    hasFetched.current = true;

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
        <div className="mt-12 flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading vulnerabilities...</p>
        </div>
      ) : (
        <DataTable data={vulns ?? []} />
      )}
    </div>
  );
}

function DataTable({ data }: { data: Vulnerability[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchMode, setSearchMode] = React.useState<"vulnerability" | "asset">("vulnerability");

  const columnLabels: Record<string, string> = {
    severity: "Severity",
    vulnerability: "Vulnerability",
    status: "Status",
    assetsAffected: "Assets Affected",
    lastSeen: "Last Seen",
  };

  const columns: ColumnDef<Vulnerability>[] = [
    {
      accessorKey: "severity",
      header: "Severity",
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const order = ["unknown", "low", "medium", "high", "critical"];
        const a = rowA.getValue("severity") as string;
        const b = rowB.getValue("severity") as string;
        return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
      },
      cell: ({ row }) => {
        const severity = (row.getValue("severity") as string).toLowerCase();
        const { bg, text, icon, iconColor, animate } = severityStyles[severity];
        return (
          <div className="flex items-center gap-2 ml-4" role="status" aria-live="polite">
            {icon && (
              <span className={`flex items-center justify-center ${iconColor} ${animate ?? ""}`}>
                {icon}
              </span>
            )}
            <div className={`inline-flex rounded-sm ${bg} ${text} px-3 py-1 font-semibold capitalize`}>
              {severity}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "vulnerability",
      header: "Vulnerability",
      enableSorting: true,
      cell: ({ row }) => {
        const vulnID = row.getValue("vulnerability") as string;
        return <VulnerabilityCell vulnID={vulnID} />;
      },
    },
    {
      id: "assetAffected",
      accessorFn: (row) => row.assetsAffected.map((a) => a.hostname).join(", "),
      header: "Assets Affected",
      enableSorting: false,
      enableColumnFilter: true,
      cell: ({ row }) => {
        const assets = row.original.assetsAffected;
        return <AssetsAffectedCell assets={assets} />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const order = ["new", "active", "resurfaced", "resolved"];
        const a = rowA.getValue("status") as string;
        const b = rowB.getValue("status") as string;
        return order.indexOf(a.toLowerCase()) - order.indexOf(b.toLowerCase());
      },
      cell: ({ row }) => {
        const status = (row.getValue("status") as string).toLowerCase();

        const statusColors: Record<string, string> = {
          "new": "bg-blue-500",
          "active": "bg-amber-500",
          "resurfaced": "bg-amber-500",
          "resolved": "bg-green-500",
        };

        const dotColor = statusColors[status] ?? "bg-slate-400";
        return (
          <div className="inline-flex items-center gap-2">
            <span className={`w-[14px] h-[14px] rounded-full ${dotColor}`} />
            <div className="font-semibold capitalize">{status}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "lastSeen",
      header: "Last Seen",
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const a = new Date(rowA.getValue("lastSeen") as string).getTime();
        const b = new Date(rowB.getValue("lastSeen") as string).getTime();
        return a - b;
      },
      cell: ({ row }) => {
        const raw = row.getValue("lastSeen");
        const date = new Date(raw as string);

        const getRelativeTime = (date: Date) => {
          const now = new Date();
          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

          const units = [
            { label: 'second', threshold: 60 },
            { label: 'minute', threshold: 60 },
            { label: 'hour', threshold: 24 },
            { label: 'day', threshold: 30 },
            { label: 'month', threshold: 12 },
            { label: 'year', threshold: Infinity }
          ];

          let value = diffInSeconds;
          for (let i = 0; i < units.length; i++) {
            const unit = units[i];

            if (value < unit.threshold) {
              return `${Math.floor(value)} ${unit.label}${Math.floor(value) !== 1 ? 's' : ''} ago`;
            }

            value /= unit.threshold;
          }
        };

        return (
          <Tooltip>
            <TooltipTrigger>
              <div>{getRelativeTime(date)}</div>
            </TooltipTrigger>
            <TooltipContent>
              {date.toLocaleString("en-US", { timeZoneName: "short" })}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      id: "actions",
      enableSorting: false,
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
                onClick={() => navigator.clipboard.writeText(vulnerability.vulnerability)}
              >
                Copy Vulnerability ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    <div className="mx-auto w-full max-w-4xl user-select: text">
      <h1 className="mt-12 text-2xl font-bold">Vulnerabilities</h1>
      <div className="mt-2 flex flex-wrap items-center gap-4 py-4">
        <Select value={searchMode} onValueChange={(val) => setSearchMode(val as "vulnerability" | "asset")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Search by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vulnerability">Vulnerability</SelectItem>
            <SelectItem value="asset">Asset</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder={searchMode === "vulnerability" ? "Search vulnerability ID..." : "Search affected assets..."}
          value={
            (table.getColumn(searchMode === "vulnerability" ? "vulnerability" : "assetAffected")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn(searchMode === "vulnerability" ? "vulnerability" : "assetAffected")?.setFilterValue(e.target.value)
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
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {columnLabels[column.id] ?? column.id}
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
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          }`}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          {
                            asc: <ChevronUp className="w-4 h-4" />,
                            desc: <ChevronDown className="w-4 h-4" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
                          )
                        )}
                      </div>
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
                  colSpan={table.getAllColumns().length}
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
          {(() => {
            const total = table.getFilteredRowModel().rows.length;
            const { pageIndex, pageSize } = table.getState().pagination;

            if (total === 0) {
              return "No vulnerabilities found.";
            }

            if (total === 1) {
              return "Displaying 1 vulnerability.";
            }

            const start = pageIndex * pageSize + 1;
            const end = Math.min((pageIndex + 1) * pageSize, total);
            return `Displaying ${start} - ${end} of ${total} vulnerabilities`;
          })()}
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
    </div>
  );
}