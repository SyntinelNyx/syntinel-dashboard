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
    notes: "This is a note for Machine-1",
  },
  {
    id: "28c61df4-28ef-4728-99f8-d2b14d2c5f96",
    machine_name: "Machine-2",
    os: "Linux",
    version: "9.3.14",
    status: "inactive",
    ip_address: "10.0.0.2",
    notes: "This is a note for Machine-2",
  },
  {
    id: "8a62d1cc-7a52-4313-87b8-0a4b15ff5b3e",
    machine_name: "Machine-3",
    os: "macOS",
    version: "3.15.7",
    status: "active",
    ip_address: "172.16.1.3",
    notes: "This is a note for Machine-3",
  },
  {
    id: "bcfa72a2-bc65-4af4-8374-215af4b80a24",
    machine_name: "Machine-4",
    os: "Windows",
    version: "8.1.42",
    status: "inactive",
    ip_address: "192.168.1.4",
    notes: "This is a note for Machine-4",
  },
  {
    id: "cb2dbefc-6b02-4c8d-a16e-d84a03c6b68f",
    machine_name: "Machine-5",
    os: "Linux",
    version: "4.9.23",
    status: "active",
    ip_address: "10.0.2.5",
    notes: "This is a note for Machine-5",
  },
  {
    id: "3b2e3f34-b062-4049-a2b7-89e81c0b2f98",
    machine_name: "Machine-6",
    os: "macOS",
    version: "5.10.17",
    status: "inactive",
    ip_address: "172.16.2.6",
    notes: "This is a note for Machine-6",
  },
  {
    id: "4d36b967-9c0b-4425-b6cc-82e7d9f7cb65",
    machine_name: "Machine-7",
    os: "Windows",
    version: "7.5.13",
    status: "active",
    ip_address: "192.168.2.7",
    notes: "This is a note for Machine-7",
  },
  {
    id: "f7a14f5f-88cd-4b3f-9f65-9a3a5d6e8175",
    machine_name: "Machine-8",
    os: "Linux",
    version: "2.12.9",
    status: "inactive",
    ip_address: "10.0.3.8",
    notes: "This is a note for Machine-8",
  },
  {
    id: "2d9623b4-4538-4d85-9b72-58772b8ad3b3",
    machine_name: "Machine-9",
    os: "macOS",
    version: "6.18.44",
    status: "active",
    ip_address: "172.16.3.9",
    notes: "This is a note for Machine-9",
  },
  {
    id: "df3e2d88-2174-4f9c-9935-3cfe15f96594",
    machine_name: "Machine-10",
    os: "Windows",
    version: "3.4.21",
    status: "inactive",
    ip_address: "192.168.3.10",
    notes: "This is a note for Machine-10",
  },
  {
    id: "fbeb76e3-bd07-4f62-9dd7-453f7614c1ed",
    machine_name: "Machine-11",
    os: "Linux",
    version: "7.7.29",
    status: "active",
    ip_address: "10.0.4.11",
    notes: "This is a note for Machine-11",
  },
  {
    id: "b25364e9-e308-4e4b-9bd6-67c58401a74f",
    machine_name: "Machine-12",
    os: "macOS",
    version: "8.6.31",
    status: "inactive",
    ip_address: "172.16.4.12",
    notes: "This is a note for Machine-12",
  },
  {
    id: "5e6a3d33-6a0e-41f7-a74d-816b91f4dc8b",
    machine_name: "Machine-13",
    os: "Windows",
    version: "1.8.14",
    status: "active",
    ip_address: "192.168.4.13",
    notes: "This is a note for Machine-13",
  },
  {
    id: "824c6b07-88b4-41d6-880d-329672cd5f43",
    machine_name: "Machine-14",
    os: "Linux",
    version: "9.1.37",
    status: "inactive",
    ip_address: "10.0.5.14",
    notes: "This is a note for Machine-14",
  },
  {
    id: "37c017eb-4a85-4e18-bf97-9855d5bce2a5",
    machine_name: "Machine-15",
    os: "macOS",
    version: "2.13.12",
    status: "active",
    ip_address: "172.16.5.15",
    notes: "This is a note for Machine-15",
  },
  {
    id: "4fbb5c7f-7dc6-4c8c-b9a4-f7d0b9d74c8f",
    machine_name: "Machine-16",
    os: "Windows",
    version: "5.9.23",
    status: "inactive",
    ip_address: "192.168.5.16",
    notes: "This is a note for Machine-16",
  },
  {
    id: "a1c42786-748e-41c7-8a16-8d3a7247bc16",
    machine_name: "Machine-17",
    os: "Linux",
    version: "3.7.15",
    status: "active",
    ip_address: "10.0.6.17",
    notes: "This is a note for Machine-17",
  },
  {
    id: "56c09f2d-5c4b-4bda-98a5-fc1b78e4a8c4",
    machine_name: "Machine-18",
    os: "macOS",
    version: "7.4.28",
    status: "inactive",
    ip_address: "172.16.6.18",
    notes: "This is a note for Machine-18",
  },
  {
    id: "b38af32d-51db-44c8-ae6d-9a4e983c4a3e",
    machine_name: "Machine-19",
    os: "Windows",
    version: "6.2.31",
    status: "active",
    ip_address: "192.168.6.19",
    notes: "This is a note for Machine-19",
  },
  {
    id: "89df462e-c39b-4327-8e87-06d7c24ec85c",
    machine_name: "Machine-20",
    os: "Linux",
    version: "1.10.17",
    status: "inactive",
    ip_address: "10.0.7.20",
    notes: "This is a note for Machine-20",
  },
  {
    id: "94b36c72-7c18-4826-8434-f83e7d1f7236",
    machine_name: "Machine-21",
    os: "macOS",
    version: "4.8.22",
    status: "active",
    ip_address: "172.16.7.21",
    notes: "This is a note for Machine-21",
  },
  {
    id: "4c8f8d42-9c14-4df6-85d8-b94c2b15b5c9",
    machine_name: "Machine-22",
    os: "Windows",
    version: "8.12.39",
    status: "inactive",
    ip_address: "192.168.7.22",
    notes: "This is a note for Machine-22",
  },
  {
    id: "e2a1bd7e-3f4e-4d8a-92f4-f6c7b86f2d62",
    machine_name: "Machine-23",
    os: "Linux",
    version: "2.6.31",
    status: "active",
    ip_address: "10.0.8.23",
    notes: "This is a note for Machine-23",
  },
  {
    id: "53a69d0b-9a28-412f-bc4d-3a7e8f9b3c28",
    machine_name: "Machine-24",
    os: "macOS",
    version: "7.3.25",
    status: "inactive",
    ip_address: "172.16.8.24",
    notes: "This is a note for Machine-24",
  },
  {
    id: "47a36d89-81f5-421a-bf6e-d5c1b89e7c5c",
    machine_name: "Machine-25",
    os: "Windows",
    version: "3.5.16",
    status: "active",
    ip_address: "192.168.8.25",
    notes: "This is a note for Machine-25",
  },
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
      <div className="mt-10 flex items-center justify-center py-4">
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
  return <DataTable />;
}
