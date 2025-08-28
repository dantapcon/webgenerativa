import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Globe, Users, Plus } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            {/* Sistema de Oftalmología */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                  <Eye className="h-8 w-8" />
                  Sistema de Páginas Oftalmológicas
                </CardTitle>
                <CardDescription className="text-lg text-blue-700">
                  Generador completo de páginas web para clínicas oftalmológicas con formulario de administración, personalización de estilos y gestión de contenido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/oftalmologia" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Crear Nueva Clínica
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link href="/admin/clinicas" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Administrar Clínicas
                    </Link>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Características:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Formulario de administrador intuitivo</li>
                      <li>• Personalización completa de colores y estilos</li>
                      <li>• Páginas web responsivas generadas automáticamente</li>
                      <li>• Gestión de información institucional</li>
                      <li>• Base de datos con Supabase</li>
                      <li>• Panel de administración de clínicas</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contenido incluye:
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Información de contacto</li>
                      <li>• Sección "Quiénes Somos"</li>
                      <li>• Misión y Visión</li>
                      <li>• Diseño profesional personalizable</li>
                      <li>• Múltiples temas y fuentes</li>
                      <li>• Vista previa en tiempo real</li>
                    </ul>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-blue-200">
                  <Link href="/oftalmologia">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Clínica
                    </Button>
                  </Link>
                  <Link href="/admin/clinicas">
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      <Users className="h-4 w-4 mr-2" />
                      Administrar Clínicas
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <h2 className="font-medium text-xl mb-4">Next steps</h2>
            {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
