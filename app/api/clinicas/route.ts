// API para crear nuevas clínicas oftalmológicas
import { NextRequest, NextResponse } from 'next/server';
import { OftalmologiaService } from '@/lib/services/oftalmologia';
import { ClinicaFormData } from '@/lib/types/oftalmologia';

export async function POST(request: NextRequest) {
  try {
    const data: ClinicaFormData = await request.json();
    
    // Validar campos requeridos
    if (!data.titulo || !data.quienes_somos || !data.mision || !data.vision) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Los campos titulo, quienes_somos, mision y vision son requeridos' 
        },
        { status: 400 }
      );
    }

    // Crear clínica
    const result = await OftalmologiaService.createClinica(data);
    
    return NextResponse.json({
      success: true,
      message: 'Clínica creada exitosamente',
      clinica_id: result.clinica.id,
      website_url: `/clinicas/${result.clinica.id}`,
      data: result
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/clinicas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyActive = searchParams.get('active') === 'true';
    
    const clinicas = onlyActive 
      ? await OftalmologiaService.getActiveClinicas()
      : await OftalmologiaService.getAllClinicas();
    
    return NextResponse.json({
      success: true,
      data: clinicas
    });

  } catch (error: any) {
    console.error('Error in GET /api/clinicas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Ha ocurrido un error inesperado'
    }, { status: 500 });
  }
}
