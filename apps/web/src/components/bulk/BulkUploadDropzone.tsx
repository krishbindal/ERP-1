'use client';

import * as React from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, RotateCcw } from 'lucide-react';
import { Button, Badge, cn } from '@/components/ui';

export interface BulkUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileClear?: () => void;
  onError?: (errorMessage: string) => void;
  acceptedExtensions?: string[];
  maxSizeBytes?: number;
  currentFile?: File | null;
  disabled?: boolean;
  className?: string;
}

export const DEFAULT_ACCEPTED_EXTENSIONS = ['.csv', '.tsv', '.xlsx'];
export const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(
  file: File,
  acceptedExtensions: string[],
  maxSizeBytes: number
): { valid: boolean; error?: string } {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = acceptedExtensions.some((ext) =>
    fileName.endsWith(ext.toLowerCase())
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a file with one of these extensions: ${acceptedExtensions.join(', ')}.`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds the limit of ${formatFileSize(maxSizeBytes)} (uploaded: ${formatFileSize(file.size)}).`,
    };
  }

  return { valid: true };
}

export function BulkUploadDropzone({
  onFileSelect,
  onFileClear,
  onError,
  acceptedExtensions = DEFAULT_ACCEPTED_EXTENSIONS,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  currentFile = null,
  disabled = false,
  className,
}: BulkUploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const dropzoneId = React.useId();
  const errorId = `${dropzoneId}-error`;
  const descId = `${dropzoneId}-desc`;

  const handleProcessFile = React.useCallback(
    (file: File) => {
      setErrorMessage(null);
      const validation = validateFile(file, acceptedExtensions, maxSizeBytes);
      if (!validation.valid && validation.error) {
        setErrorMessage(validation.error);
        onError?.(validation.error);
        return;
      }
      onFileSelect(file);
    },
    [acceptedExtensions, maxSizeBytes, onFileSelect, onError]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    },
    []
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleProcessFile(files[0]);
      }
    },
    [disabled, handleProcessFile]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
    // Reset the input value so the same file can be re-selected if desired
    e.target.value = '';
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrorMessage(null);
    onFileClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  const acceptString = acceptedExtensions.join(',');

  return (
    <div className={cn('w-full space-y-3', className)}>
      <input
        ref={fileInputRef}
        type="file"
        id={dropzoneId}
        accept={acceptString}
        disabled={disabled}
        onChange={handleFileInputChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* State: File Loaded */}
      {currentFile && !errorMessage ? (
        <div
          role="region"
          aria-label="Loaded upload file summary"
          className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {currentFile.name}
                  </p>
                  <Badge variant="success" className="shrink-0 text-[11px]">
                    <CheckCircle className="h-3 w-3 inline mr-1" aria-hidden="true" />
                    Ready
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(currentFile.size)} • {currentFile.type || 'Tabular Data'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleBrowseClick}
                disabled={disabled}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Replace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleClearFile}
                disabled={disabled}
                aria-label="Remove selected file"
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* State: Idle / Drag-Over / Error */
        <div
          role="region"
          aria-label="File upload dropzone"
          aria-describedby={errorMessage ? errorId : descId}
          tabIndex={disabled ? -1 : 0}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onClick={handleBrowseClick}
          className={cn(
            'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer select-none focus-ring',
            disabled && 'opacity-60 cursor-not-allowed bg-muted/30 border-border',
            isDragOver
              ? 'border-primary bg-primary/5 shadow-inner scale-[0.99]'
              : errorMessage
              ? 'border-destructive/60 bg-destructive/5 hover:border-destructive'
              : 'border-border hover:border-muted-foreground/50 hover:bg-surface/50'
          )}
        >
          <div
            className={cn(
              'mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-105',
              errorMessage
                ? 'bg-destructive/10 text-destructive'
                : isDragOver
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {errorMessage ? (
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Upload className="h-6 w-6" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-semibold text-foreground">
              {isDragOver
                ? 'Drop your file here to upload'
                : errorMessage
                ? 'File upload problem'
                : 'Drag and drop your spreadsheet here'}
            </p>
            <p id={descId} className="text-xs text-muted-foreground">
              Supports {acceptedExtensions.join(', ')} files up to {formatFileSize(maxSizeBytes)}
            </p>
          </div>

          <div className="mt-4">
            <Button
              variant={errorMessage ? 'secondary' : 'primary'}
              size="sm"
              type="button"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
            >
              {errorMessage ? 'Try Another File' : 'Browse Files'}
            </Button>
          </div>
        </div>
      )}

      {/* Accessible Error Announcement */}
      {errorMessage && (
        <div
          id={errorId}
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-destructive/70 hover:text-destructive focus-ring rounded p-0.5"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
