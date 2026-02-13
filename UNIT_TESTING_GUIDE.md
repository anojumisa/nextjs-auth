# Next.js Unit Testing Guide

A comprehensive step-by-step guide to implementing unit testing in Next.js applications using Jest, React Testing Library, and Husky.

## 📚 What You'll Learn

- ✅ Simulating user interactions with React Testing Library
- ✅ Testing form inputs and validation logic
- ✅ Testing dynamic UI updates after events
- ✅ Mocking API calls with Jest and Mock Service Worker (MSW)
- ✅ Testing server-side functions and data fetching
- ✅ Handling loading and error states in tests
- ✅ Understanding coverage in Unit Testing
- ✅ Gatekeeping branches with Husky
- ✅ Advanced coverage strategies

## 🎯 Prerequisites

- Basic knowledge of React and Next.js
- Node.js installed on your machine
- Understanding of JavaScript/TypeScript
- Familiarity with your existing authentication project

## 📋 Table of Contents

1. [Project Preparation](#step-1-project-preparation)
2. [Installing Dependencies](#step-2-installing-dependencies)
3. [Configuring Jest](#step-3-configuring-jest)
4. [Setting Up React Testing Library](#step-4-setting-up-react-testing-library)
5. [Configuring Mock Service Worker (MSW)](#step-5-configuring-mock-service-worker-msw)
6. [Creating Your First Test](#step-6-creating-your-first-test)
7. [Testing Form Components](#step-7-testing-form-components)
8. [Testing User Interactions](#step-8-testing-user-interactions)
9. [Testing Dynamic UI Updates](#step-9-testing-dynamic-ui-updates)
10. [Mocking API Calls with MSW](#step-10-mocking-api-calls-with-msw)
11. [Testing Server Actions](#step-11-testing-server-actions)
12. [Testing Server Components and Data Fetching](#step-12-testing-server-components-and-data-fetching)
13. [Testing Loading and Error States](#step-13-testing-loading-and-error-states)
14. [Understanding Test Coverage](#step-14-understanding-test-coverage)
15. [Configuring Coverage Thresholds](#step-15-configuring-coverage-thresholds)
16. [Setting Up Husky for Pre-commit Hooks](#step-16-setting-up-husky-for-pre-commit-hooks)
17. [Setting Up Husky for Pre-push Hooks](#step-17-setting-up-husky-for-pre-push-hooks)
18. [Advanced Coverage Strategies](#step-18-advanced-coverage-strategies)
19. [Generating Coverage Reports](#step-19-generating-coverage-reports)

---

## Step 1: Project Preparation

Before we start writing tests, we need to ensure our project is ready for testing.

### 📝 Instructions:

1. **Verify your project structure:**
   - Ensure you have a `src` directory with your app code
   - Check that your `package.json` exists
   - Verify TypeScript configuration (`tsconfig.json`)

2. **Create test directory structure:**
   We'll use a separate `__tests__` directory for all our test files. This keeps tests organized and separate from source code.

**What we're doing:** Setting up the foundation for our testing infrastructure.

**Why separate `__tests__` directory?**
- Keeps source code and tests clearly separated
- Makes it easier to find and maintain tests
- Follows common testing conventions
- Allows for better organization as your project grows

### ✅ Checklist:

- [ ] Project structure verified
- [ ] Ready to install testing dependencies

---

## Step 2: Installing Dependencies

We need to install Jest, React Testing Library, MSW, and related dependencies.

### 📝 Instructions:

1. **Install testing dependencies:**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

2. **Install Mock Service Worker:**

```bash
npm install --save-dev msw
```

3. **Install Husky for git hooks:**

```bash
npm install --save-dev husky
```

**What each package does:**

- **`jest`**: The testing framework that runs our tests
- **`@testing-library/react`**: Utilities for testing React components
- **`@testing-library/jest-dom`**: Custom Jest matchers for DOM elements
- **`@testing-library/user-event`**: Simulates real user interactions
- **`jest-environment-jsdom`**: Provides browser-like environment for tests
- **`@types/jest`**: TypeScript types for Jest
- **`msw`**: Mock Service Worker for intercepting API calls
- **`husky`**: Git hooks manager for running tests before commits/pushes

### ✅ Checklist:

- [ ] All dependencies installed
- [ ] `package.json` updated with dev dependencies

---

## Step 3: Configuring Jest

Jest needs configuration to work properly with Next.js, TypeScript, and module paths.

### 📝 Instructions:

1. **Create `jest.config.js` at the project root:**

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

**What this configuration does:**

- **`nextJest`**: Integrates Jest with Next.js configuration
- **`setupFilesAfterEnv`**: Runs setup file before each test file
- **`testEnvironment`**: Uses jsdom to simulate browser environment
- **`moduleNameMapper`**: Maps `@/` imports to `src/` directory
- **`collectCoverageFrom`**: Specifies which files to include in coverage
- **`coverageThresholds`**: Sets minimum coverage requirements (80% lines/statements, 70% branches/functions)

2. **Create `jest.setup.js` at the project root:**

```javascript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
```

**What this does:** Imports custom Jest matchers like `toBeInTheDocument()`, `toHaveTextContent()`, etc.

### ✅ Checklist:

- [ ] `jest.config.js` created
- [ ] `jest.setup.js` created
- [ ] Configuration matches your project structure

---

## Step 4: Setting Up React Testing Library

React Testing Library is already installed, but we need to understand how to use it effectively.

### 📝 Key Concepts:

**React Testing Library Philosophy:**
- Tests should focus on what users see and do, not implementation details
- Query elements the way users would (by label, text, role)
- Prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId`

**Common Query Methods:**

1. **`getByRole`**: Query by accessibility role (button, input, etc.)
2. **`getByLabelText`**: Query by form label
3. **`getByText`**: Query by visible text
4. **`getByPlaceholderText`**: Query by placeholder text
5. **`queryBy*`**: Returns null if not found (doesn't throw)
6. **`findBy*`**: Returns a promise (for async elements)

**Example:**

```typescript
// ✅ Good - queries like a user would
const emailInput = screen.getByLabelText(/email/i)
const submitButton = screen.getByRole('button', { name: /login/i })

// ❌ Avoid - implementation details
const emailInput = screen.getByTestId('email-input')
```

### ✅ Checklist:

- [ ] Understanding of React Testing Library concepts
- [ ] Ready to write component tests

---

## Step 5: Configuring Mock Service Worker (MSW)

MSW intercepts network requests and returns mock responses, allowing us to test API-dependent code without hitting real APIs.

### 📝 Instructions:

1. **Create MSW handlers directory:**

Create `src/__tests__/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'

const PLATZI_API_URL = 'https://api.escuelajs.co/api/v1'

export const handlers = [
  // Mock successful login
  http.post(`${PLATZI_API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    // Simulate validation
    if (body.email === 'john@mail.com' && body.password === 'changeme') {
      return HttpResponse.json({
        access_token: 'mock-access-token-123',
        refresh_token: 'mock-refresh-token-456',
      })
    }
    
    // Simulate invalid credentials
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Mock profile fetch
  http.get(`${PLATZI_API_URL}/auth/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader === 'Bearer mock-access-token-123') {
      return HttpResponse.json({
        id: 1,
        email: 'john@mail.com',
        name: 'John Doe',
        role: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        password: 'changeme',
      })
    }
    
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }),

  // Mock user fetch
  http.get(`${PLATZI_API_URL}/users/:id`, ({ params }) => {
    const { id } = params
    
    if (id === '1') {
      return HttpResponse.json({
        id: 1,
        email: 'john@mail.com',
        name: 'John Doe',
        role: 'customer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        password: 'changeme',
      })
    }
    
    return HttpResponse.json(
      { message: 'User not found' },
      { status: 404 }
    )
  }),

  // Mock network error
  http.get(`${PLATZI_API_URL}/users/999`, () => {
    return HttpResponse.error()
  }),
]
```

**What this does:**

- Defines mock handlers for all API endpoints used in your app
- Returns appropriate responses based on request parameters
- Simulates both success and error scenarios

2. **Create MSW server setup:**

Create `src/__tests__/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a request mocking server with the given request handlers
export const server = setupServer(...handlers)
```

3. **Update `jest.setup.js` to include MSW:**

```javascript
import '@testing-library/jest-dom'
import { server } from './src/__tests__/mocks/server'

// Establish API mocking before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => server.resetHandlers())

// Clean up after the tests are finished
afterAll(() => server.close())
```

**What this does:**

- Starts MSW server before all tests
- Resets handlers after each test (prevents test pollution)
- Closes server after all tests complete

### ✅ Checklist:

- [ ] MSW handlers created
- [ ] MSW server configured
- [ ] `jest.setup.js` updated with MSW setup

---

## Step 6: Creating Your First Test

Let's create a simple test to verify our setup works.

### 📝 Instructions:

1. **Create a simple utility function to test:**

Create `src/app/lib/utils.ts`:

```typescript
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function formatUserName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-')
}
```

2. **Create your first test:**

Create `src/__tests__/lib/utils.test.ts`:

```typescript
import { isValidEmail, formatUserName } from '@/app/lib/utils'

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('invalid@.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('formatUserName', () => {
  it('should format user names correctly', () => {
    expect(formatUserName('John Doe')).toBe('john-doe')
    expect(formatUserName('  Jane Smith  ')).toBe('jane-smith')
    expect(formatUserName('Mary   Jane Watson')).toBe('mary-jane-watson')
  })
})
```

**Test Structure Explanation:**

- **`describe`**: Groups related tests together
- **`it` or `test`**: Defines a single test case
- **`expect`**: Makes assertions about values
- **`.toBe()`**: Matcher that checks for exact equality

3. **Run your first test:**

```bash
npm test -- utils.test.ts
```

Or add to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**What to test:**

- **Happy paths**: Normal, expected inputs
- **Edge cases**: Boundary values, empty strings, null/undefined
- **Error cases**: Invalid inputs that should fail

### ✅ Checklist:

- [ ] First test file created
- [ ] Test runs successfully
- [ ] Understanding of test structure

---

## Step 7: Testing Form Components

Now let's test the `LoginForm` component, focusing on form inputs and validation.

### 📝 Instructions:

1. **Create test file:**

Create `src/__tests__/ui/login-form.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/app/ui/login-form'

// Mock the login action
jest.mock('@/app/actions/auth', () => ({
  login: jest.fn(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form elements', () => {
    render(<LoginForm />)

    // Check for email input
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    
    // Check for password input
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    
    // Check for test credentials display
    expect(screen.getByText(/test credentials/i)).toBeInTheDocument()
  })

  it('should allow user to type in email and password fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('should show validation errors when form is submitted with invalid data', async () => {
    const user = userEvent.setup()
    const { login } = require('@/app/actions/auth')
    
    // Mock login to return validation errors
    login.mockResolvedValueOnce({
      errors: {
        email: 'Please enter a valid email address.',
        password: 'Password is required.',
      },
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    // Submit form with invalid data
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, '')
    await user.click(submitButton)

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should show error message when login fails', async () => {
    const user = userEvent.setup()
    const { login } = require('@/app/actions/auth')
    
    // Mock login to return error message
    login.mockResolvedValueOnce({
      message: 'Invalid email or password. Please try again.',
    })

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('should disable submit button and show loading state when form is submitting', async () => {
    const user = userEvent.setup()
    const { login } = require('@/app/actions/auth')
    
    // Mock login to delay response
    login.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100))
    )

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Wait for submission to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    }, { timeout: 200 })
  })
})
```

**What we're testing:**

- **Rendering**: All form elements appear correctly
- **User input**: Users can type in form fields
- **Validation**: Error messages appear for invalid inputs
- **Error handling**: Error messages display when login fails
- **Loading states**: Button disables and shows loading text during submission

**Key Testing Concepts:**

- **`userEvent`**: Simulates real user interactions (typing, clicking)
- **`waitFor`**: Waits for async updates to complete
- **Mocking**: Replaces real functions with test doubles
- **`beforeEach`**: Runs before each test (cleanup)

### ✅ Checklist:

- [ ] LoginForm test file created
- [ ] All form interactions tested
- [ ] Validation logic tested
- [ ] Error states tested
- [ ] Loading states tested

---

## Step 8: Testing User Interactions

Let's create more comprehensive tests for user interactions, including keyboard navigation and accessibility.

### 📝 Instructions:

1. **Create an enhanced test file:**

Add to `src/__tests__/ui/login-form.test.tsx`:

```typescript
describe('LoginForm - User Interactions', () => {
  it('should submit form when user presses Enter in password field', async () => {
    const user = userEvent.setup()
    const { login } = require('@/app/actions/auth')
    login.mockResolvedValueOnce(undefined)

    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123{Enter}')

    await waitFor(() => {
      expect(login).toHaveBeenCalledTimes(1)
    })
  })

  it('should focus email input when label is clicked', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailLabel = screen.getByText(/email/i)
    const emailInput = screen.getByLabelText(/email/i)

    await user.click(emailLabel)

    expect(emailInput).toHaveFocus()
  })

  it('should have proper accessibility attributes', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Check that inputs are properly labeled
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('required')
  })
})
```

**What we're testing:**

- **Keyboard interactions**: Enter key submission
- **Focus management**: Label clicks focus inputs
- **Accessibility**: Proper ARIA attributes and labels

### ✅ Checklist:

- [ ] Keyboard interactions tested
- [ ] Focus management tested
- [ ] Accessibility attributes verified

---

## Step 9: Testing Dynamic UI Updates

Let's test components that update dynamically based on user actions or state changes.

### 📝 Instructions:

1. **Create a counter component to test:**

Create `src/app/ui/counter.tsx`:

```typescript
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  const [history, setHistory] = useState<number[]>([])

  const increment = () => {
    const newCount = count + 1
    setCount(newCount)
    setHistory([...history, newCount])
  }

  const decrement = () => {
    const newCount = count - 1
    setCount(newCount)
    setHistory([...history, newCount])
  }

  const reset = () => {
    setCount(0)
    setHistory([])
  }

  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">Count: {count}</div>
      <div className="flex gap-2">
        <button
          onClick={increment}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Increment
        </button>
        <button
          onClick={decrement}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Decrement
        </button>
        <button
          onClick={reset}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
      {history.length > 0 && (
        <div>
          <h3 className="font-semibold">History:</h3>
          <ul className="list-disc list-inside">
            {history.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
```

2. **Create test file:**

Create `src/__tests__/ui/counter.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from '@/app/ui/counter'

describe('Counter', () => {
  it('should display initial count of 0', () => {
    render(<Counter />)
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })

  it('should increment count when increment button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    await user.click(incrementButton)

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()
  })

  it('should decrement count when decrement button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    const decrementButton = screen.getByRole('button', { name: /decrement/i })

    // Increment first
    await user.click(incrementButton)
    expect(screen.getByText(/count: 1/i)).toBeInTheDocument()

    // Then decrement
    await user.click(decrementButton)
    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
  })

  it('should reset count and history when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })
    const resetButton = screen.getByRole('button', { name: /reset/i })

    // Increment a few times
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    expect(screen.getByText(/count: 3/i)).toBeInTheDocument()
    expect(screen.getByText(/history/i)).toBeInTheDocument()

    // Reset
    await user.click(resetButton)

    expect(screen.getByText(/count: 0/i)).toBeInTheDocument()
    expect(screen.queryByText(/history/i)).not.toBeInTheDocument()
  })

  it('should update history when count changes', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })

    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    // Check history is displayed
    const historySection = screen.getByText(/history/i).closest('div')
    expect(historySection).toBeInTheDocument()

    // Check history items
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should handle multiple rapid clicks', async () => {
    const user = userEvent.setup()
    render(<Counter />)

    const incrementButton = screen.getByRole('button', { name: /increment/i })

    // Click multiple times rapidly
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)
    await user.click(incrementButton)

    expect(screen.getByText(/count: 5/i)).toBeInTheDocument()
  })
})
```

**What we're testing:**

- **Initial state**: Component renders with correct initial values
- **State updates**: UI updates when buttons are clicked
- **Multiple interactions**: Component handles sequences of actions
- **Conditional rendering**: History section appears/disappears based on state
- **Rapid interactions**: Component handles rapid user actions

**Key Concepts:**

- **State changes**: Testing that UI reflects state changes
- **Conditional rendering**: Testing elements that appear/disappear
- **User flows**: Testing complete user interaction sequences

### ✅ Checklist:

- [ ] Counter component created
- [ ] Dynamic UI updates tested
- [ ] State changes verified
- [ ] Conditional rendering tested

---

## Step 10: Mocking API Calls with MSW

Now let's test components that make API calls using MSW to mock the responses.

### 📝 Instructions:

1. **Test component that fetches data:**

Create `src/app/ui/user-profile.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { User } from '@/app/lib/definitions'

export default function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`https://api.escuelajs.co/api/v1/users/${userId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>User not found</div>

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
      {user.avatar && <img src={user.avatar} alt={user.name} />}
    </div>
  )
}
```

2. **Create test file:**

Create `src/__tests__/ui/user-profile.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import UserProfile from '@/app/ui/user-profile'

const PLATZI_API_URL = 'https://api.escuelajs.co/api/v1'

describe('UserProfile', () => {
  it('should display loading state initially', () => {
    render(<UserProfile userId={1} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display user data after successful fetch', async () => {
    render(<UserProfile userId={1} />)

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/john@mail.com/i)).toBeInTheDocument()
    expect(screen.getByText(/role: customer/i)).toBeInTheDocument()
  })

  it('should display error message when API call fails', async () => {
    // Override the default handler for this test
    server.use(
      http.get(`${PLATZI_API_URL}/users/999`, () => {
        return HttpResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      })
    )

    render(<UserProfile userId={999} />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should refetch when userId changes', async () => {
    const { rerender } = render(<UserProfile userId={1} />)

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })

    // Change userId
    rerender(<UserProfile userId={2} />)

    // Should show loading again
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for new user data (you'll need to add handler for userId=2)
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  it('should handle network errors', async () => {
    // Override handler to simulate network error
    server.use(
      http.get(`${PLATZI_API_URL}/users/1`, () => {
        return HttpResponse.error()
      })
    )

    render(<UserProfile userId={1} />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

**What we're testing:**

- **Loading states**: Component shows loading indicator
- **Success scenarios**: Data displays correctly after fetch
- **Error handling**: Error messages appear on failure
- **Dynamic updates**: Component refetches when props change
- **Network errors**: Handles network failures gracefully

**Key MSW Concepts:**

- **Default handlers**: Used for most tests
- **`server.use()`**: Override handlers for specific tests
- **`HttpResponse`**: Create mock responses
- **Error simulation**: Test error scenarios

### ✅ Checklist:

- [ ] UserProfile component created
- [ ] API mocking with MSW tested
- [ ] Loading states tested
- [ ] Error states tested
- [ ] Dynamic updates tested

---

## Step 11: Testing Server Actions

Server Actions in Next.js need special handling for testing. Let's test the `login` server action.

### 📝 Instructions:

1. **Create test file:**

Create `src/__tests__/actions/auth.test.ts`:

```typescript
import { login, logout } from '@/app/actions/auth'
import { createSession, deleteSession } from '@/app/lib/session'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock session functions
jest.mock('@/app/lib/session', () => ({
  createSession: jest.fn(),
  deleteSession: jest.fn(),
  getSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const PLATZI_API_URL = 'https://api.escuelajs.co/api/v1'

describe('login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return validation errors for invalid email', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')
    formData.append('password', 'password123')

    const result = await login(undefined, formData)

    expect(result).toEqual({
      errors: {
        email: 'Please enter a valid email address.',
      },
    })
    expect(createSession).not.toHaveBeenCalled()
  })

  it('should return validation errors for empty password', async () => {
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', '')

    const result = await login(undefined, formData)

    expect(result).toEqual({
      errors: {
        password: 'Password is required.',
      },
    })
  })

  it('should return error message for invalid credentials', async () => {
    // Override handler for invalid credentials
    server.use(
      http.post(`${PLATZI_API_URL}/auth/login`, () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        )
      })
    )

    const formData = new FormData()
    formData.append('email', 'wrong@example.com')
    formData.append('password', 'wrongpassword')

    const result = await login(undefined, formData)

    expect(result).toEqual({
      message: 'Invalid email or password. Please try again.',
    })
    expect(createSession).not.toHaveBeenCalled()
  })

  it('should create session and redirect on successful login', async () => {
    const formData = new FormData()
    formData.append('email', 'john@mail.com')
    formData.append('password', 'changeme')

    // Mock createSession to resolve successfully
    ;(createSession as jest.Mock).mockResolvedValueOnce(undefined)

    await login(undefined, formData)

    // Verify session was created with correct data
    expect(createSession).toHaveBeenCalledWith(
      1, // userId from mock handler
      'john@mail.com',
      'customer'
    )

    // Verify redirect was called
    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('should handle API errors gracefully', async () => {
    // Override handler to simulate API error
    server.use(
      http.post(`${PLATZI_API_URL}/auth/login`, () => {
        return HttpResponse.error()
      })
    )

    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    const result = await login(undefined, formData)

    expect(result).toEqual({
      message: 'An error occurred during login. Please try again.',
    })
  })

  it('should handle profile fetch failure', async () => {
    // Override handler to make profile fetch fail
    server.use(
      http.get(`${PLATZI_API_URL}/auth/profile`, () => {
        return HttpResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        )
      })
    )

    const formData = new FormData()
    formData.append('email', 'john@mail.com')
    formData.append('password', 'changeme')

    const result = await login(undefined, formData)

    expect(result).toEqual({
      message: 'Failed to fetch user profile.',
    })
    expect(createSession).not.toHaveBeenCalled()
  })
})

describe('logout', () => {
  it('should delete session and redirect to login', async () => {
    ;(deleteSession as jest.Mock).mockResolvedValueOnce(undefined)

    await logout()

    expect(deleteSession).toHaveBeenCalled()
    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
```

**What we're testing:**

- **Validation logic**: Email and password validation
- **API integration**: Successful API calls
- **Error handling**: Various error scenarios
- **Session management**: Session creation/deletion
- **Redirects**: Navigation after actions

**Key Concepts:**

- **Mocking modules**: Replace Next.js modules with mocks
- **FormData**: Create FormData objects for server actions
- **Async testing**: Handle async server actions properly

### ✅ Checklist:

- [ ] Server action tests created
- [ ] Validation logic tested
- [ ] API integration tested
- [ ] Error handling tested
- [ ] Session management tested

---

## Step 12: Testing Server Components and Data Fetching

In Next.js 16, we use Server Components instead of `getServerSideProps`. Let's test these.

### 📝 Instructions:

1. **Create test file:**

Create `src/__tests__/lib/dal.test.ts`:

```typescript
import { verifySession, getUser, requireRole } from '@/app/lib/dal'
import { getSession } from '@/app/lib/session'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock session functions
jest.mock('@/app/lib/session', () => ({
  getSession: jest.fn(),
  createSession: jest.fn(),
  deleteSession: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

const PLATZI_API_URL = 'https://api.escuelajs.co/api/v1'

describe('verifySession', () => {
  it('should return session data when session exists', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'test@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    const result = await verifySession()

    expect(result).toEqual({
      isAuth: true,
      userId: 1,
      email: 'test@example.com',
      role: 'customer',
    })
  })

  it('should redirect to login when session does not exist', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce(null)

    await verifySession()

    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/login')
  })

  it('should redirect to login when session expired', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'test@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() - 86400000).toISOString(), // Expired
    })

    await verifySession()

    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})

describe('getUser', () => {
  it('should fetch and return user data', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'test@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    const user = await getUser()

    expect(user).toEqual({
      id: 1,
      email: 'john@mail.com',
      name: 'John Doe',
      role: 'customer',
      avatar: expect.any(String),
      password: 'changeme',
    })
  })

  it('should return null when user fetch fails', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 999,
      email: 'test@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    // Override handler for user not found
    server.use(
      http.get(`${PLATZI_API_URL}/users/999`, () => {
        return HttpResponse.json(
          { message: 'User not found' },
          { status: 404 }
        )
      })
    )

    const user = await getUser()

    expect(user).toBeNull()
  })

  it('should return null on network error', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'test@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    server.use(
      http.get(`${PLATZI_API_URL}/users/1`, () => {
        return HttpResponse.error()
      })
    )

    const user = await getUser()

    expect(user).toBeNull()
  })
})

describe('requireRole', () => {
  it('should return session when user has required role', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'admin@example.com',
      role: 'admin',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    const result = await requireRole(['admin'])

    expect(result).toEqual({
      userId: 1,
      email: 'admin@example.com',
      role: 'admin',
      expiresAt: expect.any(String),
    })
  })

  it('should redirect to dashboard when user does not have required role', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'user@example.com',
      role: 'customer',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    await requireRole(['admin'])

    const { redirect } = require('next/navigation')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('should allow access when user has one of multiple allowed roles', async () => {
    ;(getSession as jest.Mock).mockResolvedValueOnce({
      userId: 1,
      email: 'editor@example.com',
      role: 'editor',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })

    const result = await requireRole(['admin', 'editor'])

    expect(result).toBeDefined()
    expect(result?.role).toBe('editor')
  })
})
```

**What we're testing:**

- **Session verification**: Valid and invalid sessions
- **Data fetching**: User data retrieval
- **Role-based access**: RBAC functionality
- **Error handling**: API failures and edge cases

### ✅ Checklist:

- [ ] DAL functions tested
- [ ] Session verification tested
- [ ] Data fetching tested
- [ ] RBAC tested
- [ ] Error handling tested

---

## Step 13: Testing Loading and Error States

Let's create comprehensive tests for loading and error states across different scenarios.

### 📝 Instructions:

1. **Create a component with multiple states:**

Create `src/app/ui/data-fetcher.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

interface DataFetcherProps {
  url: string
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export default function DataFetcher({ url, onSuccess, onError }: DataFetcherProps) {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (!cancelled) {
          setData(result)
          setLoading(false)
          onSuccess?.(result)
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Unknown error')
          setError(error)
          setLoading(false)
          onError?.(error)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [url, onSuccess, onError])

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <div>Loading...</div>
        <div className="spinner" aria-hidden="true"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert">
        <div>Error: {error.message}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
```

2. **Create comprehensive test file:**

Create `src/__tests__/ui/data-fetcher.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import DataFetcher from '@/app/ui/data-fetcher'

describe('DataFetcher - Loading States', () => {
  it('should display loading state initially', () => {
    render(<DataFetcher url="https://api.example.com/data" />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('should hide loading state after data loads', async () => {
    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.json({ message: 'Success' })
      })
    )

    render(<DataFetcher url="https://api.example.com/data" />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })
})

describe('DataFetcher - Error States', () => {
  it('should display error message on API failure', async () => {
    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.json(
          { message: 'Not found' },
          { status: 404 }
        )
      })
    )

    render(<DataFetcher url="https://api.example.com/data" />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/404/i)).toBeInTheDocument()
    })
  })

  it('should display error message on network error', async () => {
    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.error()
      })
    )

    render(<DataFetcher url="https://api.example.com/data" />)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should call onError callback when error occurs', async () => {
    const onError = jest.fn()

    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.error()
      })
    )

    render(<DataFetcher url="https://api.example.com/data" onError={onError} />)

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(expect.any(Error))
    })
  })

  it('should show retry button on error', async () => {
    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.error()
      })
    )

    render(<DataFetcher url="https://api.example.com/data" />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })
})

describe('DataFetcher - Success States', () => {
  it('should display data when fetch succeeds', async () => {
    const mockData = { id: 1, name: 'Test' }

    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.json(mockData)
      })
    )

    render(<DataFetcher url="https://api.example.com/data" />)

    await waitFor(() => {
      expect(screen.getByText(/"id": 1/i)).toBeInTheDocument()
      expect(screen.getByText(/"name": "Test"/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess callback when data loads', async () => {
    const onSuccess = jest.fn()
    const mockData = { id: 1, name: 'Test' }

    server.use(
      http.get('https://api.example.com/data', () => {
        return HttpResponse.json(mockData)
      })
    )

    render(<DataFetcher url="https://api.example.com/data" onSuccess={onSuccess} />)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })
  })
})

describe('DataFetcher - Edge Cases', () => {
  it('should handle component unmount during fetch', async () => {
    server.use(
      http.get('https://api.example.com/data', async () => {
        // Simulate slow response
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json({ message: 'Success' })
      })
    )

    const { unmount } = render(<DataFetcher url="https://api.example.com/data" />)

    // Unmount before fetch completes
    unmount()

    // Wait for potential state updates
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Should not throw errors about setting state on unmounted component
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('should refetch when URL changes', async () => {
    const { rerender } = render(<DataFetcher url="https://api.example.com/data1" />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    rerender(<DataFetcher url="https://api.example.com/data2" />)

    // Should show loading again
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})
```

**What we're testing:**

- **Loading states**: Initial loading, loading transitions
- **Error states**: API errors, network errors, error callbacks
- **Success states**: Data display, success callbacks
- **Edge cases**: Unmounting during fetch, URL changes
- **Accessibility**: ARIA attributes for screen readers

### ✅ Checklist:

- [ ] Loading states tested
- [ ] Error states tested
- [ ] Success states tested
- [ ] Edge cases tested
- [ ] Accessibility verified

---

## Step 14: Understanding Test Coverage

Test coverage measures how much of your code is executed during tests. Understanding coverage helps identify untested code.

### 📝 Coverage Metrics Explained:

1. **Statements Coverage**: Percentage of statements executed
   - Example: `if (condition) { doSomething() }` - both branches need to be tested

2. **Branches Coverage**: Percentage of conditional branches executed
   - Example: `if/else`, `switch/case`, ternary operators

3. **Functions Coverage**: Percentage of functions called
   - Example: All exported functions should be called at least once

4. **Lines Coverage**: Percentage of lines executed
   - Similar to statements but measured by line numbers

### 📝 How Coverage Works:

```typescript
// Example function
function calculateTotal(items: number[], discount: number = 0) {
  if (items.length === 0) {
    return 0  // Branch 1: needs test
  }
  
  const subtotal = items.reduce((sum, item) => sum + item, 0)
  const total = subtotal * (1 - discount)
  
  return total > 0 ? total : 0  // Branch 2: needs test
}
```

**To achieve 100% coverage, you need:**

1. Test with empty array (covers `items.length === 0` branch)
2. Test with items and no discount (covers normal flow)
3. Test with items and discount (covers discount calculation)
4. Test with discount > 1 (covers `total > 0` branch)

### 📝 Viewing Coverage:

Run tests with coverage:

```bash
npm test -- --coverage
```

This generates:
- **Terminal output**: Summary of coverage percentages
- **HTML report**: Detailed line-by-line coverage (in `coverage/` directory)
- **Coverage files**: Various formats (JSON, LCOV, etc.)

### 📝 Coverage Report Structure:

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
src/app/lib/utils.ts    |   85.71 |    66.67 |     100 |   85.71
src/app/ui/login-form.tsx |   90.00 |    80.00 |    100 |   90.00
```

**What to look for:**

- **Low branch coverage**: Missing tests for conditional logic
- **Low function coverage**: Functions never called in tests
- **Low line coverage**: Entire code paths not executed

### ✅ Checklist:

- [ ] Understanding of coverage metrics
- [ ] Know how to generate coverage reports
- [ ] Can interpret coverage data

---

## Step 15: Configuring Coverage Thresholds

Coverage thresholds enforce minimum coverage requirements, ensuring code quality standards.

### 📝 Instructions:

1. **Update `jest.config.js`:**

```javascript
const customJestConfig = {
  // ... existing config ...
  
  coverageThresholds: {
    global: {
      branches: 70,      // 70% of branches must be covered
      functions: 70,    // 70% of functions must be covered
      lines: 80,        // 80% of lines must be covered
      statements: 80,   // 80% of statements must be covered
    },
    // Per-file thresholds (optional, more strict)
    './src/app/lib/**/*.{ts,tsx}': {
      branches: 80,
      functions: 80,
      lines: 90,
      statements: 90,
    },
    './src/app/ui/**/*.{ts,tsx}': {
      branches: 75,
      functions: 75,
      lines: 85,
      statements: 85,
    },
  },
}
```

**What thresholds mean:**

- **`global`**: Applies to all files
- **Per-file patterns**: More specific requirements for certain directories
- **Why different thresholds**: Critical code (lib) needs higher coverage than UI components

2. **Understanding Threshold Values:**

```javascript
coverageThresholds: {
  global: {
    branches: 70,    // 70% - Good starting point, catches major branches
    functions: 70,   // 70% - Ensures most functions are tested
    lines: 80,       // 80% - Higher because lines are easier to cover
    statements: 80,  // 80% - Similar to lines
  },
}
```

**Recommended Thresholds by Project Stage:**

- **New Project**: Start with 60-70% globally
- **Established Project**: Aim for 80% globally
- **Critical Code**: 90%+ for security/auth code
- **UI Components**: 75-85% (some edge cases are hard to test)

3. **Running Tests with Thresholds:**

```bash
# Tests will fail if thresholds not met
npm test -- --coverage

# Watch mode with coverage
npm test -- --watch --coverage
```

**What happens when thresholds aren't met:**

```
Jest: "global" coverage threshold for branches (70%) not met: 65.23%
Jest: "global" coverage threshold for lines (80%) not met: 75.12%
```

Tests fail, forcing you to write more tests or adjust thresholds.

### 📝 Advanced Threshold Configuration:

```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 80,
    statements: 80,
  },
  // Exclude certain files from strict requirements
  './src/**/*.stories.{ts,tsx}': {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0,
  },
}
```

### ✅ Checklist:

- [ ] Coverage thresholds configured
- [ ] Understanding of threshold values
- [ ] Tests fail when thresholds not met
- [ ] Per-file thresholds set (optional)

---

## Step 16: Setting Up Husky for Pre-commit Hooks

Husky runs scripts before git commits, ensuring code quality before code enters the repository.

### 📝 Instructions:

1. **Initialize Husky:**

```bash
npx husky init
```

This creates:
- `.husky/` directory
- `.husky/pre-commit` file
- Updates `package.json` with husky config

2. **Configure pre-commit hook:**

Edit `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting (if you have ESLint)
# npm run lint

# Run tests
npm test -- --passWithNoTests
```

**What this does:**

- Runs before every commit
- Executes tests
- Prevents commit if tests fail
- `--passWithNoTests`: Allows commit if no tests exist (useful during setup)

3. **Make hook executable:**

```bash
chmod +x .husky/pre-commit
```

4. **Test the hook:**

```bash
# Make a small change
echo "// test" >> src/app/page.tsx

# Try to commit
git add .
git commit -m "Test pre-commit hook"

# If tests pass, commit succeeds
# If tests fail, commit is blocked
```

### 📝 Pre-commit Hook Options:

**Option 1: Quick Tests (Recommended for Pre-commit)**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Only run tests related to changed files (requires jest-changed-files)
npm test -- --onlyChanged --passWithNoTests
```

**Option 2: Full Test Suite**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run all tests (slower but thorough)
npm test -- --passWithNoTests
```

**Option 3: With Linting**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Lint first (faster failure)
npm run lint || exit 1

# Then test
npm test -- --passWithNoTests || exit 1
```

### 📝 When to Use Pre-commit:

**✅ Good for:**
- Quick syntax checks
- Linting
- Running tests for changed files
- Type checking

**❌ Avoid:**
- Full test suite (too slow)
- Coverage reports (too slow)
- Build processes (too slow)

### ✅ Checklist:

- [ ] Husky initialized
- [ ] Pre-commit hook created
- [ ] Hook is executable
- [ ] Hook runs before commits
- [ ] Commit blocked when tests fail

---

## Step 17: Setting Up Husky for Pre-push Hooks

Pre-push hooks run before code is pushed to remote, perfect for comprehensive checks.

### 📝 Instructions:

1. **Create pre-push hook:**

```bash
touch .husky/pre-push
chmod +x .husky/pre-push
```

2. **Configure pre-push hook:**

Edit `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run full test suite
npm test -- --passWithNoTests || exit 1

# Run tests with coverage and enforce thresholds
npm test -- --coverage --passWithNoTests || exit 1
```

**What this does:**

- Runs before every push
- Executes full test suite
- Checks coverage thresholds
- Prevents push if tests fail or coverage is insufficient

### 📝 Pre-push Hook Options:

**Option 1: Full Test Suite with Coverage**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Full test suite
npm test || exit 1

# Coverage check
npm test -- --coverage || exit 1
```

**Option 2: With Build Check**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Ensure project builds
npm run build || exit 1

# Run tests
npm test || exit 1

# Check coverage
npm test -- --coverage || exit 1
```

**Option 3: Type Checking**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Type check
npx tsc --noEmit || exit 1

# Run tests
npm test || exit 1
```

### 📝 Pre-commit vs Pre-push:

| Hook | When | Speed | Purpose |
|------|------|-------|---------|
| **Pre-commit** | Before commit | Fast | Quick checks, prevent bad commits |
| **Pre-push** | Before push | Slower | Comprehensive checks, ensure quality |

**Best Practice:**

- **Pre-commit**: Quick checks (linting, type checking, changed-file tests)
- **Pre-push**: Comprehensive checks (full test suite, coverage, build)

### 📝 Bypassing Hooks (When Needed):

```bash
# Skip pre-commit hook
git commit --no-verify -m "Emergency fix"

# Skip pre-push hook
git push --no-verify
```

**⚠️ Warning**: Only bypass hooks when absolutely necessary. Regular bypassing defeats the purpose.

### ✅ Checklist:

- [ ] Pre-push hook created
- [ ] Hook is executable
- [ ] Full test suite runs
- [ ] Coverage checked
- [ ] Push blocked when checks fail

---

## Step 18: Advanced Coverage Strategies

Advanced strategies help maintain high coverage while writing maintainable tests.

### 📝 Strategy 1: Focus on Critical Paths

**What to test:**

1. **Authentication flows** (high priority)
2. **Payment processing** (high priority)
3. **Data validation** (high priority)
4. **UI interactions** (medium priority)
5. **Utility functions** (medium priority)
6. **Styling** (low priority - often skipped)

**Example:**

```typescript
// High coverage target
describe('Authentication', () => {
  // Test all authentication scenarios
})

// Lower coverage acceptable
describe('Button Styles', () => {
  // May skip some style variations
})
```

### 📝 Strategy 2: Test Behavior, Not Implementation

**✅ Good:**

```typescript
it('should disable submit button when form is invalid', () => {
  // Tests behavior user sees
})
```

**❌ Avoid:**

```typescript
it('should set isValid state to false', () => {
  // Tests implementation details
})
```

### 📝 Strategy 3: Use Coverage Reports to Find Gaps

1. **Generate HTML report:**

```bash
npm test -- --coverage --coverageReporters=html
```

2. **Open `coverage/lcov-report/index.html`**

3. **Look for:**
   - Red lines (uncovered)
   - Yellow lines (partially covered)
   - Green lines (covered)

4. **Prioritize:**
   - Critical functions with low coverage
   - Error handling paths
   - Edge cases

### 📝 Strategy 4: Exclude Non-Testable Code

Update `jest.config.js`:

```javascript
collectCoverageFrom: [
  'src/**/*.{js,jsx,ts,tsx}',
  '!src/**/*.d.ts',                    // Type definitions
  '!src/**/*.stories.{js,jsx,ts,tsx}', // Storybook files
  '!src/**/__tests__/**',              // Test files
  '!src/**/*.config.{js,ts}',          // Config files
  '!src/middleware.ts',                // Middleware (hard to test)
],
```

### 📝 Strategy 5: Incremental Coverage Improvement

**Don't aim for 100% immediately:**

1. **Week 1**: Get to 50% coverage
2. **Week 2**: Improve to 65%
3. **Week 3**: Reach 75%
4. **Week 4**: Achieve 80%+

**Set realistic goals:**

```javascript
// Start conservative
coverageThresholds: {
  global: {
    branches: 60,
    functions: 60,
    lines: 70,
    statements: 70,
  },
}

// Gradually increase
coverageThresholds: {
  global: {
    branches: 70,  // Increased from 60
    functions: 70, // Increased from 60
    lines: 80,      // Increased from 70
    statements: 80, // Increased from 70
  },
}
```

### 📝 Strategy 6: Test Utilities and Helpers

Create reusable test utilities:

Create `src/__tests__/utils/test-utils.tsx`:

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

**Usage:**

```typescript
import { render, screen } from '../utils/test-utils'

// Now render includes all providers
test('example', () => {
  render(<MyComponent />)
})
```

### 📝 Strategy 7: Mock Strategically

**When to mock:**

- ✅ External APIs
- ✅ File system operations
- ✅ Time-dependent functions
- ✅ Random number generators

**When not to mock:**

- ❌ Simple utility functions
- ❌ Pure functions
- ❌ Your own business logic

### ✅ Checklist:

- [ ] Coverage strategy defined
- [ ] Critical paths identified
- [ ] Coverage exclusions configured
- [ ] Incremental improvement plan
- [ ] Test utilities created

---

## Step 19: Generating Coverage Reports

Coverage reports help visualize what's tested and what's not.

### 📝 Instructions:

1. **Update `package.json` scripts:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:coverage:html": "jest --coverage --coverageReporters=html",
    "test:coverage:ci": "jest --coverage --coverageReporters=text --coverageReporters=lcov"
  }
}
```

2. **Generate different report types:**

**Terminal Report:**
```bash
npm run test:coverage
```

**HTML Report:**
```bash
npm run test:coverage:html
# Opens coverage/lcov-report/index.html
```

**CI Report (LCOV format):**
```bash
npm run test:coverage:ci
# Generates coverage/lcov.info for CI tools
```

### 📝 Understanding Coverage Output:

**Terminal Output:**

```
 PASS  src/__tests__/lib/utils.test.ts
 PASS  src/__tests__/ui/login-form.test.tsx

File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|------------------
All files           |   85.23 |    72.45 |   90.00 |   85.23 |
 src/app/lib        |   90.00 |    80.00 |  100.00 |   90.00 |
  utils.ts          |   90.00 |    80.00 |  100.00 |   90.00 | 15
 src/app/ui         |   82.50 |    68.75 |   85.71 |   82.50 |
  login-form.tsx    |   82.50 |    68.75 |   85.71 |   82.50 | 45-46,52

Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

**What this tells you:**

- **Uncovered Line #s**: Specific lines not covered
- **Low branch coverage**: Missing tests for conditionals
- **Low function coverage**: Functions never called

### 📝 HTML Report Features:

1. **File-level view**: See coverage per file
2. **Line-level view**: See which lines are covered (green) vs uncovered (red)
3. **Branch highlighting**: See which branches are tested
4. **Search**: Find files quickly

### 📝 CI Integration:

**GitHub Actions Example:**

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage --coverageReporters=lcov
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### 📝 Coverage Badge:

Add to README:

```markdown
![Coverage](https://img.shields.io/codecov/c/github/username/repo)
```

### ✅ Checklist:

- [ ] Coverage scripts added
- [ ] HTML reports generated
- [ ] Understanding coverage output
- [ ] CI integration configured (optional)
- [ ] Coverage badge added (optional)

---

## 🎓 Key Testing Concepts Summary

### Testing Pyramid:

```
        /\
       /  \      E2E Tests (Few)
      /____\
     /      \    Integration Tests (Some)
    /________\
   /          \   Unit Tests (Many)
  /____________\
```

**Unit Tests**: Fast, isolated, test individual functions/components
**Integration Tests**: Test how parts work together
**E2E Tests**: Test complete user flows

### Testing Principles:

1. **AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test** (when possible)
3. **Test behavior, not implementation**
4. **Keep tests simple and readable**
5. **Use descriptive test names**

### Common Mistakes:

1. **Testing implementation details**
2. **Over-mocking**
3. **Not testing error cases**
4. **Flaky tests** (tests that sometimes fail)
5. **Slow tests** (too many integration points)

---

## 🐛 Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution:**
- Check `moduleNameMapper` in `jest.config.js`
- Verify path aliases match `tsconfig.json`
- Clear Jest cache: `npm test -- --clearCache`

### Issue: MSW handlers not working

**Solution:**
- Verify `server.listen()` is called in `jest.setup.js`
- Check handler URLs match exactly
- Ensure `server.resetHandlers()` in `afterEach`

### Issue: Coverage thresholds too strict

**Solution:**
- Start with lower thresholds (60-70%)
- Gradually increase as coverage improves
- Exclude non-critical files from coverage

### Issue: Pre-commit hook too slow

**Solution:**
- Use `--onlyChanged` flag
- Run linting only (skip tests in pre-commit)
- Move comprehensive tests to pre-push

### Issue: "window is not defined" errors

**Solution:**
- Ensure `jest-environment-jsdom` is set
- Mock browser APIs when needed
- Use `global` object for Node.js environment

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/docs/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🎉 Congratulations!

You've successfully learned:

- ✅ How to set up Jest and React Testing Library
- ✅ How to test React components and user interactions
- ✅ How to mock API calls with MSW
- ✅ How to test server actions and data fetching
- ✅ How to handle loading and error states
- ✅ How to understand and improve test coverage
- ✅ How to set up Husky for git hooks
- ✅ How to implement advanced coverage strategies

**Next Steps:**

- Write tests for your existing components
- Aim for 80% coverage gradually
- Set up CI/CD with coverage reporting
- Share your knowledge with your team!

Happy testing! 🚀
