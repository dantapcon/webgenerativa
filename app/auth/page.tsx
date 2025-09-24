"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function AuthHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      // Obtener fragmentos de la URL (después del #)
      const fragment = window.location.hash.substring(1);
      const params = new URLSearchParams(fragment);
      
      // También revisar query params normales
      const tokenHash = params.get('access_token') || searchParams.get('token_hash');
      const type = params.get('type') || searchParams.get('type');
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      console.log('Auth handler params:', { tokenHash, type, errorCode, errorDescription, fragment });

      // Manejar errores
      if (errorCode) {
        router.push(`/auth/login?error=${encodeURIComponent(errorDescription || 'Error de autenticación')}`);
        return;
      }

      // Si es recovery y tenemos un token, procesar
      if (type === 'recovery' && tokenHash) {
        const supabase = createClient();
        
        try {
          // La sesión ya debería estar establecida por el access_token
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            router.push('/auth/update-password');
            return;
          } else {
            router.push('/auth/login?error=No se pudo establecer la sesión');
            return;
          }
        } catch (error) {
          console.error('Error processing recovery:', error);
          router.push('/auth/login?error=Error al procesar el enlace de restablecimiento');
          return;
        }
      }

      // Si llegamos aquí sin parámetros relevantes, ir a login
      router.push('/auth/login');
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Procesando autenticación...</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Cargando...</p>
      </div>
    </div>
  );
}

export default function AuthHandlerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthHandlerContent />
    </Suspense>
  );
}