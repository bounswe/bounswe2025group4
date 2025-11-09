# Testing Framework Documentation

This document provides an overview of the testing framework setup and best practices for writing tests in the jobboard-frontend application.

## Overview

The testing framework uses:
- **Vitest** - Fast unit test framework with Vite integration
- **React Testing Library** - Testing utilities for React components
- **MSW (Mock Service Worker)** - API mocking for integration tests
- **jsdom** - DOM implementation for Node.js

## Test Utilities

### `renderWithProviders(ui, options)`

Custom render function that wraps components with all necessary providers for testing.

**Features:**
- Automatically wraps components with `I18nProvider`, `AuthProvider`, and `MemoryRouter`
- Includes `ToastContainer` for testing toast notifications
- Clears auth store state before each render to ensure test isolation
- Supports custom routing with `initialEntries`

**Usage:**
```tsx
import { renderWithProviders } from '@/test/utils';

renderWithProviders(<LoginPage />, {
  initialEntries: ['/login']
});
```

### `setupUserEvent()`

Sets up user event utilities for simulating user interactions.

**Usage:**
```tsx
import { setupUserEvent } from '@/test/utils';

const user = setupUserEvent();
await user.type(screen.getByLabelText(/username/i), 'testuser');
await user.click(screen.getByRole('button', { name: /submit/i }));
```

## Mock Service Worker (MSW)

### Request Handlers

Defined in `src/test/handlers.ts`, these handlers mock API responses for tests.

**Example:**
```tsx
import { http, HttpResponse } from 'msw';
import { server } from '@/test/setup';
import { API_BASE_URL } from '@/test/handlers';

// Override a handler for a specific test
server.use(
  http.post(`${API_BASE_URL}/auth/login`, async () =>
    HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  )
);
```

### Creating Mock JWT Tokens

Use the `createMockJWT` helper to generate valid JWT tokens for testing:

```tsx
import { createMockJWT } from '@/test/handlers';

const token = createMockJWT('username', 'email@example.com', 1, 'ROLE_JOBSEEKER');
```

## Test Setup

### Global Setup (`src/test/setup.ts`)

The setup file configures:
- MSW server for API mocking
- i18n with test translations
- Environment variables (VITE_API_URL)
- DOM APIs (matchMedia)
- Automatic cleanup after each test

### Test Lifecycle

```tsx
beforeAll(() => {
  // MSW server starts listening
});

afterEach(() => {
  // MSW handlers reset
  // React Testing Library cleanup
  // localStorage cleared
});

afterAll(() => {
  // MSW server closes
});
```

## Writing Tests

### Basic Component Test

```tsx
import { screen } from '@testing-library/react';
import { renderWithProviders, setupUserEvent } from '@/test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    renderWithProviders(<MyComponent />);
    const user = setupUserEvent();

    await user.click(screen.getByRole('button', { name: /click me/i }));
    expect(await screen.findByText(/clicked/i)).toBeInTheDocument();
  });
});
```

### Testing with Navigation State

```tsx
renderWithProviders(<LoginPage />, {
  initialEntries: [
    {
      pathname: '/login',
      state: { message: 'Success!' },
    },
  ],
});

// Toast notifications appear as role="alert"
expect(await screen.findByRole('alert')).toHaveTextContent('Success!');
```

### Testing API Errors

```tsx
import { server } from '@/test/setup';
import { http, HttpResponse } from 'msw';

it('handles API errors', async () => {
  server.use(
    http.post('/api/auth/login', () =>
      HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    )
  );

  renderWithProviders(<LoginPage />);
  const user = setupUserEvent();

  await user.type(screen.getByLabelText(/username/i), 'wrong');
  await user.type(screen.getByLabelText(/password/i), 'wrong');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/invalid/i);
});
```

## Best Practices

### 1. Use Semantic Queries

Prefer queries in this order:
1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByText` - For text content
4. `getByTestId` - Last resort

```tsx
// Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/username/i)

// Avoid if possible
screen.getByTestId('submit-button')
```

### 2. Use Regex for Case-Insensitive Matching

```tsx
screen.getByText(/hello world/i)  // Matches "Hello World", "hello world", etc.
```

### 3. Use Specific Label Matching

When multiple labels contain similar text, use exact matching:

```tsx
// When both "New Password" and "Confirm New Password" exist
screen.getByLabelText(/^new password \*/i)
screen.getByLabelText(/^confirm new password \*/i)
```

### 4. Wait for Async Updates

Use `findBy*` or `waitFor` for async operations:

```tsx
// For single elements that will appear
const element = await screen.findByRole('alert');

// For complex assertions
await waitFor(() => {
  expect(mockNavigate).toHaveBeenCalledWith('/');
});
```

### 5. Test User Flows, Not Implementation

```tsx
// Good - Tests user behavior
it('allows user to log in', async () => {
  const user = setupUserEvent();
  await user.type(screen.getByLabelText(/username/i), 'testuser');
  await user.type(screen.getByLabelText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});

// Avoid - Tests implementation details
it('updates state when typing', () => {
  // Don't test internal state changes
});
```

### 6. Clean Test Isolation

Each test should be independent:
- `renderWithProviders` automatically clears auth state
- `afterEach` clears localStorage
- MSW handlers reset after each test

### 7. Mock Navigation

```tsx
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// In tests
expect(mockNavigate).toHaveBeenCalledWith('/login');
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Extending the Framework

### Adding New Mock Handlers

Add new handlers to `src/test/handlers.ts`:

```tsx
export const myHandlers = [
  http.get(`${API_BASE_URL}/api/users/:id`, async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test User',
    });
  }),
];

// Export all handlers
export const authHandlers = [...authHandlers, ...myHandlers];
```

### Adding New Test Utilities

Add new utilities to `src/test/utils.tsx`:

```tsx
export function renderWithAuth(ui: ReactElement, user: User) {
  // Custom render with authenticated user
  useAuthStore.getState().login({
    ...user,
    token: createMockJWT(user.username, user.email),
  });

  return renderWithProviders(ui);
}
```

### Adding Custom Matchers

Install custom matchers in `src/test/setup.ts`:

```tsx
import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';

expect.extend({
  toBeValidEmail(received: string) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid email`,
    };
  },
});
```

## Troubleshooting

### Tests timing out

Increase timeout for async operations:
```tsx
await waitFor(() => {
  expect(mockNavigate).toHaveBeenCalled();
}, { timeout: 3000 });
```

### Toast notifications not appearing

Ensure `ToastContainer` is included (already done in `renderWithProviders`) and use `findByRole('alert')`:
```tsx
expect(await screen.findByRole('alert')).toBeInTheDocument();
```

### Mock handlers not working

Ensure handlers are registered before tests run and reset properly:
```tsx
beforeEach(() => {
  server.resetHandlers();
});
```

### localStorage issues

`localStorage` is automatically cleared after each test in `setup.ts`. If you need to set initial state:
```tsx
beforeEach(() => {
  localStorage.setItem('auth-storage', JSON.stringify({
    state: { accessToken: 'token' },
  }));
});
```
