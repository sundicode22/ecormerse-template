"use client"

import { useMemo, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  FilterAddIcon,
} from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header"

export type DataTableFilter<TData> = {
  /** Column id / accessor key */
  id: string
  label: string
  /** Optional fixed options; otherwise unique values are derived from data */
  options?: { label: string; value: string }[]
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Column accessor key to use for the search filter */
  searchKey?: string
  searchPlaceholder?: string
  /** Faceted filters shown in the toolbar */
  filters?: DataTableFilter<TData>[]
}

function getCellLabel(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return String(value)
}

function enhanceColumns<TData, TValue>(
  columns: ColumnDef<TData, TValue>[]
): ColumnDef<TData, TValue>[] {
  return columns.map((column) => {
    const id =
      ("id" in column && column.id) ||
      ("accessorKey" in column && String(column.accessorKey)) ||
      ""
    if (
      id === "actions" ||
      id === "select" ||
      column.enableSorting === false ||
      (typeof column.header === "string" && !column.header.trim())
    ) {
      return { ...column, enableSorting: false } as ColumnDef<TData, TValue>
    }

    if (typeof column.header !== "string") {
      return {
        ...column,
        enableSorting: column.enableSorting ?? true,
      } as ColumnDef<TData, TValue>
    }

    const title = column.header
    return {
      ...column,
      enableSorting: column.enableSorting ?? true,
      header: ({ column: col }) => (
        <DataTableColumnHeader column={col} title={title} />
      ),
    } as ColumnDef<TData, TValue>
  })
}

function withFacetFilterFn<TData, TValue>(
  columns: ColumnDef<TData, TValue>[],
  filterIds: string[]
): ColumnDef<TData, TValue>[] {
  if (filterIds.length === 0) return columns

  return columns.map((column) => {
    const id =
      ("id" in column && column.id) ||
      ("accessorKey" in column && String(column.accessorKey)) ||
      ""
    if (!filterIds.includes(id)) return column
    return {
      ...column,
      filterFn: (row, columnId, filterValue) => {
        const selected = filterValue as string[] | undefined
        if (!selected?.length) return true
        const raw = row.getValue(columnId)
        const candidates = new Set([
          getCellLabel(raw),
          String(raw),
          typeof raw === "boolean" ? (raw ? "true" : "false") : "",
        ])
        return selected.some((value) => candidates.has(value))
      },
    } as ColumnDef<TData, TValue>
  })
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  filters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const filterIds = useMemo(() => filters.map((f) => String(f.id)), [filters])

  const tableColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    const enhanced = withFacetFilterFn(enhanceColumns(columns), filterIds)
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
      ...enhanced,
    ]
  }, [columns, filterIds])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter: searchKey ? undefined : globalFilter,
    },
  })

  const filterOptions = useMemo(() => {
    return filters.map((filter) => {
      const id = String(filter.id)
      if (filter.options?.length) {
        return { ...filter, id, options: filter.options }
      }

      const unique = new Map<string, string>()
      for (const row of data) {
        const raw = (row as Record<string, unknown>)[id]
        const value = getCellLabel(raw)
        if (!unique.has(value)) unique.set(value, value)
      }

      return {
        ...filter,
        id,
        options: Array.from(unique.entries())
          .map(([value, label]) => ({ value, label }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      }
    })
  }, [data, filters])

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const activeFilterCount = columnFilters.reduce((count, filter) => {
    const value = filter.value
    if (Array.isArray(value)) return count + (value.length > 0 ? 1 : 0)
    if (typeof value === "string") return count + (value ? 1 : 0)
    return count
  }, 0)

  const searchValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? "")
    : globalFilter

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value
            if (searchKey) {
              table.getColumn(searchKey)?.setFilterValue(value)
            } else {
              setGlobalFilter(value)
            }
          }}
          className="max-w-sm bg-white"
        />

        {filterOptions.map((filter) => {
          const column = table.getColumn(filter.id)
          if (!column) return null
          const selected = (column.getFilterValue() as string[] | undefined) ?? []

          return (
            <DropdownMenu key={filter.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white">
                  <HugeiconsIcon icon={FilterAddIcon} strokeWidth={2} />
                  {filter.label}
                  {selected.length > 0 ? (
                    <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                      {selected.length}
                    </Badge>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter {filter.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filter.options.map((option) => {
                  const isChecked = selected.includes(option.value)
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...selected, option.value]
                          : selected.filter((v) => v !== option.value)
                        column.setFilterValue(next.length ? next : undefined)
                      }}
                      onSelect={(e) => e.preventDefault()}
                      className="capitalize"
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
                {selected.length > 0 ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={false}
                      onCheckedChange={() => column.setFilterValue(undefined)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      Clear
                    </DropdownMenuCheckboxItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}

        {activeFilterCount > 0 || searchValue ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-muted-foreground"
            onClick={() => {
              table.resetColumnFilters()
              setGlobalFilter("")
            }}
          >
            Reset
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.id === "select" ? "w-10" : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} of ${table.getFilteredRowModel().rows.length} selected`
            : `${table.getFilteredRowModel().rows.length} result(s)`}
        </p>
        <div className="flex items-center gap-2">
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
  )
}
