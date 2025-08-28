# Script de configuración completa para el Sistema de Oftalmología
# Ejecutar con: PowerShell -ExecutionPolicy Bypass -File setup_oftalmologia.ps1

Write-Host "🏥 CONFIGURACIÓN DEL SISTEMA DE OFTALMOLOGÍA" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estemos en el directorio correcto
$currentDir = Get-Location
Write-Host "📁 Directorio actual: $currentDir" -ForegroundColor Yellow

if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encuentra package.json en el directorio actual" -ForegroundColor Red
    Write-Host "   Asegúrate de estar en el directorio raíz del proyecto Next.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Proyecto Next.js detectado" -ForegroundColor Green
Write-Host ""

# Paso 1: Instalar dependencias
Write-Host "📦 PASO 1: Instalando dependencias..." -ForegroundColor Yellow
try {
    npm install @supabase/supabase-js date-fns lucide-react
    Write-Host "✅ Dependencias instaladas exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error instalando dependencias: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Verificar configuración de Supabase
Write-Host "🔧 PASO 2: Verificando configuración de Supabase..." -ForegroundColor Yellow

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "   Crea el archivo .env.local con tu configuración de Supabase" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL" -and $envContent -match "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY") {
    Write-Host "✅ Variables de entorno de Supabase encontradas" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Variables de Supabase no encontradas en .env.local" -ForegroundColor Red
    Write-Host "   Asegúrate de tener:" -ForegroundColor Red
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Red
    Write-Host "   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 3: Mostrar información del esquema SQL
Write-Host "🗄️  PASO 3: Configuración de Base de Datos" -ForegroundColor Yellow
Write-Host "El archivo 'supabase_schema.sql' contiene el esquema completo de la base de datos." -ForegroundColor White
Write-Host "Necesitas ejecutar este SQL en tu panel de Supabase:" -ForegroundColor White
Write-Host ""
Write-Host "1. Ve a tu proyecto en https://supabase.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Ve a la sección 'SQL Editor'" -ForegroundColor Cyan
Write-Host "3. Ejecuta el contenido del archivo 'supabase_schema.sql'" -ForegroundColor Cyan
Write-Host "4. Verifica que las tablas se crearon correctamente" -ForegroundColor Cyan
Write-Host ""

if (Test-Path "supabase_schema.sql") {
    Write-Host "✅ Archivo supabase_schema.sql encontrado" -ForegroundColor Green
    Write-Host "   Ubicación: $(Resolve-Path 'supabase_schema.sql')" -ForegroundColor Gray
} else {
    Write-Host "❌ Error: Archivo supabase_schema.sql no encontrado" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 4: Verificar estructura de archivos
Write-Host "📁 PASO 4: Verificando estructura de archivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "app/oftalmologia/page.tsx",
    "app/admin/clinicas/page.tsx", 
    "app/clinicas/[id]/page.tsx",
    "app/api/clinicas/route.ts",
    "app/api/clinicas/[id]/route.ts",
    "lib/types/oftalmologia.ts",
    "lib/services/oftalmologia.ts",
    "test_oftalmologia_api.js",
    "README_OFTALMOLOGIA.md"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Faltan archivos importantes del sistema. Verifica la instalación." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 5: Mostrar próximos pasos
Write-Host "🚀 CONFIGURACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🗄️  CONFIGURAR BASE DE DATOS:" -ForegroundColor Yellow
Write-Host "   - Ve a https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Abre el SQL Editor" -ForegroundColor White  
Write-Host "   - Ejecuta el contenido de 'supabase_schema.sql'" -ForegroundColor White
Write-Host ""

Write-Host "2. 🖥️  INICIAR EL SERVIDOR:" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. 🌐 ACCEDER A LAS PÁGINAS:" -ForegroundColor Yellow
Write-Host "   • Formulario principal:    http://localhost:3000/oftalmologia" -ForegroundColor Cyan
Write-Host "   • Panel de administración: http://localhost:3000/admin/clinicas" -ForegroundColor Cyan
Write-Host "   • Página principal:        http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. 🧪 PROBAR LA API:" -ForegroundColor Yellow
Write-Host "   node test_oftalmologia_api.js" -ForegroundColor Cyan
Write-Host ""

Write-Host "📖 DOCUMENTACIÓN:" -ForegroundColor Magenta
Write-Host "   Lee el archivo 'README_OFTALMOLOGIA.md' para información detallada" -ForegroundColor White
Write-Host ""

Write-Host "✨ El sistema está listo para usar. ¡Disfruta creando páginas oftalmológicas!" -ForegroundColor Green
