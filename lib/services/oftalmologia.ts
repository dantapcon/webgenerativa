// Servicios para las operaciones de base de datos de oftalmología
import { createClient } from '@supabase/supabase-js';
import { 
  ClinicaOftalmologica, 
  EstilosClinica, 
  ClinicaCompleta, 
  ClinicaFormData 
} from '../types/oftalmologia';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class OftalmologiaService {
  // Crear una nueva clínica
  static async createClinica(data: ClinicaFormData): Promise<{ clinica: ClinicaOftalmologica; estilos: EstilosClinica }> {
    try {
      // Separar datos de clínica y estilos
      const clinicaData = {
        titulo: data.titulo,
        lema: data.lema || null,
        logo_url: data.logo_url || null,
        quienes_somos: data.quienes_somos,
        mision: data.mision,
        vision: data.vision,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
        activo: true
      };

      // Insertar clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas_oftalmologicas')
        .insert([clinicaData])
        .select()
        .single();

      if (clinicaError) {
        throw new Error(`Error creating clinic: ${clinicaError.message}`);
      }

      // Datos de estilos
      const estilosData = {
        clinica_id: clinica.id,
        color_primario: data.color_primario || '#2c5aa0',
        color_secundario: data.color_secundario || '#1e3a8a',
        color_acento: data.color_acento || '#3b82f6',
        color_texto: data.color_texto || '#1f2937',
        color_fondo: data.color_fondo || '#ffffff',
        fuente_principal: data.fuente_principal || 'Poppins',
        fuente_titulo: data.fuente_titulo || 'Poppins',
        tamano_fuente: data.tamano_fuente || '16px',
        estilo_botones: data.estilo_botones || 'rounded',
        tema_general: data.tema_general || 'moderno'
      };

      // Insertar estilos
      const { data: estilos, error: estilosError } = await supabase
        .from('estilos_clinicas')
        .insert([estilosData])
        .select()
        .single();

      if (estilosError) {
        // Si falla la inserción de estilos, eliminar la clínica creada
        await supabase
          .from('clinicas_oftalmologicas')
          .delete()
          .eq('id', clinica.id);
        throw new Error(`Error creating styles: ${estilosError.message}`);
      }

      return { clinica, estilos };
    } catch (error) {
      console.error('Error in createClinica:', error);
      throw error;
    }
  }

  // Obtener todas las clínicas
  static async getAllClinicas(): Promise<ClinicaOftalmologica[]> {
    try {
      const { data, error } = await supabase
        .from('clinicas_oftalmologicas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching clinics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllClinicas:', error);
      throw error;
    }
  }

  // Obtener solo clínicas activas
  static async getActiveClinicas(): Promise<ClinicaOftalmologica[]> {
    try {
      const { data, error } = await supabase
        .from('clinicas_oftalmologicas')
        .select('*')
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching active clinics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveClinicas:', error);
      throw error;
    }
  }

  // Obtener una clínica por ID con sus estilos
  static async getClinicaById(id: string): Promise<ClinicaCompleta | null> {
    try {
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas_oftalmologicas')
        .select('*')
        .eq('id', id)
        .single();

      if (clinicaError) {
        if (clinicaError.code === 'PGRST116') {
          return null; // No encontrado
        }
        throw new Error(`Error fetching clinic: ${clinicaError.message}`);
      }

      // Obtener estilos de la clínica
      const { data: estilos, error: estilosError } = await supabase
        .from('estilos_clinicas')
        .select('*')
        .eq('clinica_id', id)
        .single();

      if (estilosError && estilosError.code !== 'PGRST116') {
        console.warn('Error fetching styles, using defaults:', estilosError.message);
      }

      return {
        ...clinica,
        estilos: estilos || undefined
      };
    } catch (error) {
      console.error('Error in getClinicaById:', error);
      throw error;
    }
  }

  // Actualizar una clínica
  static async updateClinica(id: string, data: Partial<ClinicaFormData>): Promise<ClinicaOftalmologica> {
    try {
      // Separar datos de clínica y estilos
      const {
        color_primario,
        color_secundario,
        color_acento,
        color_texto,
        color_fondo,
        fuente_principal,
        fuente_titulo,
        tamano_fuente,
        estilo_botones,
        tema_general,
        ...clinicaData
      } = data;

      // Actualizar clínica
      const { data: clinica, error: clinicaError } = await supabase
        .from('clinicas_oftalmologicas')
        .update(clinicaData)
        .eq('id', id)
        .select()
        .single();

      if (clinicaError) {
        throw new Error(`Error updating clinic: ${clinicaError.message}`);
      }

      // Si hay datos de estilos, actualizarlos
      const estilosData = {
        color_primario,
        color_secundario,
        color_acento,
        color_texto,
        color_fondo,
        fuente_principal,
        fuente_titulo,
        tamano_fuente,
        estilo_botones,
        tema_general
      };

      // Filtrar campos undefined
      const estilosUpdate = Object.fromEntries(
        Object.entries(estilosData).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(estilosUpdate).length > 0) {
        const { error: estilosError } = await supabase
          .from('estilos_clinicas')
          .update(estilosUpdate)
          .eq('clinica_id', id);

        if (estilosError) {
          console.warn('Error updating styles:', estilosError.message);
        }
      }

      return clinica;
    } catch (error) {
      console.error('Error in updateClinica:', error);
      throw error;
    }
  }

  // Cambiar estado activo/inactivo de una clínica
  static async toggleClinicaStatus(id: string): Promise<ClinicaOftalmologica> {
    try {
      // Primero obtener el estado actual
      const { data: currentClinica, error: fetchError } = await supabase
        .from('clinicas_oftalmologicas')
        .select('activo')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching clinic status: ${fetchError.message}`);
      }

      // Cambiar el estado
      const { data: clinica, error: updateError } = await supabase
        .from('clinicas_oftalmologicas')
        .update({ activo: !currentClinica.activo })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Error toggling clinic status: ${updateError.message}`);
      }

      return clinica;
    } catch (error) {
      console.error('Error in toggleClinicaStatus:', error);
      throw error;
    }
  }

  // Eliminar una clínica (eliminación suave - cambiar a inactivo)
  static async deleteClinica(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clinicas_oftalmologicas')
        .update({ activo: false })
        .eq('id', id);

      if (error) {
        throw new Error(`Error deactivating clinic: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteClinica:', error);
      throw error;
    }
  }

  // Obtener estilos por defecto
  static getDefaultStyles(): Partial<EstilosClinica> {
    return {
      color_primario: '#2c5aa0',
      color_secundario: '#1e3a8a',
      color_acento: '#3b82f6',
      color_texto: '#1f2937',
      color_fondo: '#ffffff',
      fuente_principal: 'Poppins',
      fuente_titulo: 'Poppins',
      tamano_fuente: '16px',
      estilo_botones: 'rounded',
      tema_general: 'moderno'
    };
  }
}

export default OftalmologiaService;
