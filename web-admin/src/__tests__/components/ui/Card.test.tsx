import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card><span>Card content</span></Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<Card><span>Content</span></Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-200');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class"><span>Content</span></Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader><span>Header content</span></CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<CardHeader><span>Header</span></CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('px-6', 'py-4', 'border-b', 'border-gray-200');
  });

  it('applies custom className', () => {
    const { container } = render(<CardHeader className="custom-header"><span>Header</span></CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom-header');
  });
});

describe('CardBody', () => {
  it('renders children correctly', () => {
    render(<CardBody><span>Body content</span></CardBody>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('applies default styles', () => {
    const { container } = render(<CardBody><span>Body</span></CardBody>);
    const body = container.firstChild as HTMLElement;
    expect(body).toHaveClass('p-6');
  });

  it('applies custom className', () => {
    const { container } = render(<CardBody className="custom-body"><span>Body</span></CardBody>);
    const body = container.firstChild as HTMLElement;
    expect(body).toHaveClass('custom-body');
  });
});

describe('Card composition', () => {
  it('renders Card with Header and Body', () => {
    render(
      <Card>
        <CardHeader>Title</CardHeader>
        <CardBody>Content</CardBody>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
