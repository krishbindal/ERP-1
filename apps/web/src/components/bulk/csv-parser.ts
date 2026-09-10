import { CsvParseResult } from './types';

/**
 * Detect the delimiter from sample text lines.
 * Favors comma, then tab, then semicolon.
 */
export function detectDelimiter(sampleText: string): string {
  const lines = sampleText.split(/\r?\n/).filter((l) => l.trim().length > 0).slice(0, 5);
  if (lines.length === 0) return ',';

  const candidates = [',', '\t', ';'];
  let bestDelimiter = ',';
  let bestScore = -1;

  for (const delim of candidates) {
    const counts = lines.map((line) => {
      let count = 0;
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') inQuote = !inQuote;
        else if (!inQuote && line[i] === delim) count++;
      }
      return count;
    });

    const nonZeroCounts = counts.filter((c) => c > 0);
    if (nonZeroCounts.length > 0) {
      // Check consistency (low variance)
      const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
      if (avg > bestScore) {
        bestScore = avg;
        bestDelimiter = delim;
      }
    }
  }

  return bestDelimiter;
}

/**
 * Standard RFC 4180 CSV / TSV parser.
 * Handles quoted fields containing delimiters, escaped quotes, and newlines.
 */
export function parseCsv(
  text: string,
  options: { maxPreviewRows?: number; delimiter?: string } = {}
): CsvParseResult {
  const maxPreviewRows = options.maxPreviewRows ?? 5;

  // Strip BOM if present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  if (!cleanText.trim()) {
    return {
      headers: [],
      previewRows: [],
      totalRows: 0,
      delimiter: ',',
      error: 'The uploaded file is empty.',
    };
  }

  const delimiter = options.delimiter || detectDelimiter(cleanText);

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  let i = 0;

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }

    // Not inside quotes
    if (char === '"') {
      inQuotes = true;
      i++;
    } else if (char === delimiter) {
      currentRow.push(currentCell.trim());
      currentCell = '';
      i++;
    } else if (char === '\r') {
      if (nextChar === '\n') {
        i++; // skip \r of \r\n
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      // Only push non-empty rows
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
    } else if (char === '\n') {
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
    } else {
      currentCell += char;
      i++;
    }
  }

  // Push remainder
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) {
    return {
      headers: [],
      previewRows: [],
      totalRows: 0,
      delimiter,
      error: 'No tabular records were found in the file.',
    };
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map((h, idx) => h || `Column ${idx + 1}`);
  const dataRows = rows.slice(1);

  // Normalize row length to match headers length
  const normalizedDataRows = dataRows.map((row) => {
    if (row.length === headers.length) return row;
    if (row.length < headers.length) {
      return [...row, ...new Array(headers.length - row.length).fill('')];
    }
    return row.slice(0, headers.length);
  });

  return {
    headers,
    previewRows: normalizedDataRows.slice(0, maxPreviewRows),
    totalRows: normalizedDataRows.length,
    delimiter,
  };
}

/**
 * Generate sample CSV template for students import.
 */
export function generateStudentCsvTemplate(): string {
  const headers = [
    'First Name',
    'Last Name',
    'Middle Name',
    'Date of Birth',
    'Gender',
    'Admission Number',
    'Grade / Class',
    'Guardian Name',
    'Guardian Contact',
  ];

  const sampleRows = [
    ['Jane', 'Doe', 'Elizabeth', '2012-05-14', 'Female', 'ADM-2026-001', 'Grade 6', 'Sarah Doe', '+1-555-0101'],
    ['Alex', 'Smith', 'Robert', '2011-09-22', 'Male', 'ADM-2026-002', 'Grade 7', 'David Smith', '+1-555-0102'],
    ['Priya', 'Patel', '', '2013-01-30', 'Female', 'ADM-2026-003', 'Grade 5', 'Raj Patel', '+1-555-0103'],
  ];

  const lines = [
    headers.join(','),
    ...sampleRows.map((row) =>
      row.map((cell) => (cell.includes(',') ? `"${cell}"` : cell)).join(',')
    ),
  ];

  return lines.join('\r\n');
}
