import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search, MoreHorizontal } from 'lucide-react';
import { TableColumn, TableAction } from '../types/api';
import { Button } from './ui/Button';

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  loading = false,
  emptyMessage = "No data available"
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getValue = (item: T, key: keyof T | string): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], item);
    }
    return item[key as keyof T];
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = getValue(a, sortConfig.key!);
      const bValue = getValue(b, sortConfig.key!);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const filteredData = React.useMemo(() => {
    if (!searchQuery || onSearch) return sortedData;

    return sortedData.filter(item =>
      columns.some(column => {
        const value = getValue(item, column.key);
        return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      })
    );
  }, [sortedData, searchQuery, columns, onSearch]);

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-8 text-center">
          <div className="animate-spin mx-auto h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {filteredData.length === 0 ? (
        <div className="p-8 text-center text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key as string}
                    className={`
                      px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider
                      ${column.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}
                      ${column.width ? `w-${column.width}` : ''}
                    `}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp 
                            size={12} 
                            className={`
                              ${sortConfig.key === column.key && sortConfig.direction === 'asc' 
                                ? 'text-blue-600' 
                                : 'text-slate-300'
                              }
                            `} 
                          />
                          <ChevronDown 
                            size={12} 
                            className={`
                              ${sortConfig.key === column.key && sortConfig.direction === 'desc' 
                                ? 'text-blue-600' 
                                : 'text-slate-300'
                              }
                            `} 
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {actions.length > 0 && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((column) => {
                    const value = getValue(item, column.key);
                    return (
                      <td key={column.key as string} className="px-6 py-4 whitespace-nowrap text-sm">
                        {column.render ? column.render(value, item) : (
                          <span className="text-slate-900">
                            {value?.toString() || '-'}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, actionIndex) => {
                          if (action.show && !action.show(item)) return null;
                          
                          return (
                            <Button
                              key={actionIndex}
                              size="sm"
                              variant={action.variant || 'secondary'}
                              onClick={() => action.onClick(item)}
                              className="text-xs"
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}