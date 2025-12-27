import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { NotFound } from './NotFound';
import { NOT_FOUND_STRINGS } from './constants';

describe('NotFound', () => {
  it('renders 404 error code', () => {
    render(<NotFound />);
    
    // The error code appears multiple times (background and foreground)
    const errorCodeElements = screen.getAllByText(NOT_FOUND_STRINGS.ERROR_CODE, { exact: false });
    expect(errorCodeElements.length).toBeGreaterThan(0);
  });

  it('renders page not found title', () => {
    render(<NotFound />);
    
    // Check for individual characters as they are animated separately
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<NotFound />);
    
    expect(screen.getByText(NOT_FOUND_STRINGS.DESCRIPTION)).toBeInTheDocument();
  });

  it('renders go home button with correct link', () => {
    render(<NotFound />);
    
    const homeLink = screen.getByRole('link', { name: NOT_FOUND_STRINGS.GO_HOME });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});

