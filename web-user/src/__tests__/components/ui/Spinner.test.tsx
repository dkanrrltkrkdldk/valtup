import { render, screen } from '@testing-library/react';
import { Spinner, LoadingScreen } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders with default size (md)', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    render(<Spinner size="sm" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    render(<Spinner size="lg" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-class" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  it('has animation class', () => {
    render(<Spinner />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });
});

describe('LoadingScreen', () => {
  it('renders a large spinner', () => {
    render(<LoadingScreen />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('renders centered container', () => {
    const { container } = render(<LoadingScreen />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
