import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AIOutputContainer } from './AIOutputContainer';
import { CHAT_STRINGS } from '../constants';

function renderAIOutput(props = {}) {
  const defaultProps = {
    content: '',
    isStreaming: false,
  };

  return render(
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <AIOutputContainer {...defaultProps} {...props} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

describe('AIOutputContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when content is empty and not thinking', () => {
    const { container } = renderAIOutput({ content: '' });
    expect(container.firstChild).toBeNull();
  });

  it('shows thinking state when showThinking is true and no content', () => {
    renderAIOutput({ showThinking: true, content: '' });
    
    expect(screen.getByText(CHAT_STRINGS.THINKING)).toBeInTheDocument();
  });

  it('renders markdown content', () => {
    renderAIOutput({ content: '**Bold text**' });
    
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });

  it('shows copy button when not streaming and has content', () => {
    renderAIOutput({ content: 'Some content', isStreaming: false });
    
    expect(screen.getByRole('button', { name: CHAT_STRINGS.COPY_LABEL })).toBeInTheDocument();
  });

  it('hides copy button while streaming', () => {
    renderAIOutput({ content: 'Some content', isStreaming: true });
    
    expect(screen.queryByRole('button', { name: CHAT_STRINGS.COPY_LABEL })).not.toBeInTheDocument();
  });

  it('shows tokens usage when provided', () => {
    renderAIOutput({ content: 'Content', tokensUsed: 1234 });
    
    // Look for combined tokens text
    expect(screen.getByText(/1,234.*tokens/)).toBeInTheDocument();
  });

  it('copies content to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    renderAIOutput({ content: 'Test content' });
    
    const copyButton = screen.getByRole('button', { name: CHAT_STRINGS.COPY_LABEL });
    await user.click(copyButton);
    
    // Button should show "Copied!" after clicking
    expect(await screen.findByText(CHAT_STRINGS.COPIED_LABEL)).toBeInTheDocument();
  });

  it('renders headings correctly', () => {
    renderAIOutput({ content: '# Heading 1\n## Heading 2' });
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2');
  });

  it('renders links correctly', () => {
    renderAIOutput({ content: '[Link text](https://example.com)' });
    
    const link = screen.getByRole('link', { name: 'Link text' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });
});

