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