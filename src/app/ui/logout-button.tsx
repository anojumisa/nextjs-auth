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