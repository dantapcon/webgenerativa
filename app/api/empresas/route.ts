import { NextRequest, NextResponse } from 'next/server';
import { CachedWebGeneratorService } from '@/lib/services/cached-webgenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await CachedWebGeneratorService.createEmpresa(body);
    
    return NextResponse.json({
      success: true,
      message: 'Empresa creada exitosamente',
      data: result,
      website_url: `/${result.empresa.slug_empresa}`
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error en API createEmpresa:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const empresas = await CachedWebGeneratorService.getAllEmpresas();
    
    return NextResponse.json({
      success: true,
      data: empresas
    });

  } catch (error: any) {
    console.error('Error en API getEmpresas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}
