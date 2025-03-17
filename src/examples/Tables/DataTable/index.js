import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
  useRowSelect,
} from "react-table";
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  Checkbox,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDPagination from "components/MDPagination";
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function DataTable({
  entriesPerPage,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,
  customHeader,
}) {
  // Default entries per page
  const defaultValue = entriesPerPage?.defaultValue || 10;
  const data = useMemo(() => table.rows, [table.rows]);

  // Use state so that changes to selection trigger a re-render.
  const [selectedCount, setSelectedCount] = useState(0);

  // Stable menu open handlers.
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Create the table instance without including selectedCount in columns.
  // Instead, update selectedCount separately.
  const columns = useMemo(
    () => [
      {
        id: "selection",
        disableSortBy: true, // Disable sorting for this column
        Header: ({ getToggleAllRowsSelectedProps }) => {
          const toggleProps = getToggleAllRowsSelectedProps();
          return (
            <MDBox display="flex" alignItems="center">
              <Checkbox
                {...toggleProps}
                sx={{ color: selectedCount > 0 ? "green" : "inherit" }}
              />
              {selectedCount > 0 && (
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
              )}
            </MDBox>
          );
        },
        accessor: "selection",
        width: "5%",
        Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />,
      },
      ...table.columns,
    ],
    [table.columns, handleMenuOpen, selectedCount]
  );

  // Create table instance.
  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, selectedRowIds },
  } = tableInstance;

  // Update our selectedCount state whenever selection changes.
  useEffect(() => {
    setSelectedCount(Object.keys(selectedRowIds).length);
  }, [selectedRowIds]);

  // Set the page size once.
  useEffect(() => {
    setPageSize(defaultValue);
  }, [defaultValue, setPageSize]);

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {/* Optional custom header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        {customHeader}
      </MDBox>

      {/* Main table */}
      <Table {...getTableProps()}>
        <MDBox component="thead">
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                // For the selection column, do not add sort toggle props.
                const headerProps =
                  column.id === "selection"
                    ? column.getHeaderProps()
                    : column.getHeaderProps(isSorted && column.getSortByToggleProps());
                return (
                  <DataTableHeadCell
                    key={column.id}
                    {...headerProps}
                    width={column.width || "auto"}
                    align={column.align || "left"}
                    sorted={
                      column.disableSortBy
                        ? "none"
                        : isSorted && column.isSorted
                        ? column.isSortedDesc
                          ? "desc"
                          : "asce"
                        : "none"
                    }
                  >
                    {column.render("Header")}
                  </DataTableHeadCell>
                );
              })}
            </TableRow>
          ))}
        </MDBox>

        <TableBody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <TableRow key={row.id} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <DataTableBodyCell
                    key={cell.column.id}
                    noBorder={noEndBorder && row.index === rows.length - 1}
                    align={cell.column.align || "left"}
                    {...cell.getCellProps()}
                  >
                    {cell.render("Cell")}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        {showTotalEntries && (
          <MDTypography variant="button" color="secondary">
            Showing {pageIndex * pageSize + 1} to{" "}
            {Math.min((pageIndex + 1) * pageSize, rows.length)} of {rows.length} entries
          </MDTypography>
        )}

        <MDBox display="flex" alignItems="center">
          <MDPagination variant={pagination?.variant || "gradient"} color={pagination?.color || "info"}>
            {canPreviousPage && (
              <MDPagination item onClick={() => previousPage()}>
                <span>chevron_left</span>
              </MDPagination>
            )}
            {canNextPage && (
              <MDPagination item onClick={() => nextPage()}>
                <span>chevron_right</span>
              </MDPagination>
            )}
          </MDPagination>
        </MDBox>
      </MDBox>

      {/* Bulk Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <MenuItem onClick={() => console.log("Editing selected", selectedRowIds)}>Edit</MenuItem>
        <MenuItem onClick={() => console.log("Deleting selected", selectedRowIds)}>Delete</MenuItem>
      </Menu>
    </TableContainer>
  );
}

export default DataTable;
