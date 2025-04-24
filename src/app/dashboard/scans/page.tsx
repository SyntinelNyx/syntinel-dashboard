"use client";
import * as React from "react";
import { useEffect, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

import { apiFetch } from "@/lib/api-fetch";
import { useToast } from "@/hooks/use-toast";

type Scan = {
  id: string;
  scanDate: string;
  scannerName: string;
  scannedBy: string;
};

export default function ScanPage() {
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const res = await apiFetch("/scan/retrieve");
        const json = await res.json();

        setScans(json);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An Unknown Error Has Occurred";

        toast({
          variant: "destructive",
          title: "Scans Fetch Failed",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchScans();
  }, [toast]);

  return (
    <div className="container w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full mt-12">
          <p className="text-muted-foreground">Loading scans...</p>
        </div>
      ) : (
        <DataTable data={scans ?? []} />
      )}
    </div>
  );
}

const columns: ColumnDef<Scan>[] = [
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
        className="m-2"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="m-2"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "scanDate",
    header: "Scan Date",
    cell: ({ row }) => {
      const raw = row.getValue("scanDate");
      const date = new Date(raw as string);
      return <div>{date.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "scannerName",
    header: "Scanner Name",
    cell: ({ row }) => (
      <div className="font-semibold capitalize">{row.getValue("scannerName")}</div>
    ),
  },
  {
    accessorKey: "scannedBy",
    header: "Launched By",
    cell: ({ row }) => <div>{row.getValue("scannedBy")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const scan = row.original;

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
              onClick={() => navigator.clipboard.writeText(scan.id)}
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

function DataTable({ data }: { data: Scan[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [open, setOpen] = React.useState<boolean>(false);
  const { toast } = useToast();

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

  async function launchScans() {
    try {
      const response = await apiFetch("/scan/launch", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to launch scans");
      }
      const data = await response.json();

      localStorage.setItem("scanSuccess", JSON.stringify({
        title: "Scan Successfully Launched!",
        description: data?.message || ""
      }));

      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : "An error occurred while fetching roles";

      toast({
        variant: "destructive",
        title: "Launch Scan Failed",
        description: errorMessage,
      });
    }
  }

  useEffect(() => {
    const toastData = localStorage.getItem("scanSuccess");
    if (toastData) {
      const { title, description } = JSON.parse(toastData);
      toast({ title, description });
      localStorage.removeItem("scanSuccess");
    }
  }, []);


  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mt-12 text-2xl font-bold">Scans</h1>
      <div className="flex justify-end -mt-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Start New Scan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Scan</DialogTitle>
              <DialogDescription>
                Are you sure you want to start scans on <strong>all assets</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit"
                onClick={async () => {
                  setOpen(false);
                  await launchScans();
                }}
              >Start Scan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center justify-center py-4">
        <Input
          placeholder="Filter assets..."
          value={
            (table.getColumn("scannerName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("scannerName")?.setFilterValue(event.target.value)
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
                  No scans found.
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
