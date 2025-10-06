import { NextRequest, NextResponse } from 'next/server';
import { CachedWebGeneratorService } from '@/lib/services/cached-webgenerator';
import { CacheService } from '@/lib/services/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json({
        success: false,
        error: 'ID inválido'
      }, { status: 400 });
    }

    const empresa = await CachedWebGeneratorService.getEmpresaById(numericId);
    
    if (!empresa) {
      return NextResponse.json({
        success: false,
        error: 'Empresa no encontrada'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: empresa
    });

  } catch (error: any) {
    console.error('Error en API getEmpresaById:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json({
        success: false,
        error: 'ID inválido'
      }, { status: 400 });
    }

    const body = await request.json();
    
    const empresa = await CachedWebGeneratorService.updateEmpresa(numericId, body);
    
    return NextResponse.json({
      success: true,
      message: 'Empresa actualizada exitosamente',
      data: empresa
    });

  } catch (error: any) {
    console.error('Error en API updateEmpresa:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id);
    
    if (isNaN(numericId)) {
      return NextResponse.json({
        success: false,
        error: 'ID inválido'
      }, { status: 400 });
    }

    await CachedWebGeneratorService.deleteEmpresa(numericId);
    
    return NextResponse.json({
      success: true,
      message: 'Empresa eliminada exitosamente'
    });

  } catch (error: any) {
    console.error('Error en API deleteEmpresa:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}
