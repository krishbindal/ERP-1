import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Enable React 19 act environment for jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableEmpty,
  TableEmptyRow,
} from './Table';

describe('Table primitive', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  it('renders standard table structure with accessible thead, tbody, and scope="col"', async () => {
    await act(async () => {
      root.render(
        <Table containerClassName="custom-container">
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Row 1 Cell 1</TableCell>
              <TableCell>Row 1 Cell 2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    });

    const wrapper = container.querySelector('.custom-container');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toContain('overflow-x-auto');

    const table = container.querySelector('table');
    expect(table).not.toBeNull();

    const heads = container.querySelectorAll('th');
    expect(heads).toHaveLength(2);
    expect(heads[0].getAttribute('scope')).toBe('col');
    expect(heads[0].textContent).toBe('Column 1');

    const cells = container.querySelectorAll('td');
    expect(cells).toHaveLength(2);
    expect(cells[0].textContent).toBe('Row 1 Cell 1');

    const caption = container.querySelector('caption');
    expect(caption).not.toBeNull();
    expect(caption?.textContent).toBe('Test Table');
  });

  it('renders TableEmpty and TableEmptyRow when no data is present', async () => {
    await act(async () => {
      root.render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableEmptyRow
              colSpan={1}
              title="No records found"
              description="Try adjusting your search criteria."
            />
          </TableBody>
        </Table>
      );
    });

    const emptyCell = container.querySelector('td');
    expect(emptyCell?.getAttribute('colspan')).toBe('1');
    expect(container.textContent).toContain('No records found');
    expect(container.textContent).toContain('Try adjusting your search criteria.');
  });

  it('renders TableEmpty standalone container with custom title and action', async () => {
    await act(async () => {
      root.render(
        <TableEmpty
          title="Empty State Title"
          description="Empty State Description"
          action={<button type="button">Create New</button>}
        />
      );
    });

    expect(container.textContent).toContain('Empty State Title');
    expect(container.textContent).toContain('Empty State Description');
    expect(container.querySelector('button')?.textContent).toBe('Create New');
  });
});

