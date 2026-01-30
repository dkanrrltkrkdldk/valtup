import { render, screen } from '@testing-library/react';
import { Card, CardBody } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-100');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    
    expect(card).toHaveClass('custom-class');
  });
});

describe('CardBody', () => {
  it('renders children', () => {
    render(
      <CardBody>
        <div>Body Content</div>
      </CardBody>
    );
    
    expect(screen.getByText('Body Content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardBody>Content</CardBody>);
    const body = container.firstChild;
    
    expect(body).toHaveClass('p-4');
  });

  it('applies custom className', () => {
    const { container } = render(<CardBody className="custom-body">Content</CardBody>);
    const body = container.firstChild;
    
    expect(body).toHaveClass('custom-body');
  });
});
