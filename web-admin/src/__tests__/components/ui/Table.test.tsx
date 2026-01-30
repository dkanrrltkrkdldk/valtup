import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

describe('Table', () => {
  it('renders children correctly', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>Cell content</td>
          </tr>
        </tbody>
      </Table>
    );
    expect(screen.getByText('Cell content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <Table>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </Table>
    );
    const table = screen.getByRole('table');
    expect(table).toHaveClass('min-w-full', 'divide-y', 'divide-gray-200');
  });

  it('applies custom className', () => {
    render(
      <Table className="custom-table">
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </Table>
    );
    expect(screen.getByRole('table')).toHaveClass('custom-table');
  });

  it('wraps table in overflow container', () => {
    const { container } = render(
      <Table>
        <tbody>
          <tr>
            <td>Content</td>
          </tr>
        </tbody>
      </Table>
    );
    expect(container.firstChild).toHaveClass('overflow-x-auto');
  });
});

describe('TableHeader', () => {
  it('renders children correctly', () => {
    render(
      <table>
        <TableHeader>
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <table>
        <TableHeader>
          <tr>
            <th>Header</th>
          </tr>
        </TableHeader>
      </table>
    );
    const thead = document.querySelector('thead');
    expect(thead).toHaveClass('bg-gray-50');
  });
});

describe('TableBody', () => {
  it('renders children correctly', () => {
    render(
      <table>
        <TableBody>
          <tr>
            <td>Body content</td>
          </tr>
        </TableBody>
      </table>
    );
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <table>
        <TableBody>
          <tr>
            <td>Content</td>
          </tr>
        </TableBody>
      </table>
    );
    const tbody = document.querySelector('tbody');
    expect(tbody).toHaveClass('bg-white', 'divide-y', 'divide-gray-200');
  });
});

describe('TableRow', () => {
  it('renders children correctly', () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>Row content</td>
          </TableRow>
        </tbody>
      </table>
    );
    expect(screen.getByText('Row content')).toBeInTheDocument();
  });

  it('applies hover styles', () => {
    render(
      <table>
        <tbody>
          <TableRow>
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );
    const row = screen.getByRole('row');
    expect(row).toHaveClass('hover:bg-gray-50');
  });

  it('applies custom className', () => {
    render(
      <table>
        <tbody>
          <TableRow className="custom-row">
            <td>Content</td>
          </TableRow>
        </tbody>
      </table>
    );
    expect(screen.getByRole('row')).toHaveClass('custom-row');
  });
});

describe('TableHead', () => {
  it('renders children correctly', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Column</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByText('Column')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead>Column</TableHead>
          </tr>
        </thead>
      </table>
    );
    const th = screen.getByRole('columnheader');
    expect(th).toHaveClass('px-6', 'py-3', 'text-left', 'text-xs', 'font-medium', 'text-gray-500', 'uppercase', 'tracking-wider');
  });

  it('applies custom className', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead className="custom-head">Column</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole('columnheader')).toHaveClass('custom-head');
  });

  it('forwards additional props', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHead colSpan={2}>Column</TableHead>
          </tr>
        </thead>
      </table>
    );
    expect(screen.getByRole('columnheader')).toHaveAttribute('colspan', '2');
  });
});

describe('TableCell', () => {
  it('renders children correctly', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Cell data</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByText('Cell data')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell>Data</TableCell>
          </tr>
        </tbody>
      </table>
    );
    const td = screen.getByRole('cell');
    expect(td).toHaveClass('px-6', 'py-4', 'whitespace-nowrap', 'text-sm', 'text-gray-900');
  });

  it('applies custom className', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell className="custom-cell">Data</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveClass('custom-cell');
  });

  it('forwards additional props', () => {
    render(
      <table>
        <tbody>
          <tr>
            <TableCell colSpan={3}>Data</TableCell>
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveAttribute('colspan', '3');
  });
});

describe('Table composition', () => {
  it('renders complete table structure', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
