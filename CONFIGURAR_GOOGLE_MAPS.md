# 🗺️ CONFIGURACIÓN DE GOOGLE MAPS PARA SUCURSALES

## ⚠️ IMPORTANTE: Configuración requerida para mostrar mapas

### **Paso 1: Crear proyecto en Google Cloud Console**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Asegúrate de que el proyecto esté seleccionado en la parte superior

### **Paso 2: Habilitar APIs necesarias**

Busca y habilita estas APIs (ve a "APIs y servicios" > "Biblioteca"):

#### **APIs OBLIGATORIAS:**
- ✅ **Maps JavaScript API** - Para mostrar mapas
- ✅ **Geocoding API** - Para convertir direcciones a coordenadas

#### **APIs OPCIONALES (pero recomendadas):**
- ✅ **Places API** - Para mejorar búsquedas y autocompletado

### **Paso 3: Crear credenciales (API Key)**

1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "Clave de API"
3. **IMPORTANTE:** Restringe la clave por seguridad:
   - Ve a "Restricciones de API"
   - Selecciona "Restringir clave"
   - Elige las APIs que habilitaste arriba

### **Paso 4: Configurar en tu aplicación**

Crea o edita tu archivo `.env.local` en la raíz del proyecto:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDh8v9Qu1rL7xKgKkGdS8sG7R6X5fF9a8E

# Resto de tu configuración...
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_supabase
```

### **Paso 5: Reiniciar la aplicación**

```bash
# Detén el servidor (Ctrl + C)
# Reinicia
npm run dev
```

## 🎯 **¿Qué funcionalidades se habilitarán?**

### **Con API configurada:**
- ✅ **Mapa interactivo** en la página de ubicaciones
- ✅ **Marcadores personalizados** con colores de la empresa
- ✅ **InfoWindows** con información completa de cada sucursal
- ✅ **Geocodificación automática** al agregar direcciones
- ✅ **Centrado automático** del mapa según las ubicaciones

### **Sin API configurada:**
- ❌ Mapa no se mostrará
- ❌ Coordenadas no se generarán automáticamente
- ⚠️ Solo se mostrará la lista de sucursales (sin mapa)

## 🔧 **Solución de problemas**

### **Error: "Mapa no disponible"**
1. Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté en `.env.local`
2. Confirma que reiniciaste la aplicación después de agregar la clave
3. Revisa que las APIs estén habilitadas en Google Cloud Console

### **Error: "This API key is not authorized"**
1. Ve a Google Cloud Console > Credenciales
2. Edita tu API Key
3. En "Restricciones de aplicación", agrega tu dominio:
   - `localhost:3000` para desarrollo
   - `tu-dominio.com` para producción

### **Coordenadas no se generan automáticamente**
1. Verifica que `Geocoding API` esté habilitada
2. Revisa la consola del navegador para errores
3. Confirma que la API Key tenga permisos para Geocoding API

## 💰 **Costos estimados**

Google Maps tiene una cuota gratuita generosa:
- **Maps JavaScript API**: 28,500 cargas de mapa por mes GRATIS
- **Geocoding API**: 40,000 peticiones por mes GRATIS

Para sitios web pequeños/medianos, es probable que no pagues nada.

## 🚀 **Próximos pasos después de configurar**

1. Ve al admin de cualquier empresa
2. Activa "Sucursales/Ubicaciones"
3. Agrega una sucursal con dirección completa
4. Visita la página pública: `tu-empresa/ubicaciones`
5. ¡Deberías ver el mapa funcionando!

## 🆘 **¿Necesitas ayuda?**

Si tienes problemas:
1. Revisa la consola del navegador (F12) para errores
2. Verifica que todas las APIs estén habilitadas
3. Confirma que la API Key esté correctamente configurada
4. Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
