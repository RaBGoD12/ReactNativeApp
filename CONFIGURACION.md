# 📋 Instrucciones de Configuración - AppCables

## 🗄️ Configuración de Supabase

### 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. Crear la base de datos
Ejecuta el siguiente SQL en el editor SQL de Supabase:

```sql
-- Crear tabla de registros de cable
CREATE TABLE public.registros_cable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID DEFAULT auth.uid() NOT NULL,
  metraje NUMERIC NOT NULL,
  unidad_medida TEXT DEFAULT 'metros' NOT NULL,
  notas TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Habilitar Row Level Security
ALTER TABLE public.registros_cable ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propios registros"
ON public.registros_cable
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear nuevos registros"
ON public.registros_cable
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios registros"
ON public.registros_cable
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden borrar sus propios registros"
ON public.registros_cable
FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configurar variables de entorno
1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. En Supabase, ve a **Settings > API**

3. Copia las credenciales al archivo `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
   ```

## 🚀 Iniciar la aplicación

1. Instala dependencias:
   ```bash
   npm install
   ```

2. Configura el entorno Android:
   ```bash
   .\setup-android-env.ps1
   ```

3. Inicia el emulador Android

4. Ejecuta la aplicación:
   ```bash
   npm run android
   ```

## 📱 Funcionalidades

### ✅ Implementadas:
- ✅ CRUD completo de registros de cable
- ✅ Estadísticas en tiempo real
- ✅ Notificaciones push configurables
- ✅ Interfaz moderna y responsive
- ✅ Conexión con Supabase
- ✅ Autenticación de usuarios
- ✅ Filtros por fecha
- ✅ Reportes semanales

### 🎯 Características principales:
- **Registrar cables**: Añade nuevos registros con metraje, unidad y notas
- **Editar/Eliminar**: Modifica o elimina registros existentes
- **Estadísticas**: Ve resúmenes diarios, semanales y mensuales
- **Notificaciones**: Recordatorios automáticos para no olvidar registrar
- **Historial**: Consulta todos tus registros anteriores
- **Reportes**: Recibe reportes semanales de tu actividad

## 🔧 Solución de problemas

### Si no funcionan las notificaciones:
1. Ve a la pestaña "Estadísticas"
2. Presiona "Configurar Recordatorios"
3. Acepta los permisos cuando se soliciten

### Si no se conecta a Supabase:
1. Verifica que las variables en `.env` sean correctas
2. Asegúrate de que la tabla esté creada
3. Verifica que RLS esté habilitado

### Si hay errores de compilación:
```bash
npm run android:clean
npm install
npm run android
```

## 📞 Soporte

Si tienes problemas, verifica:
1. Que las variables de entorno estén configuradas
2. Que Supabase esté configurado correctamente
3. Que el emulador Android esté ejecutándose
4. Que las dependencias estén instaladas

¡Disfruta usando AppCables! 📏✨
