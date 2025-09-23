'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

interface UserSession {
  userId: string;
  role: number;
  roleName: string;
  empresaId: number | null;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();

      if (!result.success) {
        router.push('/auth/login');
        return;
      }

      const user = result.user as UserSession;

      // Redirigir según el rol
      if (user.role === 1) {
        // Superadministrador - redirigir a su dashboard principal
        router.push('/admin');
      } else if (user.role === 2) {
        // Administrador - redirigir a su dashboard específico
        if (user.empresaId) {
          router.push(`/dashboard-admin/${user.empresaId}`);
        } else {
          // Si no tiene empresa asignada, mostrar error
          router.push('/auth/login');
        }
      } else {
        // Rol no reconocido, redirigir al login
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando autenticación y redirigiendo...</p>
      </div>
    </div>
  );
}