import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultModal } from '@/components/roulette/ResultModal';

describe('ResultModal', () => {
  it('displays win message when isWin is true', () => {
    render(
      <ResultModal
        isOpen={true}
        onClose={() => {}}
        pointAmount={500}
        isWin={true}
      />
    );

    expect(screen.getByText('축하합니다!')).toBeInTheDocument();
    expect(screen.getByText('500P')).toBeInTheDocument();
    expect(screen.getByText('포인트를 획득하셨습니다!')).toBeInTheDocument();
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  it('displays lose message when isWin is false', () => {
    render(
      <ResultModal
        isOpen={true}
        onClose={() => {}}
        pointAmount={0}
        isWin={false}
      />
    );

    expect(screen.getByText('아쉽네요!')).toBeInTheDocument();
    expect(screen.getByText(/오늘의 예산이 모두 소진되었습니다/)).toBeInTheDocument();
    expect(screen.getByText('😢')).toBeInTheDocument();
  });

  it('calls onClose when confirm button is clicked', async () => {
    const handleClose = jest.fn();
    render(
      <ResultModal
        isOpen={true}
        onClose={handleClose}
        pointAmount={500}
        isWin={true}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('formats large point amounts with comma', () => {
    render(
      <ResultModal
        isOpen={true}
        onClose={() => {}}
        pointAmount={1000}
        isWin={true}
      />
    );

    expect(screen.getByText('1,000P')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ResultModal
        isOpen={false}
        onClose={() => {}}
        pointAmount={500}
        isWin={true}
      />
    );

    expect(screen.queryByText('축하합니다!')).not.toBeInTheDocument();
  });
});
