import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Obtener colores de un elemento específico
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const referencia_id = url.searchParams.get('referencia_id');
    const tipo_elemento = url.searchParams.get('tipo_elemento');

    if (!referencia_id || !tipo_elemento) {
      return NextResponse.json({
        success: false,
        error: 'referencia_id y tipo_elemento son requeridos'
      }, { status: 400 });
    }

    const { data: colores, error } = await supabase
      .from('colorimetria')
      .select('*')
      .eq('referencia_id', referencia_id)
      .eq('tipo_elemento', tipo_elemento)
      .eq('activo', true)
      .order('subtipo');

    if (error) {
      console.error('Error obteniendo colores:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener colores'
      }, { status: 500 });
    }

    // Organizar colores por subtipo
    const coloresOrganizados = {
      primario: colores?.find(c => c.subtipo === 'primario') || null,
      secundario: colores?.find(c => c.subtipo === 'secundario') || null,
      terciario: colores?.find(c => c.subtipo === 'terciario') || null,
      fondo: colores?.find(c => c.subtipo === 'fondo') || null,
    };

    return NextResponse.json({
      success: true,
      data: coloresOrganizados
    });

  } catch (error: any) {
    console.error('Error en API colorimetria GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST - Crear o actualizar un color
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referencia_id, tipo_elemento, subtipo, color, brillo = 100, opacidad = 100 } = body;

    // Validaciones
    if (!referencia_id || !tipo_elemento || !subtipo || !color) {
      return NextResponse.json({
        success: false,
        error: 'Todos los campos son requeridos: referencia_id, tipo_elemento, subtipo, color'
      }, { status: 400 });
    }

    // Validar formato de color hexadecimal
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json({
        success: false,
        error: 'El color debe estar en formato hexadecimal (#RRGGBB)'
      }, { status: 400 });
    }

    // Validar rangos
    if (brillo < 0 || brillo > 200 || opacidad < 0 || opacidad > 100) {
      return NextResponse.json({
        success: false,
        error: 'Brillo debe estar entre 0-200 y opacidad entre 0-100'
      }, { status: 400 });
    }

    // Verificar si ya existe un color para este elemento y subtipo
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
      return NextResponse.json({
        success: false,
        error: 'Error al guardar color'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: existingColor ? 'Color actualizado exitosamente' : 'Color creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error en API colorimetria POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// DELETE - Eliminar un color
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID del color es requerido'
      }, { status: 400 });
    }

    // Marcar como inactivo en lugar de eliminar
    const { data, error } = await supabase
      .from('colorimetria')
      .update({ 
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error eliminando color:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al eliminar color'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Color eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error en API colorimetria DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}