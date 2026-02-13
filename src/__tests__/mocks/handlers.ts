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