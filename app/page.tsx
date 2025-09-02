"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir siempre al login al iniciar la aplicación
    router.replace("/auth/login");
  }, [router]);

  // Mostrar loading mientras se verifica la autenticación
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-blue-700 text-lg">Cargando...</p>
      </div>
    </main>
  );
}