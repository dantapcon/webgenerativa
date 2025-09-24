"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePasswordReset = async () => {
      // Primero, verificar si hay errores en los fragments
      const checkForErrors = () => {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const errorCode = params.get('error_code');
          const errorDescription = params.get('error_description');
          
          if (errorCode && errorCode.startsWith('4')) {
            console.error('Auth error:', errorDescription);
            router.push(`/auth/login?error=${encodeURIComponent(errorDescription || 'Error de autenticación')}`);
            return true;
          }
        }
        return false;
      };

      // Si hay errores, no continuar
      if (checkForErrors()) {
        return;
      }

      const token = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (token && type === 'recovery') {
        const supabase = createClient();
        
        try {
          // Verificar el token y establecer la sesión
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          });
          
          if (error) {
            console.error('Error verifying token:', error);
            router.push('/auth/login?error=Token inválido o expirado. Por favor solicita un nuevo enlace.');
            return;
          }
          
          // Redirigir a la página de actualización de contraseña
          router.push('/auth/update-password');
        } catch (error) {
          console.error('Error:', error);
          router.push('/auth/login?error=Error al procesar el enlace de restablecimiento.');
        }
      } else {
        // Si no hay token válido, redirigir al login
        router.push('/auth/login?error=Enlace de restablecimiento inválido o expirado.');
      }
    };

    handlePasswordReset();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Procesando enlace de restablecimiento...</p>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}