import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Sucursal } from '@/lib/types/webgenerator';

export interface SucursalFormData {
  nombre: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  telefono?: string;
  whatsapp?: string;
  email?: string;
  horario_lunes?: string;
  horario_martes?: string;
  horario_miercoles?: string;
  horario_jueves?: string;
  horario_viernes?: string;
  horario_sabado?: string;
  horario_domingo?: string;
  activo: boolean;
}

export function useSucursales(empresaId: number) {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Cargar sucursales
  const fetchSucursales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sucursales')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;
      setSucursales(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar sucursales');
    } finally {
      setLoading(false);
    }
  };

  // Agregar sucursal
  const addSucursal = async (formData: SucursalFormData) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('sucursales')
        .insert([{
          empresa_id: empresaId,
          ...formData,
          orden: sucursales.length + 1
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSucursales(prev => [...prev, data]);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al agregar sucursal';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Actualizar sucursal
  const updateSucursal = async (id: number, formData: Partial<SucursalFormData>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('sucursales')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSucursales(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar sucursal';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Eliminar sucursal
  const deleteSucursal = async (id: number) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('sucursales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSucursales(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar sucursal';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Reordenar sucursales
  const reorderSucursales = async (reorderedSucursales: Sucursal[]) => {
    try {
      setError(null);
      
      const updates = reorderedSucursales.map((sucursal, index) => ({
        id: sucursal.id,
        orden: index + 1
      }));

      for (const update of updates) {
        await supabase
          .from('sucursales')
          .update({ orden: update.orden })
          .eq('id', update.id);
      }
      
      setSucursales(reorderedSucursales);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al reordenar sucursales';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    if (empresaId) {
      fetchSucursales();
    }
  }, [empresaId]);

  return {
    sucursales,
    loading,
    error,
    addSucursal,
    updateSucursal,
    deleteSucursal,
    reorderSucursales,
    refetch: fetchSucursales
  };
}

// Función auxiliar para geocoding
async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  try {
    // Usar la API de Google Geocoding
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key no configurada');
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
}
