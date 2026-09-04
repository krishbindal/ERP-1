'use client';

import * as React from 'react';
import { Badge, cn } from '@/components/ui';
import { EntityField } from './types';
import { FileSpreadsheet, Info } from 'lucide-react';

export interface CsvPreviewTableProps {
  headers: string[];
  rows: string[][];
  totalRows: number;
  maxPreviewRows?: number;
  columnMapping?: Record<string, string>; // entityFieldKey -> csvHeader
  entityFields?: EntityField[];
  delimiter?: string;
  className?: string;
}

export function CsvPreviewTable({
  headers,
  rows,
  totalRows,
  maxPreviewRows = 5,
  columnMapping,
  entityFields,
  delimiter = ',',
  className,
}: CsvPreviewTableProps) {
  // Create a fast reverse lookup: csvHeader -> EntityField
  const csvToFieldMap = React.useMemo(() => {
    if (!columnMapping || !entityFields) return new Map<string, EntityField>();
    const map = new Map<string, EntityField>();
    for (const [fieldKey, csvHeader] of Object.entries(columnMapping)) {
      if (!csvHeader) continue;
      const field = entityFields.find((f) => f.key === fieldKey);
      if (field) {
        map.set(csvHeader, field);
      }
    }
    return map;
  }, [columnMapping, entityFields]);

  const previewRows = rows.slice(0, maxPreviewRows);

  if (headers.length === 0) {
    return (
      <div
        role="region"
        aria-label="CSV Preview"
        className={cn(
          'rounded-xl border border-dashed border-border p-8 text-center bg-surface/50',
          className
        )}
      >
        <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">No spreadsheet data loaded</p>
        <p className="text-xs text-muted-foreground mt-1">Upload a CSV or TSV file to preview its headers and rows.</p>
      </div>
    );
  }

  const delimiterName =
    delimiter === '\t' ? 'Tab-separated' : delimiter === ';' ? 'Semicolon-separated' : 'Comma-separated';

  return (
    <div
      role="region"
      aria-label="Data Preview Table"
      className={cn('space-y-3', className)}
    >
      {/* Table Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Data Preview</span>
          <Badge variant="default" className="text-xs font-medium">
            {headers.length} {headers.length === 1 ? 'Column' : 'Columns'}
          </Badge>
          <Badge variant="default" className="text-xs font-medium">
            {totalRows} {totalRows === 1 ? 'Row' : 'Rows'} detected
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <span>
            Showing first {Math.min(previewRows.length, totalRows)} rows ({delimiterName})
          </span>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/60 border-b border-border text-foreground font-semibold">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-center text-muted-foreground font-medium border-r border-border/50">
                #
              </th>
              {headers.map((header, idx) => {
                const mappedField = csvToFieldMap.get(header);
                return (
                  <th
                    key={`header-${idx}-${header}`}
                    scope="col"
                    className="px-4 py-3 min-w-[140px] align-top"
                  >
                    <div className="space-y-1">
                      <div className="text-foreground font-medium truncate" title={header}>
                        {header}
                      </div>
                      {columnMapping && (
                        <div>
                          {mappedField ? (
                            <span
                              className={cn(
                                'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border truncate max-w-full',
                                mappedField.required
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-secondary text-secondary-foreground border-border'
                              )}
                              title={`Mapped to: ${mappedField.label}`}
                            >
                              ➔ {mappedField.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-muted-foreground bg-muted border border-border/50">
                              Unmapped
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {previewRows.length > 0 ? (
              previewRows.map((row, rowIdx) => (
                <tr
                  key={`row-${rowIdx}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2.5 text-center text-muted-foreground font-mono text-[11px] border-r border-border/50 bg-muted/20">
                    {rowIdx + 1}
                  </td>
                  {headers.map((_, colIdx) => {
                    const cellValue = row[colIdx];
                    const hasValue = cellValue !== undefined && cellValue !== null && cellValue.trim() !== '';
                    return (
                      <td
                        key={`cell-${rowIdx}-${colIdx}`}
                        className="px-4 py-2.5 text-foreground max-w-[240px] truncate"
                        title={hasValue ? cellValue : undefined}
                      >
                        {hasValue ? (
                          cellValue
                        ) : (
                          <span className="text-muted-foreground/40 italic font-mono text-[11px]">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers.length + 1}
                  className="px-6 py-8 text-center text-muted-foreground"
                >
                  No data rows found below the header row.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
