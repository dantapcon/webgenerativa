# Instrucciones para añadir las nuevas columnas a la base de datos

## IMPORTANTE: Debes ejecutar esta migración antes de usar las nuevas características

Hemos creado un script de migración SQL que necesitas ejecutar para añadir las columnas necesarias para las nuevas funcionalidades. Sigue estos pasos:

### Opción 1: Ejecutar la migración desde la interfaz de Supabase

1. Inicia sesión en tu panel de Supabase
2. Ve a la sección "SQL Editor"
3. Crea un nuevo query
4. Copia y pega **todo** el contenido del archivo `migraciones/001_add_background_options.sql`
5. Ejecuta el script haciendo clic en "Run" o presionando Ctrl+Enter

### Opción 2: Ejecutar la migración desde la terminal (si tienes acceso directo a la base de datos)

```bash
psql -U tu_usuario -d tu_base_de_datos -f migraciones/001_add_background_options.sql
```

## Verificación

Para verificar que la migración se ejecutó correctamente, puedes ejecutar esta consulta en Supabase SQL Editor:

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'empresas' AND column_name IN ('descripcion_fondo_tipo', 'descripcion_imagen_fondo', 'video_descripcion');
```

Deberías ver las tres columnas listadas en el resultado.

## Columnas que se añadirán

El script añade las siguientes columnas:

- `descripcion_fondo_tipo`: Para elegir entre color sólido o imagen de fondo para la sección de descripción
- `descripcion_imagen_fondo`: Para guardar la URL de la imagen de fondo de la sección de descripción
- `video_descripcion`: Para añadir una descripción específica al video
- `tipo_display`: En la tabla de categorías para elegir entre layout horizontal o vertical

## Resolución de problemas

Si sigues viendo errores después de ejecutar la migración:

1. Asegúrate de que el script se ejecutó sin errores
2. Intenta reiniciar el servidor de desarrollo (detén y vuelve a iniciar `npm run dev`)
3. Si usas el cliente de Supabase en el navegador, puede que necesites refrescar la caché del esquema
