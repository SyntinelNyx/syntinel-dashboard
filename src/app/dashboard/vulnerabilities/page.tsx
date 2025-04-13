"use client";
import * as React from "react";
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

const data: Vulnerability[] = [
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    status: "active",
    vulnerability: "CVE-2024-10001",
    severity: "Critical",
    cvss: 9.8,
    assets_affected: [1001, 1002, 1003],
    last_seen: "November 1st, 2024",
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    status: "resurfaced",
    vulnerability: "CVE-2024-10002",
    severity: "High",
    cvss: 7.5,
    assets_affected: [2001, 2002, 2003, 2004],
    last_seen: "October 25th, 2024",
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r8",
    status: "resolved",
    vulnerability: "CVE-2024-10003",
    severity: "Medium",
    cvss: 5.3,
    assets_affected: [3001],
    last_seen: "September 15th, 2024",
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-l2m3-n4o5p6q7r8s9",
    status: "active",
    vulnerability: "CVE-2024-10004",
    severity: "Low",
    cvss: 3.4,
    assets_affected: [4001, 4002],
    last_seen: "November 2nd, 2024",
  },
  {
    id: "5e6f7g8h-9i0j-k1l2-m3n4-o5p6q7r8s9t0",
    status: "resolved",
    vulnerability: "CVE-2024-10005",
    severity: "Critical",
    cvss: 9.0,
    assets_affected: [5001, 5002, 5003, 5004],
    last_seen: "August 30th, 2024",
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    status: "active",
    vulnerability: "CVE-2024-10001",
    severity: "Critical",
    cvss: 9.8,
    assets_affected: [1001, 1002, 1003],
    last_seen: "November 1st, 2024",
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    status: "resurfaced",
    vulnerability: "CVE-2024-10002",
    severity: "High",
    cvss: 7.5,
    assets_affected: [2001, 2002, 2003, 2004],
    last_seen: "October 25th, 2024",
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r8",
    status: "resolved",
    vulnerability: "CVE-2024-10003",
    severity: "Medium",
    cvss: 5.3,
    assets_affected: [3001],
    last_seen: "September 15th, 2024",
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-l2m3-n4o5p6q7r8s9",
    status: "active",
    vulnerability: "CVE-2024-10004",
    severity: "Low",
    cvss: 3.4,
    assets_affected: [4001, 4002],
    last_seen: "November 2nd, 2024",
  },
  {
    id: "5e6f7g8h-9i0j-k1l2-m3n4-o5p6q7r8s9t0",
    status: "resolved",
    vulnerability: "CVE-2024-10005",
    severity: "Critical",
    cvss: 9.0,
    assets_affected: [5001, 5002, 5003, 5004],
    last_seen: "August 30th, 2024",
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    status: "active",
    vulnerability: "CVE-2024-10001",
    severity: "Critical",
    cvss: 9.8,
    assets_affected: [1001, 1002, 1003],
    last_seen: "November 1st, 2024",
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    status: "resurfaced",
    vulnerability: "CVE-2024-10002",
    severity: "High",
    cvss: 7.5,
    assets_affected: [2001, 2002, 2003, 2004],
    last_seen: "October 25th, 2024",
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r8",
    status: "resolved",
    vulnerability: "CVE-2024-10003",
    severity: "Medium",
    cvss: 5.3,
    assets_affected: [3001],
    last_seen: "September 15th, 2024",
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-l2m3-n4o5p6q7r8s9",
    status: "active",
    vulnerability: "CVE-2024-10004",
    severity: "Low",
    cvss: 3.4,
    assets_affected: [4001, 4002],
    last_seen: "November 2nd, 2024",
  },
  {
    id: "5e6f7g8h-9i0j-k1l2-m3n4-o5p6q7r8s9t0",
    status: "resolved",
    vulnerability: "CVE-2024-10005",
    severity: "Critical",
    cvss: 9.0,
    assets_affected: [5001, 5002, 5003, 5004],
    last_seen: "August 30th, 2024",
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    status: "active",
    vulnerability: "CVE-2024-10001",
    severity: "Critical",
    cvss: 9.8,
    assets_affected: [1001, 1002, 1003],
    last_seen: "November 1st, 2024",
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    status: "resurfaced",
    vulnerability: "CVE-2024-10002",
    severity: "High",
    cvss: 7.5,
    assets_affected: [2001, 2002, 2003, 2004],
    last_seen: "October 25th, 2024",
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r8",
    status: "resolved",
    vulnerability: "CVE-2024-10003",
    severity: "Medium",
    cvss: 5.3,
    assets_affected: [3001],
    last_seen: "September 15th, 2024",
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-l2m3-n4o5p6q7r8s9",
    status: "active",
    vulnerability: "CVE-2024-10004",
    severity: "Low",
    cvss: 3.4,
    assets_affected: [4001, 4002],
    last_seen: "November 2nd, 2024",
  },
  {
    id: "5e6f7g8h-9i0j-k1l2-m3n4-o5p6q7r8s9t0",
    status: "resolved",
    vulnerability: "CVE-2024-10005",
    severity: "Critical",
    cvss: 9.0,
    assets_affected: [5001, 5002, 5003, 5004],
    last_seen: "August 30th, 2024",
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    status: "active",
    vulnerability: "CVE-2024-10001",
    severity: "Critical",
    cvss: 9.8,
    assets_affected: [1001, 1002, 1003],
    last_seen: "November 1st, 2024",
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    status: "resurfaced",
    vulnerability: "CVE-2024-10002",
    severity: "High",
    cvss: 7.5,
    assets_affected: [2001, 2002, 2003, 2004],
    last_seen: "October 25th, 2024",
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-k1l2-m3n4o5p6q7r8",
    status: "resolved",
    vulnerability: "CVE-2024-10003",
    severity: "Medium",
    cvss: 5.3,
    assets_affected: [3001],
    last_seen: "September 15th, 2024",
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-l2m3-n4o5p6q7r8s9",
    status: "active",
    vulnerability: "CVE-2024-10004",
    severity: "Low",
    cvss: 3.4,
    assets_affected: [4001, 4002],
    last_seen: "November 2nd, 2024",
  },
  {
    id: "5e6f7g8h-9i0j-k1l2-m3n4-o5p6q7r8s9t0",
    status: "resolved",
    vulnerability: "CVE-2024-10005",
    severity: "Critical",
    cvss: 9.0,
    assets_affected: [5001, 5002, 5003, 5004],
    last_seen: "August 30th, 2024",
  },
];

type Vulnerability = {
  id: string;
  status: "active" | "resurfaced" | "resolved";
  vulnerability: string;
  severity: string;
  cvss: number;
  assets_affected: number[];
  last_seen: string;
};

const Chip: React.FC<{ label: string }> = ({ label }) => {
  return (
    <span className="m-1 inline-flex items-center rounded-full bg-gray-800 px-2 py-1 text-sm font-medium text-white">
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
    accessorKey: "assets_affected",
    header: "Assets Affected",
    cell: ({ row }) => {
      const assets: number[] = row.getValue("assets_affected") as number[];
      return (
        <div className="flex flex-wrap">
          {assets.map((asset) => (
            <Chip key={asset} label={asset.toString()} />
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "last_seen",
    header: "Last Seen",
    cell: ({ row }) => <div>{row.getValue("last_seen")}</div>,
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

function DataTable() {
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
      <h1 className="mt-12 text-2xl font-bold">Vulnerabilitiy & Scan</h1>
      <div className="flex justify-end -mt-8">
        <Button>
          Start New Scan
        </Button>
      </div>
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
    </div>
  );
}

export default function VulnsPage() {
  return (
    <div className="container w-full">
      <DataTable />
    </div>
  );
}
