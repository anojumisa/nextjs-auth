# Next.js Authentication & Authorization Tutorial

A beginner-friendly step-by-step guide to implementing authentication and Role-Based Access Control (RBAC) in Next.js using the Platzi Fake API.

## 📚 What You'll Learn

- ✅ How to authenticate users using JWT tokens
- ✅ How to manage sessions with cookies
- ✅ How to protect routes based on authentication
- ✅ How to implement Role-Based Access Control (RBAC)
- ✅ How to create login/logout functionality

## 🎯 Prerequisites

- Basic knowledge of React and Next.js
- Node.js installed on your machine
- Understanding of HTTP requests and responses

## 📋 Table of Contents

1. [Setup & Installation](#step-1-setup--installation)
2. [Set Up Session Management](#step-2-set-up-session-management)
3. [Create Type Definitions](#step-3-create-type-definitions)
4. [Create Authentication Server Actions](#step-4-create-authentication-server-actions)
5. [Create Login Form Component](#step-5-create-login-form-component)
6. [Create Login Page](#step-6-create-login-page)
7. [Create Data Access Layer (DAL)](#step-7-create-data-access-layer-dal)
8. [Create Protected Dashboard Page](#step-8-create-protected-dashboard-page)
9. [Implement RBAC - Admin Page](#step-9-implement-rbac---admin-page)
10. [Create Logout Functionality](#step-10-create-logout-functionality)
11. [Add Route Protection with Proxy](#step-11-add-route-protection-with-proxy)
12. [Update Home Page](#step-12-update-home-page)
13. [Adding New Protected Routes (RBAC Strategy)](#step-13-adding-new-protected-routes-rbac-strategy)

---

## Step 1: Setup & Installation

### ✅ Checklist:

- [ ] Make sure you have Node.js installed
- [ ] Navigate to your project directory
- [ ] Verify Next.js is running: `npm run dev`

**What we're doing:** We're setting up the foundation for our authentication system.

**Note:** This tutorial uses only built-in Next.js features - no external dependencies needed!

---

## Step 2: Set Up Session Management

We'll create functions to store and retrieve session data using cookies. We'll use simple JSON serialization instead of encryption for simplicity.

### 📝 Instructions:

1. Create a new directory: `src/app/lib`
2. Create a file: `src/app/lib/session.ts`
3. Add the following code:

```typescript
import { cookies } from "next/headers";

export interface SessionPayload {
	userId: number;
	email: string;
	role: string;
	expiresAt: string; // Store as ISO string for JSON serialization
}

export async function createSession(
	userId: number,
	email: string,
	role: string,
) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
	const session: SessionPayload = {
		userId,
		email,
		role,
		expiresAt: expiresAt.toISOString(),
	};
	const cookieStore = await cookies();

	cookieStore.set("session", JSON.stringify(session), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		sameSite: "lax",
		path: "/",
	});
}

export async function deleteSession() {
	const cookieStore = await cookies();
	cookieStore.delete("session");
}

export async function getSession(): Promise<SessionPayload | null> {
	const cookie = (await cookies()).get("session")?.value;
	if (!cookie) return null;

	try {
		const session: SessionPayload = JSON.parse(cookie);
		// Check if session expired
		if (new Date(session.expiresAt) < new Date()) {
			return null;
		}
		return session;
	} catch (error) {
		return null;
	}
}
```

**What this code does:**

- `createSession()`: Stores user session data in a cookie as JSON
- `deleteSession()`: Removes the session cookie
- `getSession()`: Gets and parses the current session, checking if it's expired

**Note:** For production apps, consider encrypting session data. This simplified approach is great for learning!

### ✅ Checklist:

- [ ] File created at `src/app/lib/session.ts`
- [ ] All functions added correctly
- [ ] No TypeScript errors

---

## Step 3: Create Type Definitions

We'll define TypeScript types for our form state and API responses.

### 📝 Instructions:

1. Create a file: `src/app/lib/definitions.ts`
2. Add the following code:

```typescript
export type LoginFormState =
	| {
			errors?: {
				email?: string;
				password?: string;
			};
			message?: string;
	  }
	| undefined;

// User type from Platzi API
export interface User {
	id: number;
	email: string;
	password: string;
	name: string;
	role: "customer" | "admin";
	avatar: string;
}

// Auth response from Platzi API
export interface AuthResponse {
	access_token: string;
	refresh_token: string;
}
```

**What this code does:**

- Defines TypeScript types for form validation errors
- Types for API responses and user data

### ✅ Checklist:

- [ ] File created at `src/app/lib/definitions.ts`
- [ ] All types added

---

## Step 4: Create Authentication Server Actions

Server Actions handle authentication logic securely on the server. We'll use manual validation instead of a validation library.

### 📝 Instructions:

1. Create a directory: `src/app/actions`
2. Create a file: `src/app/actions/auth.ts`
3. Add the following code:

```typescript
"use server";

import { redirect } from "next/navigation";
import { LoginFormState, User, AuthResponse } from "@/app/lib/definitions";
import { createSession, deleteSession } from "@/app/lib/session";

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

// Simple email validation function
function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function login(state: LoginFormState, formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	// Manual validation
	const errors: { email?: string; password?: string } = {};

	if (!email || !isValidEmail(email)) {
		errors.email = "Please enter a valid email address.";
	}

	if (!password || password.trim().length === 0) {
		errors.password = "Password is required.";
	}

	// Return early if validation fails
	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	try {
		// Call Platzi API to authenticate
		const loginResponse = await fetch(`${PLATZI_API_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
		});

		if (!loginResponse.ok) {
			return {
				message: "Invalid email or password. Please try again.",
			};
		}

		const authData: AuthResponse = await loginResponse.json();

		// Get user profile using access token
		const profileResponse = await fetch(`${PLATZI_API_URL}/auth/profile`, {
			headers: {
				Authorization: `Bearer ${authData.access_token}`,
			},
		});

		if (!profileResponse.ok) {
			return {
				message: "Failed to fetch user profile.",
			};
		}

		const user: User = await profileResponse.json();

		// Create session with user data
		await createSession(user.id, user.email, user.role);

		// Redirect to dashboard
		redirect("/dashboard");
	} catch (error) {
		console.error("Login error:", error);
		return {
			message: "An error occurred during login. Please try again.",
		};
	}
}

export async function logout() {
	await deleteSession();
	redirect("/login");
}
```

**What this code does:**

- Validates login form data using manual checks
- Calls Platzi API to authenticate
- Fetches user profile
- Creates a session cookie
- Handles logout

### ✅ Checklist:

- [ ] File created at `src/app/actions/auth.ts`
- [ ] `login` function implemented
- [ ] `logout` function implemented
- [ ] Error handling added

---

## Step 5: Create Login Form Component

We'll create a reusable login form component.

### 📝 Instructions:

1. Create a directory: `src/app/ui`
2. Create a file: `src/app/ui/login-form.tsx`
3. Add the following code:

```typescript
'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4 max-w-md mx-auto mt-8">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="john@mail.com"
          required
          className="w-full px-4 py-2 border rounded-md"
        />
        {state?.errors?.email && (
          <p className="text-red-500 text-sm mt-1">{state.errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="changeme"
          required
          className="w-full px-4 py-2 border rounded-md"
        />
        {state?.errors?.password && (
          <p className="text-red-500 text-sm mt-1">{state.errors.password}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Logging in...' : 'Login'}
      </button>

      <div className="text-sm text-gray-600 mt-4">
        <p><strong>Test Credentials:</strong></p>
        <p>Email: john@mail.com</p>
        <p>Password: changeme</p>
      </div>
    </form>
  )
}
```

**What this code does:**

- Creates a form with email and password fields
- Shows validation errors
- Displays loading state during submission
- Uses React's `useActionState` hook

### ✅ Checklist:

- [ ] File created at `src/app/ui/login-form.tsx`
- [ ] Form fields added
- [ ] Error handling implemented
- [ ] Styling added (using Tailwind CSS)

---

## Step 6: Create Login Page

Create a dedicated login page.

### 📝 Instructions:

1. Create a directory: `src/app/login`
2. Create a file: `src/app/login/page.tsx`
3. Add the following code:

```typescript
import LoginForm from '@/app/ui/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        <LoginForm />
      </div>
    </div>
  )
}
```

### ✅ Checklist:

- [ ] File created at `src/app/login/page.tsx`
- [ ] LoginForm component imported and used
- [ ] Page is accessible at `/login`

---

## Step 7: Create Data Access Layer (DAL)

The DAL centralizes authentication checks and data fetching.

### 📝 Instructions:

1. Create a file: `src/app/lib/dal.ts`
2. Add the following code:

```typescript
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { User } from "@/app/lib/definitions";

const PLATZI_API_URL = "https://api.escuelajs.co/api/v1";

export const verifySession = cache(async () => {
	const session = await getSession();

	if (!session?.userId) {
		redirect("/login");
	}

	return {
		isAuth: true,
		userId: session.userId,
		email: session.email,
		role: session.role,
	};
});

export const getUser = cache(async (): Promise<User | null> => {
	const session = await verifySession();

	try {
		const response = await fetch(`${PLATZI_API_URL}/users/${session.userId}`);

		if (!response.ok) {
			return null;
		}

		const user: User = await response.json();
		return user;
	} catch (error) {
		console.error("Failed to fetch user:", error);
		return null;
	}
});

export const requireRole = cache(async (allowedRoles: string[]) => {
	const session = await verifySession();

	if (!allowedRoles.includes(session.role)) {
		redirect("/dashboard");
	}

	return session;
});
```

**What this code does:**

- `verifySession()`: Checks if user is authenticated
- `getUser()`: Fetches user data
- `requireRole()`: Checks if user has required role (RBAC)

### ✅ Checklist:

- [ ] File created at `src/app/lib/dal.ts`
- [ ] All functions implemented
- [ ] Uses React's `cache` for optimization

---

## Step 8: Create Protected Dashboard Page

Create a dashboard that requires authentication.

### 📝 Instructions:

1. Create a directory: `src/app/dashboard`
2. Create a file: `src/app/dashboard/page.tsx`
3. Add the following code:

```typescript
import { verifySession, getUser } from '@/app/lib/dal'
import { logout } from '@/app/actions/auth'

export default async function DashboardPage() {
  const session = await verifySession()
  const user = await getUser()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form action={logout}>
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>

          {user && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> <span className="capitalize">{user.role}</span></p>
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mt-4"
                />
              )}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Available Actions:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>View your profile</li>
              {session.role === 'admin' && (
                <li>
                  <a href="/admin" className="text-blue-600 hover:underline">
                    Access Admin Panel
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**What this code does:**

- Requires authentication to access
- Displays user information
- Shows role-based content
- Includes logout button

### ✅ Checklist:

- [ ] File created at `src/app/dashboard/page.tsx`
- [ ] Authentication check implemented
- [ ] User data displayed
- [ ] Logout functionality added

---

## Step 9: Implement RBAC - Admin Page

Create an admin-only page using Role-Based Access Control.

### 📝 Instructions:

1. Create a directory: `src/app/admin`
2. Create a file: `src/app/admin/page.tsx`
3. Add the following code:

```typescript
import { requireRole } from '@/app/lib/dal'

export default async function AdminPage() {
  // This will redirect non-admin users to dashboard
  const session = await requireRole(['admin'])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg mb-6">
          <p className="font-semibold">⚠️ Admin Only Area</p>
          <p className="text-sm mt-1">
            Only users with the "admin" role can access this page.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
          <ul className="space-y-2">
            <li>✅ Manage users</li>
            <li>✅ View analytics</li>
            <li>✅ System settings</li>
            <li>✅ Content moderation</li>
          </ul>

          <div className="mt-6">
            <p><strong>Current User:</strong> {session.email}</p>
            <p><strong>Role:</strong> {session.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**What this code does:**

- Only allows admin users to access
- Redirects non-admin users automatically
- Demonstrates RBAC in action

### ✅ Checklist:

- [ ] File created at `src/app/admin/page.tsx`
- [ ] `requireRole` function used
- [ ] Admin-only content displayed

---

## Step 10: Create Logout Functionality

We already created the logout action, but let's add a logout button component.

### 📝 Instructions:

1. Create a file: `src/app/ui/logout-button.tsx`
2. Add the following code:

```typescript
'use client'

import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={() => {
        startTransition(() => {
          logout()
        })
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? 'Logging out...' : 'Logout'}
      </button>
    </form>
  )
}
```

### ✅ Checklist:

- [ ] Logout button component created
- [ ] Can be reused across pages

---

## Step 11: Add Route Protection with Proxy

In **Next.js 16**, `middleware.ts` has been renamed to `proxy.ts`. The Proxy runs code on the server before a request is completed, allowing you to modify responses through redirects, header manipulation, and more.

### 📝 Instructions:

1. Create a file: `proxy.ts` at the **project root** (same level as `next.config.ts`, not inside `src/app`).
2. Add the following code:

```typescript
import { NextRequest, NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard", "/admin"];
const publicRoutes = ["/login", "/"];

export default async function proxy(req: NextRequest) {
	const path = req.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) =>
		path.startsWith(route),
	);
	const isPublicRoute = publicRoutes.includes(path);

	// Get session from request cookies (Node.js runtime: use req.cookies)
	const cookie = req.cookies.get("session")?.value;
	let session: { userId?: number; role?: string; expiresAt?: string } | null =
		null;

	if (cookie) {
		try {
			session = JSON.parse(cookie);
			if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
				session = null;
			}
		} catch {
			session = null;
		}
	}

	// Redirect to login if accessing protected route without session
	if (isProtectedRoute && !session?.userId) {
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("redirect", path);
		return NextResponse.redirect(loginUrl);
	}

	// Redirect authenticated users away from login page
	if (isPublicRoute && path === "/login" && session?.userId) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	// Check admin access for admin routes
	if (path.startsWith("/admin") && session?.role !== "admin") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	return NextResponse.next();
}

// Configure which routes the proxy runs on
export const config = {
	matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
```

**What this code does:**

- Runs on every matching request before the page is rendered.
- Protects routes before they're accessed.
- Redirects unauthenticated users to login.
- Redirects authenticated users away from the login page.
- Enforces admin-only access for `/admin`.

**Note:** In Next.js 16, `middleware.ts` is deprecated and replaced with `proxy.ts`. The Proxy runs in the Node.js runtime by default (not Edge Runtime), which provides better security and full Node.js API access.

### ✅ Checklist:

- [ ] File created at `proxy.ts` (project root)
- [ ] Route protection logic implemented
- [ ] Admin route protection added

---

## Step 12: Update Home Page

Update the home page to show login link or redirect authenticated users.

### 📝 Instructions:

1. Update `src/app/page.tsx`:

```typescript
import Link from 'next/link'
import { getSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getSession()

  // Redirect authenticated users to dashboard
  if (session?.userId) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-lg mb-8">Please login to access your dashboard.</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-block"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
```

### ✅ Checklist:

- [ ] Home page updated
- [ ] Redirects authenticated users
- [ ] Shows login link for unauthenticated users

---

## Step 13: Adding New Protected Routes (RBAC Strategy)

When creating new protected pages in the future, you need to implement **two-layer protection**:

1. **Edge Protection** (`proxy.ts`): First line of defense - redirects unauthenticated users before the page loads
2. **Page-level Protection** (DAL functions): Second line of defense - server-side checks in your page component

### 📝 Two-Layer Protection Strategy

#### Layer 1: Edge Protection (`proxy.ts`)

Add your route to the `protectedRoutes` array in `proxy.ts` to redirect unauthenticated users before the page loads.

#### Layer 2: Page-level Protection (DAL Functions)

Use `verifySession()` or `requireRole()` in your page component for server-side checks.

### 📋 Examples for Different Scenarios

#### Scenario 1: Protected Page (Any Authenticated User)

**Example:** `/profile` page

1. **Update `proxy.ts`:**
```typescript
const protectedRoutes = ["/dashboard", "/admin", "/profile"];
```

2. **Create the page** (`src/app/profile/page.tsx`):
```typescript
import { verifySession, getUser } from "@/app/lib/dal";

export default async function ProfilePage() {
  // Redirects to /login if not authenticated
  const session = await verifySession();
  const user = await getUser();

  return (
    <div className="min-h-screen p-8">
      <h1>Profile Page</h1>
      <p>Welcome, {user?.name}!</p>
      {/* Your profile content */}
    </div>
  );
}
```

#### Scenario 2: Role-Specific Page (Single Role)

**Example:** `/moderator` page (moderator-only)

1. **Update `proxy.ts`:**
```typescript
const protectedRoutes = ["/dashboard", "/admin", "/profile", "/moderator"];

// Add role check in proxy.ts
if (path.startsWith("/moderator") && session?.role !== "moderator") {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

2. **Create the page** (`src/app/moderator/page.tsx`):
```typescript
import { requireRole } from "@/app/lib/dal";

export default async function ModeratorPage() {
  // Redirects non-moderator users to /dashboard
  const session = await requireRole(["moderator"]);

  return (
    <div className="min-h-screen p-8">
      <h1>Moderator Panel</h1>
      <p>Only moderators can see this.</p>
    </div>
  );
}
```

#### Scenario 3: Multiple Roles Allowed

**Example:** `/editor` page (admin OR editor)

1. **Update `proxy.ts`:**
```typescript
const protectedRoutes = ["/dashboard", "/admin", "/profile", "/moderator", "/editor"];

// Add role check in proxy.ts
if (path.startsWith("/editor") && !["admin", "editor"].includes(session?.role || "")) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
```

2. **Create the page** (`src/app/editor/page.tsx`):
```typescript
import { requireRole } from "@/app/lib/dal";

export default async function EditorPage() {
  // Allows both admin and editor roles
  const session = await requireRole(["admin", "editor"]);

  return (
    <div className="min-h-screen p-8">
      <h1>Editor Panel</h1>
      <p>Welcome, {session.email}!</p>
    </div>
  );
}
```

#### Scenario 4: Nested Routes

**Example:** `/settings/account` and `/settings/billing`

1. **Update `proxy.ts`:**
```typescript
const protectedRoutes = [
  "/dashboard", 
  "/admin", 
  "/profile", 
  "/moderator", 
  "/editor",
  "/settings"  // This protects all /settings/* routes
];
```

2. **Create nested pages:**

`src/app/settings/account/page.tsx`:
```typescript
import { verifySession } from "@/app/lib/dal";

export default async function AccountSettingsPage() {
  const session = await verifySession();
  
  return (
    <div>
      <h1>Account Settings</h1>
      {/* Settings content */}
    </div>
  );
}
```

`src/app/settings/billing/page.tsx`:
```typescript
import { requireRole } from "@/app/lib/dal";

export default async function BillingSettingsPage() {
  // Only admin can access billing settings
  const session = await requireRole(["admin"]);
  
  return (
    <div>
      <h1>Billing Settings</h1>
      {/* Billing content */}
    </div>
  );
}
```

### 📊 Quick Reference Guide

| Page Type | Proxy.ts | Page Component |
|-----------|----------|----------------|
| **Any authenticated user** | Add to `protectedRoutes` | Use `verifySession()` |
| **Single role only** | Add to `protectedRoutes` + role check | Use `requireRole(["role"])` |
| **Multiple roles** | Add to `protectedRoutes` + role check | Use `requireRole(["role1", "role2"])` |
| **Nested routes** | Add parent route to `protectedRoutes` | Use appropriate DAL function in each page |

### ✅ Best Practices

1. **Always update both layers**: Update `proxy.ts` for edge protection AND add page-level checks for security
2. **Use `verifySession()`** for general authentication checks
3. **Use `requireRole()`** for role-specific pages
4. **Keep role checks in sync**: When adding role restrictions, update both `proxy.ts` AND the page component

### 🔧 Advanced: Scalable Proxy Configuration

For better maintainability as you add more routes, you can use a more scalable approach in `proxy.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = [
  "/dashboard", 
  "/admin", 
  "/profile",
  "/moderator",
  "/editor",
  "/settings"
];
const publicRoutes = ["/login", "/"];

// Define role-specific routes
const roleRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/moderator": ["moderator"],
  "/editor": ["admin", "editor"],
};

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isPublicRoute = publicRoutes.includes(path);

  // Get session from request cookies
  const cookie = req.cookies.get("session")?.value;
  let session: { userId?: number; role?: string; expiresAt?: string } | null =
    null;

  if (cookie) {
    try {
      session = JSON.parse(cookie);
      if (session && session.expiresAt && new Date(session.expiresAt) < new Date()) {
        session = null;
      }
    } catch {
      session = null;
    }
  }

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isPublicRoute && path === "/login" && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Check role-based access for specific routes
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (path.startsWith(route)) {
      if (!session?.role || !allowedRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
```

This approach scales better as you add more protected pages and makes role management easier.

### ✅ Checklist:

- [ ] Understand two-layer protection strategy
- [ ] Know when to use `verifySession()` vs `requireRole()`
- [ ] Can add new protected routes following the examples
- [ ] Updated `proxy.ts` with new routes
- [ ] Added appropriate DAL function calls in page components

---

## 🧪 Testing Your Implementation

### Test Checklist:

1. **Test Login Flow:**
   - [ ] Go to `/login`
   - [ ] Enter test credentials: `john@mail.com` / `changeme`
   - [ ] Should redirect to `/dashboard`
   - [ ] Should see user information

2. **Test Protected Routes:**
   - [ ] Try accessing `/dashboard` without logging in
   - [ ] Should redirect to `/login`
   - [ ] After login, should access `/dashboard` successfully

3. **Test RBAC:**
   - [ ] Try accessing `/admin` as a regular user
   - [ ] Should redirect to `/dashboard`
   - [ ] (If you have admin credentials) Login as admin and access `/admin`
   - [ ] Should see admin panel

4. **Test Logout:**
   - [ ] Click logout button
   - [ ] Should redirect to `/login`
   - [ ] Try accessing `/dashboard` again
   - [ ] Should redirect to `/login`

5. **Test Session Persistence:**
   - [ ] Login successfully
   - [ ] Refresh the page
   - [ ] Should remain logged in
   - [ ] Close browser and reopen
   - [ ] Should still be logged in (cookie persists)

---

## 🎓 Key Concepts Explained

### Authentication vs Authorization

- **Authentication**: Verifying who the user is (login)
- **Authorization**: Determining what the user can do (RBAC)

### Cookies vs Local Storage

- **Cookies**: Sent with every request, can be httpOnly (more secure)
- **Local Storage**: Only accessible via JavaScript (less secure for tokens)

### Server Actions

- Run only on the server
- Secure place to handle authentication
- Can't be accessed directly from the client

### RBAC (Role-Based Access Control)

- Users have roles (e.g., 'admin', 'customer')
- Pages check user roles before allowing access
- Different users see different content

### Why We Use JSON Instead of Encryption

- **Simpler**: No external dependencies needed
- **Easier to understand**: Students can see exactly what's stored
- **Good for learning**: Focuses on authentication concepts
- **Note**: For production apps, consider encrypting session data for better security

---

## 🐛 Troubleshooting

### Issue: Login doesn't work

**Solution:**

- Check browser console for errors
- Verify Platzi API is accessible
- Check network tab for API responses
- Make sure email format is valid

### Issue: Redirect loops

**Solution:**

- Check `proxy.ts` logic
- Verify session is being created correctly
- Check cookie settings
- Clear browser cookies and try again

### Issue: Admin page accessible to non-admins

**Solution:**

- Verify `requireRole` function is called
- Check user role in session
- Verify `proxy.ts` admin check
- Check browser DevTools > Application > Cookies to see session data

### Issue: Session not persisting

**Solution:**

- Check cookie expiration date
- Verify cookie is being set correctly
- Check browser settings (cookies enabled?)
- Try in incognito/private mode

---

## 📚 Additional Resources

- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)
- [Platzi Fake API Documentation](https://fakeapi.platzi.com/en/rest/auth-jwt/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)

---

## 🎉 Congratulations!

You've successfully implemented:

- ✅ User authentication with JWT tokens from Platzi API
- ✅ Cookie-based session management (using JSON)
- ✅ Protected routes
- ✅ Role-Based Access Control (RBAC)

**Next Steps:**

- Add more roles (e.g., 'moderator', 'editor')
- Implement refresh token functionality
- Add password reset flow
- Create user registration
- Add proxy for API routes
- Consider encrypting session data for production

---

## 📝 Notes for Students

- Always validate data on the server
- Never trust client-side checks alone
- Keep session payloads minimal
- Test authentication flows thoroughly
- For production apps, consider using encryption libraries for session data
- This tutorial uses simplified approaches perfect for learning - production apps may need additional security measures

Happy coding! 🚀
