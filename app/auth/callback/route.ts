import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()

  console.log('Callback received:', { code, token_hash, type, redirectTo })

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Si hay un token_hash y es de recovery, manejar el reset de password
  if (token_hash && type === 'recovery') {
    const supabase = await createClient()
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token_hash,
        type: 'recovery'
      })
      
      if (error) {
        console.error('Error verifying token:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Token inválido o expirado')}`)
      }
      
      return NextResponse.redirect(`${origin}/auth/update-password`)
    } catch (error) {
      console.error('Error in recovery flow:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Error al procesar el enlace')}`)
    }
  }

  // Si es un flujo de recuperación de contraseña, redirigir a update-password
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/update-password`)
  }

  // Si hay un redirectTo específico, usarlo
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`)
  }

  // URL de redirección por defecto para otros tipos de autenticación
  return NextResponse.redirect(`${origin}/protected`)
}