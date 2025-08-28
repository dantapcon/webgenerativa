// API para operaciones específicas de una clínica por ID
import { NextRequest, NextResponse } from 'next/server';
import { OftalmologiaService } from '@/lib/services/oftalmologia';
import { ClinicaFormData } from '@/lib/types/oftalmologia';

// Obtener clínica por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clinica = await OftalmologiaService.getClinicaById(id);
    
    if (!clinica) {
      return NextResponse.json({
        success: false,
        error: 'Clínica no encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: clinica
    });

  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in GET /api/clinicas/${id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Actualizar clínica
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data: Partial<ClinicaFormData> = await request.json();
    
    const clinica = await OftalmologiaService.updateClinica(id, data);
    
    return NextResponse.json({
      success: true,
      message: 'Clínica actualizada exitosamente',
      data: clinica
    });

  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in PUT /api/clinicas/${id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Cambiar estado activo/inactivo
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clinica = await OftalmologiaService.toggleClinicaStatus(id);
    
    return NextResponse.json({
      success: true,
      message: `Clínica ${clinica.activo ? 'activada' : 'desactivada'} exitosamente`,
      data: clinica
    });

  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in PATCH /api/clinicas/${id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

// Eliminar clínica (desactivar)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await OftalmologiaService.deleteClinica(id);
    
    return NextResponse.json({
      success: true,
      message: 'Clínica eliminada exitosamente'
    });

  } catch (error: any) {
    const { id } = await params;
    console.error(`Error in DELETE /api/clinicas/${id}:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}
