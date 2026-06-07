'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface SessionContextValue {
  user: User | null
  role: 'user' | 'admin' | null
  loading: boolean
}

const SessionContext = createContext<SessionContextValue>({ user: null, role: null, loading: true })

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<'user' | 'admin' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const loadRole = async () => {
      try {
        const res = await fetch('/api/auth/role', { cache: 'no-store' })
        const json = await res.json()
        setRole(json.role)
      } catch {
        setRole('user')
      } finally {
        setLoading(false)
      }
    }

    const loadUser = async (u: User | null) => {
      setUser(u)
      if (u) {
        await loadRole()
      } else {
        setRole(null)
        setLoading(false)
      }
    }

    supabase.auth.getUser().then(({ data }) => loadUser(data.user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <SessionContext.Provider value={{ user, role, loading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
