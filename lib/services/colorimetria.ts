// Servicio para gestión de colorimetría
import { createClient } from '@supabase/supabase-js';
import { Colorimetria, ColoresElemento } from '../types/webgenerator';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class ColorimetriaService {
  
  // Obtener colores de un elemento
  static async getColoresElemento(
    referencia_id: number,
    tipo_elemento: 'empresa' | 'categoria' | 'subcategoria' | 'ventana_flotante'
  ): Promise<ColoresElemento> {
    try {
      const { data: colores, error } = await supabase
        .from('colorimetria')
        .select('*')
        .eq('referencia_id', referencia_id)
        .eq('tipo_elemento', tipo_elemento)
        .eq('activo', true)
        .order('subtipo');

      if (error) {
        console.error('Error obteniendo colores:', error);
        return {};
      }

      // Organizar colores por subtipo
      const resultado: ColoresElemento = {};
      
      colores?.forEach(color => {
        switch (color.subtipo) {
          case 'primario':
            resultado.primario = color;
            break;
          case 'secundario':
            resultado.secundario = color;
            break;
          case 'terciario':
            resultado.terciario = color;
            break;
          case 'fondo':
            resultado.fondo = color;
            break;
        }
      });

      return resultado;
    } catch (error) {
      console.error('Error en getColoresElemento:', error);
      return {};
    }
  }

  // Guardar o actualizar un color
  static async guardarColor(
    referencia_id: number,
    tipo_elemento: 'empresa' | 'categoria' | 'subcategoria' | 'ventana_flotante',
    subtipo: 'primario' | 'secundario' | 'terciario' | 'fondo',
    color: string,
    brillo: number = 100,
    opacidad: number = 100
  ): Promise<Colorimetria | null> {
    try {
      // Verificar si ya existe
      const { data: existingColor } = await supabase
        .from('colorimetria')
        .select('id')
        .eq('referencia_id', referencia_id)
        .eq('tipo_elemento', tipo_elemento)
        .eq('subtipo', subtipo)
        .single();

      let result;

      if (existingColor) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('colorimetria')
          .update({
            color,
            brillo,
            opacidad,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingColor.id)
          .select()
          .single();

        result = { data, error };
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('colorimetria')
          .insert({
            referencia_id,
            tipo_elemento,
            subtipo,
            color,
            brillo,
            opacidad,
            activo: true
          })
          .select()
          .single();

        result = { data, error };
      }

      if (result.error) {
        console.error('Error guardando color:', result.error);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Error en guardarColor:', error);
      return null;
    }
  }

  // Crear colores por defecto para una empresa (regla 60-30-10)
  static async crearColoresEmpresaPorDefecto(
    empresa_id: number,
    color_primario: string = '#3b82f6', // Azul
    color_secundario: string = '#64748b', // Gris
    color_terciario: string = '#f97316' // Naranja (acento)
  ): Promise<boolean> {
    try {
      const colores = [
        {
          referencia_id: empresa_id,
          tipo_elemento: 'empresa' as const,
          subtipo: 'primario' as const,
          color: color_primario,
          brillo: 100,
          opacidad: 100,
          activo: true
        },
        {
          referencia_id: empresa_id,
          tipo_elemento: 'empresa' as const,
          subtipo: 'secundario' as const,
          color: color_secundario,
          brillo: 100,
          opacidad: 100,
          activo: true
        },
        {
          referencia_id: empresa_id,
          tipo_elemento: 'empresa' as const,
          subtipo: 'terciario' as const,
          color: color_terciario,
          brillo: 100,
          opacidad: 100,
          activo: true
        }
      ];

      const { error } = await supabase
        .from('colorimetria')
        .insert(colores);

      if (error) {
        console.error('Error creando colores por defecto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en crearColoresEmpresaPorDefecto:', error);
      return false;
    }
  }

  // Crear color de fondo por defecto para categoría
  static async crearColorCategoriaPorDefecto(
    categoria_id: number,
    color_fondo: string = '#ffffff'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('colorimetria')
        .insert({
          referencia_id: categoria_id,
          tipo_elemento: 'categoria',
          subtipo: 'fondo',
          color: color_fondo,
          brillo: 100,
          opacidad: 100,
          activo: true
        });

      if (error) {
        console.error('Error creando color de categoría por defecto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en crearColorCategoriaPorDefecto:', error);
      return false;
    }
  }

  // Crear color de fondo por defecto para subcategoría
  static async crearColorSubcategoriaPorDefecto(
    subcategoria_id: number,
    color_fondo: string = '#ffffff'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('colorimetria')
        .insert({
          referencia_id: subcategoria_id,
          tipo_elemento: 'subcategoria',
          subtipo: 'fondo',
          color: color_fondo,
          brillo: 100,
          opacidad: 100,
          activo: true
        });

      if (error) {
        console.error('Error creando color de subcategoría por defecto:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en crearColorSubcategoriaPorDefecto:', error);
      return false;
    }
  }

  // Función helper para calcular color con brillo y opacidad
  static calcularColorFinal(color: string, brillo: number = 100, opacidad: number = 100): string {
    // Convertir hex a RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Aplicar brillo (100% = normal, 200% = muy brillante, 0% = negro)
    const brilloFactor = brillo / 100;
    let newR = Math.round(r * brilloFactor);
    let newG = Math.round(g * brilloFactor);
    let newB = Math.round(b * brilloFactor);

    // Limitar valores a 0-255
    newR = Math.min(255, Math.max(0, newR));
    newG = Math.min(255, Math.max(0, newG));
    newB = Math.min(255, Math.max(0, newB));

    // Aplicar opacidad
    const alpha = opacidad / 100;

    return `rgba(${newR}, ${newG}, ${newB}, ${alpha})`;
  }

  // Obtener color en formato CSS
  static getColorCSS(colorimetria?: Colorimetria): string {
    if (!colorimetria) return 'transparent';
    
    return this.calcularColorFinal(
      colorimetria.color,
      colorimetria.brillo,
      colorimetria.opacidad
    );
  }
}