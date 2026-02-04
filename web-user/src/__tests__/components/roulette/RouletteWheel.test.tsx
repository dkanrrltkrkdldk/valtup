import { render, screen, act } from '@testing-library/react';
import { RouletteWheel } from '@/components/roulette/RouletteWheel';

jest.useFakeTimers();

describe('RouletteWheel', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders roulette wheel with segments', () => {
    render(<RouletteWheel isSpinning={false} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });

  it('applies spinning animation when isSpinning is true', () => {
    const { container } = render(<RouletteWheel isSpinning={true} />);
    const wheel = container.querySelector('.rounded-full');
    expect(wheel).toHaveStyle({ transition: 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' });
  });

  it('does not apply animation when isSpinning is false', () => {
    const { container } = render(<RouletteWheel isSpinning={false} />);
    const wheel = container.querySelector('.rounded-full');
    expect(wheel).toHaveStyle({ transition: 'none' });
  });

  it('accepts onSpinEnd callback prop', () => {
    const handleSpinEnd = jest.fn();
    const { container } = render(
      <RouletteWheel isSpinning={true} onSpinEnd={handleSpinEnd} />
    );
    
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('does not call onSpinEnd when not spinning', () => {
    const handleSpinEnd = jest.fn();
    render(<RouletteWheel isSpinning={false} onSpinEnd={handleSpinEnd} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(handleSpinEnd).not.toHaveBeenCalled();
  });

  it('renders pointer indicator', () => {
    const { container } = render(<RouletteWheel isSpinning={false} />);
    const pointer = container.querySelector('.border-t-indigo-600');
    expect(pointer).toBeInTheDocument();
  });
});
