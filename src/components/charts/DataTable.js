import React, { useState, useMemo } from 'react';
import {
  Card, CardContent, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TableSortLabel, Paper, TextField,
  InputAdornment, IconButton, Tooltip as MuiTooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const DataTable = ({ title, data, loading, error, columns, onExportCsv, onExportPdf, pageSize: initialPageSize = 10 }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialPageSize);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-detect columns from data if not provided
  const cols = useMemo(() => {
    if (columns) return columns;
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      id: key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      numeric: typeof data[0][key] === 'number',
    }));
  }, [columns, data]);

  // Filter by search
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(val => String(val).toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return order === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, orderBy, order]);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
          <Typography variant="subtitle1" color="text.secondary">
            {title}{data ? ` (${filteredData.length} rows)` : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
              sx={{ width: 200 }}
            />
            {onExportCsv && (
              <MuiTooltip title="Export CSV">
                <IconButton size="small" onClick={onExportCsv}><FileDownloadIcon fontSize="small" /></IconButton>
              </MuiTooltip>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ py: 2, px: 1 }}>Error loading data</Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {cols.map((col) => (
                    <TableCell key={col.id} align={col.numeric ? 'right' : 'left'}
                               sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : 'asc'}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, rowIdx) => (
                  <TableRow key={rowIdx} hover>
                    {cols.map((col) => (
                      <TableCell key={col.id} align={col.numeric ? 'right' : 'left'}>
                        {row[col.id] !== null && row[col.id] !== undefined
                          ? (col.numeric ? Number(row[col.id]).toLocaleString() : String(row[col.id]))
                          : '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {paginatedData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={cols.length} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {data && data.length > 0 && (
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DataTable;
