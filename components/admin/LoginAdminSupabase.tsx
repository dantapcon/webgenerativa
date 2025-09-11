'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginAdminProps {
  empresaId: number;
  onLoginSuccess?: (user: any) => void;
}

export default function LoginAdmin({ empresaId, onLoginSuccess }: LoginAdminProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Verificar permisos para esta empresa
      const { data: permisos, error: permisosError } = await supabase
        .from('admin_permisos')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('empresa_id', empresaId)
        .single();

      if (permisosError || !permisos) {
        setError('No tienes permisos para administrar esta empresa');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Login exitoso
      sessionStorage.setItem('admin_session', JSON.stringify({
        user: authData.user,
        permisos,
        empresa_id: empresaId
      }));

      setShowLogin(false);
      onLoginSuccess?.(authData.user);

    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_session');
    setShowLogin(false);
  };

  // Verificar si ya está logueado
  const adminSession = typeof window !== 'undefined' ? 
    sessionStorage.getItem('admin_session') : null;

  if (adminSession) {
    const session = JSON.parse(adminSession);
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Admin activo</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                Salir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showLogin) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setShowLogin(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          🔐 Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Acceso Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowLogin(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
