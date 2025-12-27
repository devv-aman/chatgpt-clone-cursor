import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Settings } from './Settings';
import { SETTINGS_STRINGS } from './constants';

describe('Settings', () => {
  it('renders the title', () => {
    render(<Settings />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      SETTINGS_STRINGS.TITLE
    );
  });

  it('renders the description', () => {
    render(<Settings />);
    
    expect(screen.getByText(SETTINGS_STRINGS.DESCRIPTION)).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Settings />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-foreground');
  });
});

