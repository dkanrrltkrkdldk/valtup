import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 0,
    totalPages: 5,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination page={0} totalPages={1} onPageChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders previous and next buttons', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('이전')).toBeInTheDocument();
    expect(screen.getByText('다음')).toBeInTheDocument();
  });

  it('displays current page and total pages', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} page={0} />);
    
    expect(screen.getByText('이전')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} page={4} />);
    
    expect(screen.getByText('다음')).toBeDisabled();
  });

  it('enables both buttons when on middle page', () => {
    render(<Pagination {...defaultProps} page={2} />);
    
    expect(screen.getByText('이전')).not.toBeDisabled();
    expect(screen.getByText('다음')).not.toBeDisabled();
  });

  it('calls onPageChange with previous page when previous button is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByText('이전'));
    
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with next page when next button is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    
    fireEvent.click(screen.getByText('다음'));
    
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
