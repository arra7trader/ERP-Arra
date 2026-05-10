'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TableSkeleton, EmptyState } from './loading';

export interface Column<T> {
  key: string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  // Pagination
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  // Selection
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  // Actions
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading,
  error,
  onRetry,
  emptyMessage = 'No data found',
  emptyAction,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  selectable,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => (row.id as string) || String(row),
  onRowClick,
  rowActions,
  sortBy,
  sortOrder = 'asc',
  onSort,
  searchable,
  searchPlaceholder = 'Search...',
  onSearch,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleSort = (column: string) => {
    if (!onSort) return;
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(column, newOrder);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getRowId));
    }
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isPartiallySelected = selectedRows.length > 0 && selectedRows.length < data.length;

  if (error) {
    return (
      <div className="rounded-lg border p-8">
        <EmptyState
          title="Error loading data"
          description={error.message}
          action={onRetry ? { label: 'Try again', onClick: onRetry } : undefined}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full max-w-sm px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        {isLoading ? (
          <TableSkeleton rows={pageSize} columns={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} />
        ) : data.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={emptyMessage}
              action={emptyAction}
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              }
            />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {selectable && (
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && sortBy === column.key && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && (
                  <th className="px-4 py-3 w-24 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.includes(rowId);
                
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                      isSelected && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900 dark:text-gray-100',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.cell 
                          ? column.cell(row) 
                          : (row[column.key] as React.ReactNode)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {onPageChange && totalItems && totalItems > pageSize && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={cn(
                    'px-3 py-1 text-sm border rounded-md',
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[variant]
    )}>
      {status}
    </span>
  );
}

// Helper to get status variant
export function getStatusVariant(status: string): StatusBadgeProps['variant'] {
  const statusMap: Record<string, StatusBadgeProps['variant']> = {
    // General
    active: 'success',
    inactive: 'default',
    enabled: 'success',
    disabled: 'default',
    
    // Lead status
    new: 'info',
    contacted: 'info',
    qualified: 'warning',
    converted: 'success',
    lost: 'danger',
    
    // Order status
    draft: 'default',
    confirmed: 'info',
    shipped: 'warning',
    completed: 'success',
    cancelled: 'danger',
    
    // Invoice status
    sent: 'info',
    paid: 'success',
    overdue: 'danger',
    
    // Approval status
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    
    // Attendance
    present: 'success',
    absent: 'danger',
    late: 'warning',
    'half-day': 'info',
  };

  return statusMap[status.toLowerCase()] || 'default';
}
