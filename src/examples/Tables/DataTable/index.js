import { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTable, usePagination, useGlobalFilter, useSortBy, useRowSelect, useAsyncDebounce } from "react-table";
import { Table, TableBody, TableContainer, TableRow, Checkbox, Menu, MenuItem } from "@mui/material";
import { Autocomplete } from "@mui/material";  // ✅ Import Autocomplete from MUI
import Icon from "@mui/material/Icon";         // ✅ Import Icon from MUI
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
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
  const defaultValue = entriesPerPage?.defaultValue || 10;
  const entries = entriesPerPage?.entries ? entriesPerPage.entries.map((el) => el.toString()) : ["5", "10", "15", "20", "25"];

  const columns = useMemo(() => [
    {
      id: "selection",
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <Checkbox {...getToggleAllRowsSelectedProps()} />
      ),
      accessor: "selection",
      width: "5%",
    },
    ...table.columns,
  ], [table.columns]);

  const data = useMemo(() => table.rows, [table]);

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

  useEffect(() => setPageSize(defaultValue || 10), [defaultValue]);

  const selectedRowsCount = Object.keys(selectedRowIds).length;

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {/* ✅ Keep only the customHeader (Search & Filter now in ClientsData) */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        {/* Bulk Action Menu (Only if rows selected) */}
        {selectedRowsCount > 0 ? (
          <Menu open={true} onClose={() => {}}>
            <MenuItem onClick={() => console.log("Editing selected rows", selectedRowIds)}>Edit</MenuItem>
            <MenuItem onClick={() => console.log("Deleting selected rows", selectedRowIds)}>Delete</MenuItem>
          </Menu>
        ) : (
          <div />
        )}

        {/* Right: Custom Header (Search, Filter, Add Button) */}
        {customHeader}
      </MDBox>

      {/* ✅ Table Content */}
      <Table {...getTableProps()}>
        <MDBox component="thead">
          {headerGroups.map((headerGroup, key) => (
            <TableRow key={key} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <DataTableHeadCell
                  key={idx}
                  {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                  width={column.width ? column.width : "auto"}
                  align={column.align ? column.align : "left"}
                  sorted={isSorted && column.isSorted ? (column.isSortedDesc ? "desc" : "asce") : "none"}
                >
                  {column.render("Header")}
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>
        <TableBody {...getTableBodyProps()}>
          {page.map((row, key) => {
            prepareRow(row);
            return (
              <TableRow key={key} {...row.getRowProps()}>
                {row.cells.map((cell, idx) => (
                  <DataTableBodyCell
                    key={idx}
                    noBorder={noEndBorder && rows.length - 1 === key}
                    align={cell.column.align ? cell.column.align : "left"}
                    {...cell.getCellProps()}
                  >
                    {cell.column.id === "selection" ? (
                      <Checkbox {...row.getToggleRowSelectedProps()} />
                    ) : (
                      cell.render("Cell")
                    )}
                  </DataTableBodyCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* ✅ Pagination */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        {showTotalEntries && (
          <MDTypography variant="button" color="secondary">
            Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, rows.length)} of {rows.length} entries
          </MDTypography>
        )}

        <MDBox display="flex" alignItems="center">
          <Autocomplete
            disableClearable
            value={pageSize.toString()}
            options={entries}
            onChange={(event, newValue) => setPageSize(parseInt(newValue, 10))}
            size="small"
            sx={{ width: "5rem", marginRight: 2 }}
            renderInput={(params) => <MDInput {...params} />}
          />
          <MDTypography variant="caption" color="secondary">entries per page</MDTypography>

          <MDPagination variant={pagination?.variant || "gradient"} color={pagination?.color || "info"}>
            {canPreviousPage && <MDPagination item onClick={() => previousPage()}><Icon>chevron_left</Icon></MDPagination>}
            {canNextPage && <MDPagination item onClick={() => nextPage()}><Icon>chevron_right</Icon></MDPagination>}
          </MDPagination>
        </MDBox>
      </MDBox>
    </TableContainer>
  );
}

export default DataTable;
