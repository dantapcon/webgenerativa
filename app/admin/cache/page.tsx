'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, Trash2, Zap, AlertTriangle } from 'lucide-react';

interface CacheMetrics {
  performance: {
    hits: number;
    misses: number;
    hitRate: string;
    totalOperations: number;
    sets: number;
    invalidations: number;
  };
  memory: {
    usage: number;
    usageFormatted: string;
    entries: number;
    averageEntrySize: number;
  };
  timestamp: string;
}

export default function CacheMonitorPage() {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/cache?action=metrics');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error obteniendo métricas' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (empresaId?: string) => {
    setLoading(true);
    try {
      const url = empresaId 
        ? `/api/debug/cache?action=clear&empresaId=${empresaId}`
        : '/api/debug/cache?action=clear';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchMetrics(); // Recargar métricas
      } else {
        setMessage({ type: 'error', text: data.error || 'Error limpiando cache' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const precalentarCache = async (slug: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'precalent', slug })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchMetrics(); // Recargar métricas
      } else {
        setMessage({ type: 'error', text: data.error || 'Error precalentando cache' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getPerformanceColor = (hitRate: string) => {
    const rate = parseFloat(hitRate);
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Monitor de Cache</h1>
        <Button 
          onClick={fetchMetrics} 
          disabled={loading}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Mensajes de estado */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Métricas principales */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Hit Rate</h3>
            <p className={`text-2xl font-bold ${getPerformanceColor(metrics.performance.hitRate)}`}>
              {metrics.performance.hitRate}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {metrics.performance.hits} hits / {metrics.performance.totalOperations} total
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Entradas en Cache</h3>
            <p className="text-2xl font-bold text-blue-600">
              {metrics.memory.entries.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tamaño promedio: {(metrics.memory.averageEntrySize / 1024).toFixed(1)} KB
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Uso de Memoria</h3>
            <p className="text-2xl font-bold text-purple-600">
              {metrics.memory.usageFormatted}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {(metrics.memory.usage / (1024 * 1024)).toFixed(1)} MB
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Operaciones</h3>
            <p className="text-2xl font-bold text-orange-600">
              {metrics.performance.sets.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {metrics.performance.invalidations} invalidaciones
            </p>
          </Card>
        </div>
      )}

      {/* Estadísticas detalladas */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Rendimiento</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Hits:</span>
                <span className="font-mono">{metrics.performance.hits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Misses:</span>
                <span className="font-mono">{metrics.performance.misses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Sets:</span>
                <span className="font-mono">{metrics.performance.sets.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invalidaciones:</span>
                <span className="font-mono">{metrics.performance.invalidations.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Información del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Último Update:</span>
                <span className="font-mono text-sm">
                  {new Date(metrics.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Entradas Activas:</span>
                <span className="font-mono">{metrics.memory.entries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Memoria por Entrada:</span>
                <span className="font-mono">
                  {(metrics.memory.averageEntrySize / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Acciones de administración */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          Acciones de Administración
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Limpieza de Cache</h4>
            <Button 
              onClick={() => clearCache()} 
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar Todo el Cache
            </Button>
            <p className="text-xs text-gray-500">
              ⚠️ Esto afectará el rendimiento temporalmente
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Precalentar Cache</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="slug-empresa"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      precalentarCache(target.value.trim());
                      target.value = '';
                    }
                  }
                }}
              />
              <Button 
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                  if (input?.value.trim()) {
                    precalentarCache(input.value.trim());
                    input.value = '';
                  }
                }}
                disabled={loading}
                size="sm"
              >
                <Zap className="w-4 h-4 mr-1" />
                Precalentar
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Precarga datos para mejorar rendimiento inicial
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}