import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Download, FileText, FileJson, Search, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/ui';
import { exportCSV, exportPDF, downloadJSON } from '@/utils/exporters';
import { formatNumber } from '@/lib/adminData';

export default function DataTable({
  columns = [],
  data = [],
  searchable = true,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onExport,
  exportColumns,
  exportName = 'export',
  emptyMessage = 'No records found.',
  footer,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = data;
    if (search && searchKeys.length) {
      const needle = search.toLowerCase();
      rows = rows.filter((row) =>
        searchKeys.some((key) => String(key(row) ?? '').toLowerCase().includes(needle)),
      );
    }
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === bv) return 0;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
      });
    }
    return rows;
  }, [data, search, searchKeys, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportColumnsResolved = exportColumns || columns;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {searchable && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-9 bg-secondary/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
        {onExport !== false && (
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => exportCSV({ filename: exportName, rows: filtered, columns: exportColumnsResolved })}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportPDF({ filename: exportName, title: exportName, rows: filtered, columns: exportColumnsResolved })}>
              <FileText className="mr-1.5 h-3.5 w-3.5" /> PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => downloadJSON({ filename: exportName, data: filtered })}>
              <FileJson className="mr-1.5 h-3.5 w-3.5" /> JSON
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, idx) => {
                const key = typeof col === 'string' ? col : col.key;
                const sortable = typeof col !== 'string' && col.sortable !== false && typeof key === 'string';
                const label = typeof col === 'string' ? col : col.label;
                return (
                  <TableHead key={idx} className={col?.className}>
                    {sortable ? (
                      <button
                        onClick={() => toggleSort(key)}
                        className="inline-flex items-center gap-1 uppercase tracking-wide text-xs hover:text-foreground"
                      >
                        {label}
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      </button>
                    ) : (
                      label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  {columns.map((col, cellIdx) => {
                    const render = typeof col === 'string' ? null : col.render;
                    const key = typeof col === 'string' ? col : col.key;
                    const status = typeof col === 'string' ? false : col.status;
                    const badge = typeof col === 'string' ? false : col.badge;
                    const numeric = typeof col === 'string' ? null : col.numeric;
                    let cell;
                    if (render) cell = render(row);
                    else if (status) cell = <StatusBadge value={row[key]} />;
                    else if (badge) cell = <StatusBadge value={badge(row)} />;
                    else {
                      const val = row[key];
                      cell = numeric ? formatNumber(val) : (val === null || val === undefined ? '—' : String(val));
                    }
                    return (
                      <TableCell key={cellIdx} className={typeof col === 'string' ? undefined : col?.cellClassName}>
                        {cell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {footer}

      {filtered.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs">
              {safePage} / {totalPages}
            </span>
            <Button variant="outline" size="icon" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}