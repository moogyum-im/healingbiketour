import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ role: null })
    }

    // SECURITY DEFINER 함수로 RLS 우회
    const { data, error } = await supabase.rpc('get_my_role')

    if (error) {
      console.error('[role] rpc error:', error.message)
      // fallback: 직접 쿼리 시도
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      return NextResponse.json({ role: profile?.role ?? 'user' })
    }

    return NextResponse.json({ role: data ?? 'user' })
  } catch (e) {
    console.error('[role] unexpected error:', e)
    return NextResponse.json({ role: 'user' })
  }
}
