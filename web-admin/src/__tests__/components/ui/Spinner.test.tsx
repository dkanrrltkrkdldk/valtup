import { describe, it, expect } from 'vitest';
import { render, screen } from '@/__tests__/test-utils';
import { Spinner, LoadingScreen } from '@/components/ui/Spinner';

describe('Spinner', () => {
  it('renders SVG spinner', () => {
    render(<Spinner />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    render(<Spinner />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('applies small size styles', () => {
    render(<Spinner size="sm" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies large size styles', () => {
    render(<Spinner size="lg" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies animation class', () => {
    render(<Spinner />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('applies default color', () => {
    render(<Spinner />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('text-indigo-600');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveClass('custom-spinner');
  });

  it('renders circle and path elements', () => {
    render(<Spinner />);
    const circle = document.querySelector('circle');
    const path = document.querySelector('path');
    expect(circle).toBeInTheDocument();
    expect(path).toBeInTheDocument();
  });
});

describe('LoadingScreen', () => {
  it('renders container with Spinner', () => {
    render(<LoadingScreen />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('h-12', 'w-12'); // Large size
  });

  it('applies flex centering styles', () => {
    const { container } = render(<LoadingScreen />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[200px]');
  });
});
