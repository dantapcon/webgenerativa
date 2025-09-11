'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, User, LogOut } from 'lucide-react';
import { AdminEmpresaCompleto, LoginData, AuthResponse } from '@/lib/types/webgenerator';

interface LoginEmpresaProps {
  empresaId: number;
  empresaNombre: string;
}

export default function LoginEmpresa({ empresaId, empresaNombre }: LoginEmpresaProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [loginEnabled, setLoginEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<AdminEmpresaCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Verificar si el login está habilitado al cargar
  useEffect(() => {
    checkLoginStatus();
  }, [empresaId]);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`/api/admin/auth?empresa_id=${empresaId}`);
      const data = await response.json();
      
      if (data.success) {
        setLoginEnabled(data.login_enabled);
      }
    } catch (error) {
      console.error('Error verificando estado de login:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData: LoginData = {
        email: email.trim(),
        password,
        empresa_id: empresaId
      };

      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result: AuthResponse = await response.json();

      if (result.success && result.admin) {
        setIsAuthenticated(true);
        setAdmin(result.admin);
        setShowLogin(false);
        
        // Guardar token en sessionStorage (en producción usar httpOnly cookies)
        sessionStorage.setItem('admin_token', result.token || '');
        sessionStorage.setItem('admin_empresa_id', empresaId.toString());
        
        // Recargar la página para mostrar la interfaz de administración
        window.location.reload();
      } else {
        setError(result.error || 'Error de autenticación');
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.');
      console.error('Error en login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdmin(null);
    setEmail('');
    setPassword('');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_empresa_id');
    window.location.reload();
  };

  // Si no está habilitado el login, no mostrar nada
  if (!loginEnabled) {
    return null;
  }

  // Si está autenticado, mostrar panel de admin
  if (isAuthenticated && admin) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-64 bg-white shadow-lg border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              Panel de Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-xs text-gray-600">
                Bienvenido, <strong>{admin.nombre}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Administrando: {empresaNombre}
              </p>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm" 
                className="w-full"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Botón para mostrar login */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowLogin(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <Lock className="h-4 w-4 mr-2" />
          Iniciar Sesión
        </Button>
      </div>

      {/* Modal de login */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Lock className="h-5 w-5" />
                Acceso Administrativo
              </CardTitle>
              <p className="text-sm text-gray-600 text-center">
                {empresaNombre}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="flex-1"
                  >
                    {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
