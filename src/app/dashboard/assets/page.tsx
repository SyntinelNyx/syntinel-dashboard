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

const data: Asset[] = [
  {
    id: "c4f3d5b9-2f2a-4ae0-a45b-7f60ef9f2e9b",
    machine_name: "Machine-1",
    os: "Windows",
    version: "6.8.32",
    status: "active",
    ip_address: "192.168.0.1",
    notes: "Used for general office productivity and document storage.",
  },
  {
    id: "f9a2c1d4-7647-4b1f-9026-aaa77fc88eb1",
    machine_name: "Machine-2",
    os: "Ubuntu",
    version: "22.04",
    status: "inactive",
    ip_address: "192.168.0.2",
    notes: "Retired dev server, kept for archival access only.",
  },
  {
    id: "a2c39f25-e4d5-48c0-b738-c578fd1e38e4",
    machine_name: "Machine-3",
    os: "macOS",
    version: "13.2",
    status: "active",
    ip_address: "192.168.0.3",
    notes: "Design workstation used for video editing and graphics.",
  },
  {
    id: "ddb59ab2-df9a-4a7f-9a5f-50cce2c13cd3",
    machine_name: "Machine-4",
    os: "Windows",
    version: "10.0.19045",
    status: "active",
    ip_address: "192.168.0.4",
    notes: "Workstation for the accounting team.",
  },
  {
    id: "99cbcf61-bfad-470c-a06c-5bc9346dc254",
    machine_name: "Machine-5",
    os: "Debian",
    version: "11",
    status: "inactive",
    ip_address: "192.168.0.5",
    notes: "Running critical internal monitoring tools.",
  },
  {
    id: "b1467e88-6461-4459-86a9-6a2fdc8c48d3",
    machine_name: "Machine-6",
    os: "Windows",
    version: "11.0.22621",
    status: "active",
    ip_address: "192.168.0.6",
    notes: "Used by the HR department for employee management.",
  },
  {
    id: "ac3b1d20-48e2-4a99-8f72-247ea9ef395d",
    machine_name: "Machine-7",
    os: "CentOS",
    version: "7.9",
    status: "inactive",
    ip_address: "192.168.0.7",
    notes: "Legacy backend service—replaced by newer containerized services.",
  },
  {
    id: "caf4e0c0-d2e7-49b0-88d8-387d8dc2b8d6",
    machine_name: "Machine-8",
    os: "Fedora",
    version: "39",
    status: "active",
    ip_address: "192.168.0.8",
    notes: "Developer environment for testing frontend features.",
  },
  {
    id: "519df6a0-86b0-4c6c-a5c6-8ac92f2e7480",
    machine_name: "Machine-9",
    os: "Windows",
    version: "10.0.19045",
    status: "active",
    ip_address: "192.168.0.9",
    notes: "Main conference room system, used for presentations and Zoom calls.",
  },
  {
    id: "3ff1a09d-e84d-43b0-bbb4-6bdf276dd1cb",
    machine_name: "Machine-10",
    os: "Arch Linux",
    version: "2024.04.01",
    status: "active",
    ip_address: "192.168.0.10",
    notes: "Used by the system administrator for network troubleshooting.",
  },
  {
    id: "47334834-f108-4b0f-888c-14d3e4f3edcd",
    machine_name: "Machine-11",
    os: "Windows",
    version: "11.0.22621",
    status: "active",
    ip_address: "192.168.0.11",
    notes: "Undergoing regular patch updates.",
  },
  {
    id: "f635fa6b-7581-4d29-9831-81c2a527f450",
    machine_name: "Machine-12",
    os: "Debian",
    version: "12",
    status: "active",
    ip_address: "192.168.0.12",
    notes: "Runs internal Git server for code hosting.",
  },
  {
    id: "6c22821a-04e2-4702-875e-bd07db7b55cd",
    machine_name: "Machine-13",
    os: "Ubuntu",
    version: "20.04",
    status: "inactive",
    ip_address: "192.168.0.13",
    notes: "Used previously for Docker swarm orchestration.",
  },
  {
    id: "f993f36e-3bd2-499e-87e4-79f823876d15",
    machine_name: "Machine-14",
    os: "Windows",
    version: "10.0.19045",
    status: "active",
    ip_address: "192.168.0.14",
    notes: "QA testing system with automation scripts installed.",
  },
  {
    id: "c314cce9-8021-4a94-984f-96970b788850",
    machine_name: "Machine-15",
    os: "macOS",
    version: "14.1",
    status: "active",
    ip_address: "192.168.0.15",
    notes: "Used by marketing team for content creation.",
  },
  {
    id: "e28e2269-6758-4d4d-a116-657d53074c27",
    machine_name: "Machine-16",
    os: "Kali Linux",
    version: "2024.1",
    status: "active",
    ip_address: "192.168.0.16",
    notes: "Security audit machine for penetration testing.",
  },
  {
    id: "a0f32d1c-c16f-4fc9-9e59-e6a2e2670571",
    machine_name: "Machine-17",
    os: "Windows Server",
    version: "2019",
    status: "active",
    ip_address: "192.168.0.17",
    notes: "Internal Active Directory domain controller.",
  },
  {
    id: "34d0e81c-3bd2-4042-970b-b12303885b44",
    machine_name: "Machine-18",
    os: "FreeBSD",
    version: "13.3",
    status: "inactive",
    ip_address: "192.168.0.18",
    notes: "Old NAS system, decommissioned in Q3 last year.",
  },
  {
    id: "82f713a0-6d3a-4f44-8be6-b71a06b9cc1a",
    machine_name: "Machine-19",
    os: "Windows",
    version: "11.0.22621",
    status: "active",
    ip_address: "192.168.0.19",
    notes: "Developer machine with Visual Studio and .NET SDKs.",
  },
  {
    id: "cb95f6a7-80b3-4269-a3be-fcc8136d7c41",
    machine_name: "Machine-20",
    os: "AlmaLinux",
    version: "9",
    status: "active",
    ip_address: "192.168.0.20",
    notes: "Web server hosting internal dashboard tools.",
  },
  {
    id: "64b2559a-2eb1-47f2-b86a-dc4f16f02793",
    machine_name: "Machine-21",
    os: "macOS",
    version: "13.6",
    status: "active",
    ip_address: "192.168.0.21",
    notes: "Data analyst’s machine running R and Jupyter.",
  },
  {
    id: "acb2c0e4-f8b0-4b31-8df1-b8fcf39a68f6",
    machine_name: "Machine-22",
    os: "Windows",
    version: "10.0.19045",
    status: "active",
    ip_address: "192.168.0.22",
    notes: "Support team desktop for handling customer calls.",
  },
  {
    id: "cf27e6a3-2922-412f-94c9-e8d4e7d6cbb2",
    machine_name: "Machine-23",
    os: "Pop!_OS",
    version: "22.04",
    status: "inactive",
    ip_address: "192.168.0.23",
    notes: "Reimaging in progress after suspected compromise.",
  },
  {
    id: "a7335e9e-bb98-4694-b02b-65cbe31232cb",
    machine_name: "Machine-24",
    os: "Windows Server",
    version: "2022",
    status: "active",
    ip_address: "192.168.0.24",
    notes: "Hosts internal database and file shares.",
  },
  {
    id: "10e3e03d-15c7-496e-8a0a-8883ef96b8c9",
    machine_name: "Machine-25",
    os: "Rocky Linux",
    version: "9.2",
    status: "active",
    ip_address: "192.168.0.25",
    notes: "Handles automated nightly backups to cloud storage.",
  }
];

type Asset = {
  id: string;
  machine_name: string;
  os: string;
  version: string;
  status: "active" | "inactive";
  ip_address: string;
  notes: string;
};

const columns: ColumnDef<Asset>[] = [
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
    accessorKey: "machine_name",
    header: "Machine Name",
    cell: ({ row }) => <div>{row.getValue("machine_name")}</div>,
  },
  {
    accessorKey: "os",
    header: "OS",
    cell: ({ row }) => (
      <div className="font-semibold capitalize">{row.getValue("os")}</div>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => <div>{row.getValue("version")}</div>,
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) => <div>{row.getValue("ip_address")}</div>,
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <div>{row.getValue("notes")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const asset = row.original;

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
              onClick={() => navigator.clipboard.writeText(asset.id)}
            >
              Copy Asset ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Manage Asset</DropdownMenuItem>
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
      <h1 className="mt-12 text-2xl font-bold">Asset Management</h1>
      <div className="flex items-center justify-center py-4">
        <Input
          placeholder="Filter assets..."
          value={
            (table.getColumn("machine_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("machine_name")?.setFilterValue(event.target.value)
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
                  No assets found.
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

export default function AssetsPage() {
  return (
    <div className="container w-full">
      <DataTable />
    </div >
  );
}
