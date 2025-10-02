'use client';

import { useState, useEffect } from 'react';
import { Empresa } from '@/lib/types/webgenerator';
import { WebGeneratorService } from '@/lib/services/webgenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { 
  Building, 
  Globe, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

export default function EstadisticasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargarEmpresas = async () => {
    setIsLoading(true);
    try {
      const data = await WebGeneratorService.getAllEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error('Error cargando empresas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalEmpresas = empresas.length;
  const empresasPublicadas = empresas.filter(e => e.estado_sitio === 'publicado').length;
  const empresasMantenimiento = empresas.filter(e => e.estado_sitio === 'mantenimiento').length;
  const empresasError = empresas.filter(e => e.estado_sitio === 'error').length;
  const empresasCreando = empresas.filter(e => e.estado_sitio === 'creando').length;

  // Agrupar por tipo de negocio
  const tiposNegocio = empresas.reduce((acc, empresa) => {
    const tipo = empresa.tipo_negocio || 'Sin categorizar';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Empresas creadas por mes
  const empresasPorMes = empresas.reduce((acc, empresa) => {
    const fecha = new Date(empresa.fecha_creacion);
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Estadísticas del Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Panel de control y métricas de WebGenerator Pro
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sitios</p>
                  <p className="text-3xl font-bold text-gray-900">{totalEmpresas}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-3xl font-bold text-green-600">{empresasPublicadas}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mantenimiento</p>
                  <p className="text-3xl font-bold text-yellow-600">{empresasMantenimiento}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Activity className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa Éxito</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {totalEmpresas > 0 ? Math.round((empresasPublicadas / totalEmpresas) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Distribución por estado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Estado de los Sitios
              </CardTitle>
              <CardDescription>
                Distribución actual de estados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { estado: 'publicado', count: empresasPublicadas, color: 'bg-green-500', label: 'Publicados' },
                  { estado: 'mantenimiento', count: empresasMantenimiento, color: 'bg-yellow-500', label: 'Mantenimiento' },
                  { estado: 'creando', count: empresasCreando, color: 'bg-blue-500', label: 'Creando' },
                  { estado: 'error', count: empresasError, color: 'bg-red-500', label: 'Error' }
                ].map(({ estado, count, color, label }) => (
                  <div key={estado} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${color}`}></div>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{count}</span>
                      <span className="text-sm text-gray-500">
                        ({totalEmpresas > 0 ? Math.round((count / totalEmpresas) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tipos de negocio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tipos de Negocio
              </CardTitle>
              <CardDescription>
                Distribución por categorías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(tiposNegocio)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 6)
                  .map(([tipo, count]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {tipo}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / totalEmpresas) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actividad reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sitios Creados Recientemente
            </CardTitle>
            <CardDescription>
              Últimos sitios web generados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {empresas
                .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
                .slice(0, 10)
                .map((empresa) => (
                <div key={empresa.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {empresa.logo_url && (
                      <img 
                        src={empresa.logo_url} 
                        alt={`Logo de ${empresa.nombre_empresa}`}
                        className="w-10 h-10 object-contain bg-gray-100 rounded p-1"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">
                        <RichTextDisplay content={empresa.nombre_empresa} />
                      </div>
                      <p className="text-sm text-gray-600">
                        {empresa.tipo_negocio && (
                          <span className="capitalize">{empresa.tipo_negocio} • </span>
                        )}
                        /{empresa.slug_empresa}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      className={
                        empresa.estado_sitio === 'publicado' ? 'bg-green-100 text-green-800' :
                        empresa.estado_sitio === 'mantenimiento' ? 'bg-yellow-100 text-yellow-800' :
                        empresa.estado_sitio === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }
                    >
                      {empresa.estado_sitio}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(empresa.fecha_creacion)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
