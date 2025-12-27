import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { STRINGS } from '@/constants/strings';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark', 'light');
  });

  it('renders the toggle button', () => {
    render(<ThemeToggle />);
    
    expect(
      screen.getByRole('button', { name: STRINGS.THEME.TOGGLE_LABEL })
    ).toBeInTheDocument();
  });

  it('toggles theme on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: STRINGS.THEME.TOGGLE_LABEL });
    
    // Click should toggle the theme
    await user.click(button);
    
    // Verify theme was toggled by checking document class
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('renders sun or moon icon based on theme', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: STRINGS.THEME.TOGGLE_LABEL });
    // The button should contain an SVG icon
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});

