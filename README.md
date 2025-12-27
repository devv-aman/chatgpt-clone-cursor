# React TypeScript Boilerplate

A modern React + TypeScript boilerplate with Vite, featuring a collapsible sidebar, dark/light theme support, Shadcn UI components, and comprehensive testing.

## Features

- **React 19** with TypeScript
- **Vite 7** for fast development and building
- **React Router 7** for client-side routing
- **Tailwind CSS 4** for styling
- **Shadcn UI** for beautiful, accessible components
- **Axios** with interceptors for API calls
- **Dark/Light Theme** support with system preference detection
- **Collapsible Sidebar** with navigation
- **Vitest** for unit and integration testing
- **Playwright** for end-to-end testing

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Install Playwright browsers (for E2E tests)
pnpm exec playwright install
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run unit and integration tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests with visible browser
pnpm test:e2e:headed

# Run E2E tests with visible browser (slowed down for debugging)
pnpm test:e2e:slow

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Linting

```bash
pnpm lint
```

## Project Structure

```
src/
├── api/                    # Axios client and API configuration
├── components/
│   ├── layout/             # Layout components (Sidebar, MainLayout)
│   └── ui/                 # Shadcn UI components
├── constants/              # Application constants (routes, strings, api)
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── pages/                  # Page components
│   ├── Home/
│   └── Settings/
├── providers/              # React context providers
├── test/                   # Test utilities and setup
├── App.tsx                 # Root application component
├── main.tsx                # Application entry point
└── router.tsx              # React Router configuration

tests/
├── integration/            # Integration tests
└── e2e/                    # Playwright E2E tests
```

## Theme System

The application supports light, dark, and system theme preferences. Theme colors are defined as CSS variables in `src/index.css`.

### Using Theme Colors

Always use Tailwind classes that reference CSS variables:

```tsx
// Good - uses CSS variable
<div className="bg-background text-foreground" />

// Bad - hardcoded color
<div className="bg-white text-black" />
```

### Theme Toggle

The theme can be toggled using the `useTheme` hook:

```tsx
import { useTheme } from "@/providers/ThemeProvider";

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return <button onClick={toggleTheme}>Current: {theme}</button>;
}
```

## API Client

The Axios client is pre-configured with interceptors for authentication and error handling:

```tsx
import { apiClient } from "@/api";

// Make API calls
const response = await apiClient.get("/users");
```

## Constants

All strings and configuration values are centralized in the `constants` folder:

- `routes.ts` - Route path constants
- `strings.ts` - UI text strings
- `api.ts` - API configuration

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## License

MIT
