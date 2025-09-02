'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            WebGenerator Pro
          </h1>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Generador completo de páginas web para cualquier tipo de negocio con formulario intuitivo, 
            personalización visual avanzada y gestión de contenido dinámico.
          </p>
        </div>

        {/* Botones principales */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
            <Link href="/generador" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Sitio Web
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4">
            <Link href="/admin/empresas" className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Administrar Sitios
            </Link>
          </Button>
        </div>

        {/* Información del sistema */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-blue-800 flex items-center justify-center gap-3">
                <Globe className="h-8 w-8" />
                Características del Sistema
              </CardTitle>
              <CardDescription className="text-blue-700">
                Todo lo que necesitas para crear sitios web profesionales para cualquier tipo de negocio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Características Principales:
                  </h4>
                  <ul className="text-blue-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Formulario intuitivo paso a paso
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Personalización visual completa
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Páginas web responsivas automáticas
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Gestión de categorías y subcategorías
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Multi-tenant con base de datos Supabase
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      Panel de administración completo
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Contenido Incluido:
                  </h4>
                  <ul className="text-blue-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Información de contacto completa
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Sección "Quiénes Somos"
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Misión y Visión de la clínica
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Diseño profesional personalizable
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Múltiples temas y fuentes
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      Vista previa en tiempo real
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
