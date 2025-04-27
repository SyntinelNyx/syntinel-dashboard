"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { AlertCircle, AlertTriangle, AlertOctagon, Info } from "lucide-react";

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

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

type Vulnerability = {
  id: string;
  status: "new" | "active" | "resurfaced" | "resolved";
  vulnerability: string;
  severity: string;
  cvss: number;
  assetsAffected: string[];
  lastSeen: string;
};

type VulnerabilityData = {
  VulnerabilityName: string;
  VulnerabilityDescription: string;
  CvssScore: number;
  Reference: string[];
  CreatedOn: string;
  LastModified: string;
};


const defaultStyle = {
  text: "text-black dark:text-white",
  icon: <Info className="w-4 h-4" />,
  iconColor: "text-black dark:text-white",
};

const severityStyles: Record<string, {
  bg: string;
  text: string;
  icon?: React.ReactNode;
  iconColor?: string;
  animate?: string;
}> = {
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
        <div className="mt-12 flex h-full items-center justify-center">
          <p className="text-muted-foreground">Loading vulnerabilities...</p>
        </div>
      ) : (
        <DataTable data={vulns ?? []} />
      )}
    </div>
  );
}

type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  label: string;
};

const Chip: React.FC<ChipProps> = ({ label, className, ...props }) => {
  return (
    <span
      className={`m-1 inline-flex items-center rounded-full bg-muted px-2 py-1 text-sm font-semibold text-muted-foreground ${className ?? ""}`}
      {...props}
    >
      {label}
    </span>
  );
};

const columns: ColumnDef<Vulnerability>[] = [
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = (row.getValue("severity") as string).toLowerCase();
      const { bg, text, icon, iconColor, animate } = severityStyles[severity];

      return (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          {icon && (
            <span
              className={`flex items-center justify-center ${iconColor} ${animate ?? ""}`}
              aria-label={`${severity} severity`}
            >
              {icon}
            </span>
          )}

          <div className={`inline-flex ${bg} ${text} px-3 py-1 font-semibold capitalize`}>
            {severity}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "vulnerability",
    header: "Vulnerability",
    cell: ({ row }) => {
      const vulnID = row.getValue("vulnerability") as string;
      const [open, setOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const [vulnData, setVulnData] = useState<VulnerabilityData>({
        VulnerabilityName: '',
        VulnerabilityDescription: '',
        CvssScore: 0,
        Reference: [],
        CreatedOn: '',
        LastModified: '',
      });

      const handleClick = async () => {
        if (loading) return;
        setLoading(true);

        try {
          const res = await apiFetch(`/vuln/retrieve-data`, {
            method: "POST",
            body: JSON.stringify({ vulnID }),
          });
          const json = await res.json();

          setVulnData({
            VulnerabilityName: json.vulnerabilityName,
            VulnerabilityDescription: json.vulnerabilityDescription,
            CvssScore: json.cvssScore,
            Reference: json.reference,
            CreatedOn: json.createdOn,
            LastModified: json.lastModified,
          });
          setOpen(true);
        } catch (error) {
          console.error("Failed to retrieve data:", error);
        } finally {
          setLoading(false);
        }
      };

      return (
        <>
          <Chip
            label={vulnID}
            onClick={handleClick}
            className={`bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 px-3 py-1 font-semibold capitalize flex items-center gap-1 transition-all duration-150 ease-in-out cursor-pointer ${loading ? "opacity-50 pointer-events-none" : "hover:scale-105"}`}
          />

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-800">Vulnerability Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Vulnerability Name */}
                <div className="text-1xl font-semibold text-gray-800">{vulnData.VulnerabilityName}</div>

                <p className="text-base text-gray-600">{vulnData.VulnerabilityDescription}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-base text-gray-500">
                    <div>
                      <strong>CVSS Score:</strong> {vulnData.CvssScore}
                    </div>
                  </div>

                  <div className="flex justify-between text-base text-gray-500">
                    <div>
                      <strong>Created On:</strong> {new Date(vulnData.CreatedOn).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Last Modified:</strong> {new Date(vulnData.LastModified).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <a
                  href={vulnData.Reference[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-4 block"
                >
                  View Reference
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
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
        <div className="inline-block">
          <div className="inline-flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>

            <div className="font-semibold capitalize">
              {status}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "assetsAffected",
    header: "Assets Affected",
    cell: ({ row }) => {
      const assets: string[] = row.getValue("assetsAffected");

      const containerRef = useRef<HTMLDivElement>(null);
      const [maxVisible, setMaxVisible] = useState(assets.length);
      const [open, setOpen] = useState(false);

      useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const resizeObserver = new ResizeObserver(() => {
          let availableWidth = container.clientWidth;
          let usedWidth = 0;
          let count = 0;

          for (const asset of assets) {
            const approxWidth = asset.length * 8 + 32;
            if (usedWidth + approxWidth < availableWidth) {
              usedWidth += approxWidth + 8;
              count++;
            } else {
              break;
            }
          }

          setMaxVisible(Math.max(1, count - 1));
        });

        resizeObserver.observe(container);

        return () => {
          resizeObserver.disconnect();
        };
      }, [assets]);

      const visibleAssets = assets.slice(0, maxVisible);
      const hiddenAssets = assets.slice(maxVisible);

      return (
        <>
          <div ref={containerRef} className="flex flex-wrap items-center gap-2 overflow-hidden">
            {visibleAssets.map((asset) => (
              <Chip
                key={asset}
                label={asset}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-1"
              />
            ))}

            {hiddenAssets.length > 0 && (
              <Chip
                label={`+${hiddenAssets.length} more`}
                onClick={() => setOpen(true)}
                className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center font-bold gap-1"
              />
            )}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assets Affected</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 mt-4">
                {assets.map((asset) => (
                  <Chip
                    key={asset}
                    label={asset}
                    className="bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 hover:scale-105 cursor-pointer transition-all duration-150 ease-in-out flex items-center gap-1"
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "lastSeen",
    header: "Last Seen",
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
            return `${Math.floor(value)} ${unit.label}${value !== 1 ? 's' : ''} ago`;
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
      <h1 className="mt-12 text-2xl font-bold">Vulnerabilities</h1>
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
