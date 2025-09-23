'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Building } from 'lucide-react';
import Link from 'next/link';

interface UserSession {
  userId: string;
  role: number;
  roleName: string;
  empresaId: number | null;
  email: string;
}

export function GeneratorHeader() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      const result = await response.json();

      if (result.success) {
        const user = result.user as UserSession;
        setUserSession(user);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBackLink = () => {
    if (!userSession) return '/';
    
    switch (userSession.role) {
      case 1: // Superadministrador
        return '/admin';
      case 2: // Administrador de empresa
        return userSession.empresaId ? `/dashboard-admin/${userSession.empresaId}` : '/auth/login';
      default:
        return '/';
    }
  };

  const getBackText = () => {
    if (!userSession) return 'Volver al inicio';
    
    switch (userSession.role) {
      case 1: // Superadministrador
        return 'Volver al Dashboard';
      case 2: // Administrador de empresa
        return 'Volver al Panel';
      default:
        return 'Volver al inicio';
    }
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Crear Nueva Empresa
                </h1>
                <p className="text-sm text-gray-600">WebGenerator Pro</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Link href={getBackLink()}>
                <ArrowLeft className="h-4 w-4" />
                {getBackText()}
              </Link>
            </Button>
            
            <div className="border-l pl-3">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Crear Nueva Empresa
                  </h1>
                  <p className="text-xs text-gray-600">WebGenerator Pro</p>
                </div>
              </div>
            </div>
          </div>

          {userSession && (
            <div className="flex items-center gap-4">
              {userSession.role === 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-600">Superadministrador</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {userSession.email}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}