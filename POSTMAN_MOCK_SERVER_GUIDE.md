# Postman Mock Server Setup Guide — Booking Management System

A step-by-step guide to set up a Postman Mock Server for a **Booking Management System**, with example requests, responses, and dummy data ready for frontend development.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Postman Mock Server Setup](#postman-mock-server-setup)
4. [API Design & Dummy Data](#api-design--dummy-data)
5. [Using the Mock in Your Frontend](#using-the-mock-in-your-frontend)
6. [Tips & Best Practices](#tips--best-practices)

---

## Overview

### What is Postman Mock Server?

Postman Mock Server lets you simulate a backend API without writing server code. You define **examples** (request + response pairs) in a Postman Collection; the mock server returns the example response when a matching request is made.

### Why Use It for Frontend Development?

- **Parallel work**: Frontend and backend teams can work independently.
- **Stable contract**: Frontend relies on a fixed API contract and example data.
- **No backend dependency**: Develop and test UI without running the real API.
- **Fast iteration**: Change responses by editing examples in Postman.

### Booking Management System — Scope

This guide uses a typical **Booking Management System** with:

- **Users** — login, profile
- **Rooms/Resources** — list, details
- **Bookings** — create, list, get, update, cancel
- **Availability** — check slots

---

## Prerequisites

- [Postman](https://www.postman.com/downloads/) (Desktop or sign up at postman.com)
- A Postman account (free) for Mock Servers
- Optional: Postman CLI (`newman`) if you want to run collections from the terminal

---

## Postman Mock Server Setup

### Step 1: Create a Postman Collection

1. Open Postman.
2. Click **Collections** → **Create Collection**.
3. Name it: `Booking Management System API`.
4. (Optional) Add a short description, e.g. “Mock API for BMS frontend development.”

### Step 2: Add Folders and Requests

Create folders and empty requests as below. You will attach **examples** to these requests so the mock server knows what to return.

Suggested structure:

```
Booking Management System API
├── Auth
│   ├── POST Login
│   └── GET Profile
├── Rooms
│   ├── GET List Rooms
│   └── GET Room by ID
├── Bookings
│   ├── GET List Bookings
│   ├── GET Booking by ID
│   ├── POST Create Booking
│   ├── PATCH Update Booking
│   └── DELETE Cancel Booking
└── Availability
    └── GET Check Availability
```

**How to add a request:**

- Right‑click the folder → **Add request**.
- Set method and URL (e.g. `GET` and `{{baseUrl}}/rooms`).
- Use a variable `baseUrl` so you can point it to the mock server URL later.

### Step 3: Create a Mock Server

1. Click the **...** on your collection → **Mock collection**.
2. Choose **Create Mock Server**.
3. Name it: `Booking Management System Mock`.
4. (Optional) Check **Save the mock server URL as an environment variable**.
5. Click **Create Mock Server**.
6. Copy the **Mock Server URL** (e.g. `https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.mock.pstmn.io`).

You will use this URL as `baseUrl` in your frontend.

### Step 4: Add Examples to Each Request

For the mock to return data, every request that the frontend will call **must have at least one example**.

For each request:

1. Open the request.
2. Click **Save Response** (or the **Examples** tab) → **Add Example**.
3. Name the example (e.g. `Success`, `List rooms`).
4. Set the **Response** body to the JSON from the [Dummy Data](#api-design--dummy-data) section below.
5. Set **Status** (e.g. 200, 201, 404) and **Headers** if needed (e.g. `Content-Type: application/json`).
6. Save the example.

Repeat for success and, if you want, error cases (e.g. 400, 404).

---

## API Design & Dummy Data

Base path: `/api` (or as you prefer). All URLs below are relative to your mock base URL.

---

### 1. Auth

#### POST `/api/auth/login`

**Request body:**

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK) — use as mock example:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "usr_001",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "user",
      "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-abc123",
    "expiresAt": "2025-03-28T12:00:00.000Z"
  }
}
```

**Error example (401) — optional:**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

#### GET `/api/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "usr_001",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "user",
    "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    "createdAt": "2024-01-15T08:00:00.000Z"
  }
}
```

---

### 2. Rooms

#### GET `/api/rooms`

**Query params (optional):** `?page=1&limit=10&search=meeting`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room_001",
        "name": "Meeting Room A",
        "capacity": 8,
        "floor": 1,
        "amenities": ["TV", "Whiteboard", "Video Conferencing"],
        "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
        "hourlyRate": 25.00,
        "currency": "USD",
        "isAvailable": true
      },
      {
        "id": "room_002",
        "name": "Conference Hall",
        "capacity": 30,
        "floor": 2,
        "amenities": ["Projector", "Sound System", "Stage", "Catering"],
        "imageUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        "hourlyRate": 120.00,
        "currency": "USD",
        "isAvailable": true
      },
      {
        "id": "room_003",
        "name": "Focus Pod B",
        "capacity": 4,
        "floor": 1,
        "amenities": ["Whiteboard", "Monitor"],
        "imageUrl": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400",
        "hourlyRate": 15.00,
        "currency": "USD",
        "isAvailable": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

#### GET `/api/rooms/:id`

**Example:** `GET /api/rooms/room_001`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "room_001",
    "name": "Meeting Room A",
    "capacity": 8,
    "floor": 1,
    "amenities": ["TV", "Whiteboard", "Video Conferencing"],
    "imageUrl": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    "hourlyRate": 25.00,
    "currency": "USD",
    "isAvailable": true,
    "description": "Spacious meeting room ideal for team standups and client calls. Equipped with TV and video conferencing."
  }
}
```

**Not found (404) — optional:**

```json
{
  "success": false,
  "message": "Room not found",
  "code": "ROOM_NOT_FOUND"
}
```

---

### 3. Bookings

#### GET `/api/bookings`

**Query params (optional):** `?page=1&limit=10&status=confirmed&userId=usr_001`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "book_001",
        "roomId": "room_001",
        "roomName": "Meeting Room A",
        "userId": "usr_001",
        "userName": "John Doe",
        "startTime": "2025-03-01T09:00:00.000Z",
        "endTime": "2025-03-01T11:00:00.000Z",
        "status": "confirmed",
        "title": "Sprint Planning",
        "notes": "Bring laptop and dongles",
        "createdAt": "2025-02-25T10:00:00.000Z"
      },
      {
        "id": "book_002",
        "roomId": "room_002",
        "roomName": "Conference Hall",
        "userId": "usr_001",
        "userName": "John Doe",
        "startTime": "2025-03-05T14:00:00.000Z",
        "endTime": "2025-03-05T17:00:00.000Z",
        "status": "pending",
        "title": "All-Hands Meeting",
        "notes": null,
        "createdAt": "2025-02-26T09:30:00.000Z"
      },
      {
        "id": "book_003",
        "roomId": "room_003",
        "roomName": "Focus Pod B",
        "userId": "usr_002",
        "userName": "Jane Smith",
        "startTime": "2025-02-28T10:00:00.000Z",
        "endTime": "2025-02-28T12:00:00.000Z",
        "status": "cancelled",
        "title": "Deep Work",
        "notes": null,
        "createdAt": "2025-02-20T14:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

#### GET `/api/bookings/:id`

**Example:** `GET /api/bookings/book_001`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "book_001",
    "room": {
      "id": "room_001",
      "name": "Meeting Room A",
      "capacity": 8,
      "floor": 1,
      "hourlyRate": 25.00,
      "currency": "USD"
    },
    "user": {
      "id": "usr_001",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "startTime": "2025-03-01T09:00:00.000Z",
    "endTime": "2025-03-01T11:00:00.000Z",
    "status": "confirmed",
    "title": "Sprint Planning",
    "notes": "Bring laptop and dongles",
    "totalAmount": 50.00,
    "currency": "USD",
    "createdAt": "2025-02-25T10:00:00.000Z",
    "updatedAt": "2025-02-25T10:00:00.000Z"
  }
}
```

---

#### POST `/api/bookings`

**Request body:**

```json
{
  "roomId": "room_001",
  "startTime": "2025-03-10T09:00:00.000Z",
  "endTime": "2025-03-10T10:30:00.000Z",
  "title": "Client Call",
  "notes": "Optional notes"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "book_004",
    "roomId": "room_001",
    "roomName": "Meeting Room A",
    "userId": "usr_001",
    "userName": "John Doe",
    "startTime": "2025-03-10T09:00:00.000Z",
    "endTime": "2025-03-10T10:30:00.000Z",
    "status": "pending",
    "title": "Client Call",
    "notes": "Optional notes",
    "totalAmount": 37.50,
    "currency": "USD",
    "createdAt": "2025-02-28T12:00:00.000Z"
  }
}
```

**Validation error (400) — optional:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "roomId", "message": "Room is required" },
    { "field": "startTime", "message": "Start time must be in the future" }
  ]
}
```

---

#### PATCH `/api/bookings/:id`

**Example:** `PATCH /api/bookings/book_001`  
**Request body (all fields optional):**

```json
{
  "startTime": "2025-03-01T10:00:00.000Z",
  "endTime": "2025-03-01T12:00:00.000Z",
  "title": "Sprint Planning (Updated)",
  "notes": "Updated notes",
  "status": "confirmed"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking updated successfully",
  "data": {
    "id": "book_001",
    "roomId": "room_001",
    "roomName": "Meeting Room A",
    "userId": "usr_001",
    "userName": "John Doe",
    "startTime": "2025-03-01T10:00:00.000Z",
    "endTime": "2025-03-01T12:00:00.000Z",
    "status": "confirmed",
    "title": "Sprint Planning (Updated)",
    "notes": "Updated notes",
    "totalAmount": 50.00,
    "currency": "USD",
    "createdAt": "2025-02-25T10:00:00.000Z",
    "updatedAt": "2025-02-28T14:00:00.000Z"
  }
}
```

---

#### DELETE `/api/bookings/:id`

**Example:** `DELETE /api/bookings/book_001`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "book_001",
    "status": "cancelled"
  }
}
```

**Not found (404) — optional:**

```json
{
  "success": false,
  "message": "Booking not found",
  "code": "BOOKING_NOT_FOUND"
}
```

---

### 4. Availability

#### GET `/api/availability`

**Query params:** `?roomId=room_001&date=2025-03-01`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "roomId": "room_001",
    "roomName": "Meeting Room A",
    "date": "2025-03-01",
    "slots": [
      { "start": "08:00", "end": "09:00", "available": true },
      { "start": "09:00", "end": "10:00", "available": false },
      { "start": "10:00", "end": "11:00", "available": false },
      { "start": "11:00", "end": "12:00", "available": true },
      { "start": "12:00", "end": "13:00", "available": true },
      { "start": "13:00", "end": "14:00", "available": true },
      { "start": "14:00", "end": "15:00", "available": true },
      { "start": "15:00", "end": "16:00", "available": false },
      { "start": "16:00", "end": "17:00", "available": true },
      { "start": "17:00", "end": "18:00", "available": true }
    ],
    "timezone": "UTC"
  }
}
```

---

## Using the Mock in Your Frontend

### 1. Base URL / environment variable

Point your app’s API base URL to the Postman Mock Server URL:

**`.env.local` (Next.js / Node):**

```env
NEXT_PUBLIC_API_BASE_URL=https://xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.mock.pstmn.io
```

**Or in code:**

```ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-mock-id.mock.pstmn.io';
```

### 2. Paths must match the collection

Mock matching is usually based on **method + path**. So in your collection:

- Use paths like `/api/rooms`, `/api/bookings`, `/api/bookings/room_001`, etc.
- In Postman, you can use path variables: `/api/rooms/{{roomId}}` and add an example for `roomId = room_001`.

In the frontend, call the same paths:

```ts
const res = await fetch(`${API_BASE}/api/rooms`);
const res2 = await fetch(`${API_BASE}/api/bookings/book_001`);
```

### 3. Optional: Postman API Key (if you enabled “Private” mock)

If the mock is private, send the API key in a header:

```ts
const headers: HeadersInit = {
  'Content-Type': 'application/json',
  'x-api-key': process.env.NEXT_PUBLIC_POSTMAN_API_KEY ?? '',
};
await fetch(`${API_BASE}/api/rooms`, { headers });
```

Add `NEXT_PUBLIC_POSTMAN_API_KEY` in Postman (Mock Server → Settings) and in `.env.local`.

### 4. CORS

Postman Mock Servers usually allow browser requests. If you see CORS errors, check Postman Mock Server settings or use a simple proxy in development.

### 5. Switching to real API later

Keep a single place that defines `API_BASE`. When the real backend is ready, change the env to the real API URL; no need to change request paths if they match.

---

## Tips & Best Practices

1. **One example per “case”**: Add one example for success (200/201) and optionally for 400, 401, 404 so the frontend can handle errors.
2. **Consistent envelope**: Use a common shape (e.g. `{ success, data?, message?, errors? }`) so the frontend can parse responses uniformly.
3. **IDs and dates**: Use fixed IDs (`room_001`, `book_001`) and dates in the examples so the UI is predictable; switch to real IDs when integrating the real API.
4. **Pagination**: Always include a `pagination` object in list responses so the frontend can implement pagination from day one.
5. **Export collection**: Export the collection (JSON) and commit it to the repo so the team can re-create or update the mock from the same contract.
6. **Document in README**: In the project README, add the mock server URL and a one-liner on how to use it (e.g. “Set `NEXT_PUBLIC_API_BASE_URL` to the mock URL for frontend-only development”).

---

## Quick Reference — All Endpoints & Methods

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/auth/login`       | Login |
| GET    | `/api/auth/profile`     | Current user profile |
| GET    | `/api/rooms`            | List rooms |
| GET    | `/api/rooms/:id`        | Room by ID |
| GET    | `/api/bookings`         | List bookings |
| GET    | `/api/bookings/:id`     | Booking by ID |
| POST   | `/api/bookings`         | Create booking |
| PATCH  | `/api/bookings/:id`     | Update booking |
| DELETE | `/api/bookings/:id`     | Cancel booking |
| GET    | `/api/availability`     | Availability slots (query: `roomId`, `date`) |

---

You can copy the JSON blocks from the [API Design & Dummy Data](#api-design--dummy-data) section into Postman examples as-is. Once every request has at least one example, your Booking Management System frontend can use the Postman Mock Server for development and UI testing without a real backend.
