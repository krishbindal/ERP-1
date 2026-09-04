'use client';

import * as React from 'react';
import { EntityField } from './types';
import { Select, Badge, Button, cn } from '@/components/ui';
import { CheckCircle2, AlertTriangle, Wand2, RotateCcw } from 'lucide-react';

export interface ColumnMapperProps {
  csvHeaders: string[];
  entityFields: EntityField[];
  mapping: Record<string, string>; // entityFieldKey -> csvHeader
  onChange: (mapping: Record<string, string>) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Normalizes a header or field name for fuzzy comparison:
 * lowercase, removes non-alphanumeric characters.
 */
export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Auto-matching heuristic matching CSV column headers to Entity Fields.
 */
export function autoMatchColumns(
  csvHeaders: string[],
  entityFields: EntityField[]
): Record<string, string> {
  const result: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  // Pass 1: Exact matches (case-insensitive) on field key or label
  for (const field of entityFields) {
    const normKey = normalizeName(field.key);
    const normLabel = normalizeName(field.label);

    const exactMatch = csvHeaders.find(
      (h) => !usedHeaders.has(h) && (normalizeName(h) === normKey || normalizeName(h) === normLabel)
    );

    if (exactMatch) {
      result[field.key] = exactMatch;
      usedHeaders.add(exactMatch);
    }
  }

  // Pass 2: Alias matches
  for (const field of entityFields) {
    if (result[field.key]) continue; // already matched

    const aliases = (field.aliases || []).map(normalizeName);
    const aliasMatch = csvHeaders.find((h) => {
      if (usedHeaders.has(h)) return false;
      const normH = normalizeName(h);
      return aliases.includes(normH);
    });

    if (aliasMatch) {
      result[field.key] = aliasMatch;
      usedHeaders.add(aliasMatch);
    }
  }

  // Pass 3: Substring / Prefix match (e.g. 'firstname' in 'studentfirstname')
  for (const field of entityFields) {
    if (result[field.key]) continue;

    const normKey = normalizeName(field.key);
    const normLabel = normalizeName(field.label);

    const subMatch = csvHeaders.find((h) => {
      if (usedHeaders.has(h)) return false;
      const normH = normalizeName(h);
      return (
        (normH.length > 2 && normKey.includes(normH)) ||
        (normKey.length > 2 && normH.includes(normKey)) ||
        (normLabel.length > 2 && normH.includes(normLabel))
      );
    });

    if (subMatch) {
      result[field.key] = subMatch;
      usedHeaders.add(subMatch);
    }
  }

  return result;
}

export function ColumnMapper({
  csvHeaders,
  entityFields,
  mapping,
  onChange,
  disabled = false,
  className,
}: ColumnMapperProps) {
  // Compute required fields status
  const requiredFields = entityFields.filter((f) => f.required);
  const mappedRequiredFields = requiredFields.filter((f) => !!mapping[f.key]);
  const allRequiredMapped = mappedRequiredFields.length === requiredFields.length;
  const missingRequired = requiredFields.filter((f) => !mapping[f.key]);

  const selectOptions = React.useMemo(() => {
    return [
      { value: '', label: '-- Do not import / Skip --' },
      ...csvHeaders.map((header) => ({
        value: header,
        label: header,
      })),
    ];
  }, [csvHeaders]);

  const handleFieldChange = (fieldKey: string, selectedHeader: string) => {
    const updated = { ...mapping };
    if (selectedHeader) {
      updated[fieldKey] = selectedHeader;
    } else {
      delete updated[fieldKey];
    }
    onChange(updated);
  };

  const handleAutoMatch = () => {
    const autoMapped = autoMatchColumns(csvHeaders, entityFields);
    onChange(autoMapped);
  };

  const handleClearAll = () => {
    onChange({});
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Action and Summary Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Column Mapping</span>
          <Badge
            variant={allRequiredMapped ? 'success' : 'warning'}
            className="text-xs"
          >
            {allRequiredMapped ? (
              <>
                <CheckCircle2 className="h-3 w-3 inline mr-1" aria-hidden="true" />
                All Required Mapped ({mappedRequiredFields.length}/{requiredFields.length})
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 inline mr-1" aria-hidden="true" />
                Missing Required ({mappedRequiredFields.length}/{requiredFields.length})
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleAutoMatch}
            disabled={disabled || csvHeaders.length === 0}
            leftIcon={<Wand2 className="h-3.5 w-3.5 text-primary" />}
          >
            Auto-Match
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleClearAll}
            disabled={disabled || Object.keys(mapping).length === 0}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Missing Required Fields Alert */}
      {!allRequiredMapped && missingRequired.length > 0 && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning-foreground"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">Required Fields Unmapped</p>
            <p className="mt-0.5 text-muted-foreground">
              Please map the following required fields to proceed:{' '}
              <strong className="text-foreground">
                {missingRequired.map((f) => f.label).join(', ')}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Field Mapping Rows */}
      <div className="rounded-xl border border-border bg-surface divide-y divide-border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="md:col-span-6">Target Entity Field</div>
          <div className="md:col-span-6">Source Spreadsheet Column</div>
        </div>

        {entityFields.map((field) => {
          const mappedColumn = mapping[field.key] || '';
          const isMapped = Boolean(mappedColumn);

          return (
            <div
              key={field.key}
              className={cn(
                'grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3.5 items-center transition-colors',
                isMapped ? 'bg-surface' : 'bg-muted/10'
              )}
            >
              {/* Target Field Info */}
              <div className="md:col-span-6 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {field.label}
                  </span>
                  {field.required ? (
                    <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                      Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                      Optional
                    </Badge>
                  )}
                  {isMapped && (
                    <span className="text-success text-xs font-medium inline-flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    </span>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>

              {/* CSV Column Selector */}
              <div className="md:col-span-6">
                <Select
                  id={`mapping-${field.key}`}
                  aria-label={`Map column for ${field.label}`}
                  value={mappedColumn}
                  disabled={disabled}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  options={selectOptions}
                  className={cn(
                    'text-xs py-1.5',
                    isMapped && 'border-primary/50 font-medium'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
