import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Home } from './Home';
import { HOME_STRINGS } from './constants';

describe('Home', () => {
  it('renders the title', () => {
    render(<Home />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      HOME_STRINGS.TITLE
    );
  });

  it('renders the description', () => {
    render(<Home />);
    
    expect(screen.getByText(HOME_STRINGS.DESCRIPTION)).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-foreground');
  });
});

