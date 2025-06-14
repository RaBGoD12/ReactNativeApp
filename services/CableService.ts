import supabase from '../lib/supabase';
import { EstadisticasCable, RegistroCable } from '../types/database';
import NotificationService from './NotificationService';

class CableService {
  // Crear un nuevo registro de cable
  async crearRegistro(registro: Omit<RegistroCable, 'id' | 'created_at' | 'user_id'>): Promise<RegistroCable | null> {
    try {
      const { data, error } = await supabase
        .from('registros_cable')
        .insert([registro])
        .select()
        .single();

      if (error) {
        console.error('Error al crear registro:', error);
        return null;
      }

      // Enviar notificación de éxito
      await NotificationService.sendImmediateNotification(
        '✅ Registro guardado',
        `Se registraron ${registro.metraje} ${registro.unidad_medida} de cable`
      );

      return data;
    } catch (error) {
      console.error('Error inesperado:', error);
      return null;
    }
  }

  // Obtener todos los registros del usuario
  async obtenerRegistros(): Promise<RegistroCable[]> {
    try {
      const { data, error } = await supabase
        .from('registros_cable')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener registros:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error inesperado:', error);
      return [];
    }
  }

  // Actualizar un registro existente
  async actualizarRegistro(id: string, registro: Partial<RegistroCable>): Promise<RegistroCable | null> {
    try {
      const { data, error } = await supabase
        .from('registros_cable')
        .update(registro)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error al actualizar registro:', error);
        return null;
      }

      await NotificationService.sendImmediateNotification(
        '✏️ Registro actualizado',
        'Los cambios se han guardado correctamente'
      );

      return data;
    } catch (error) {
      console.error('Error inesperado:', error);
      return null;
    }
  }

  // Eliminar un registro
  async eliminarRegistro(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('registros_cable')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar registro:', error);
        return false;
      }

      await NotificationService.sendImmediateNotification(
        '🗑️ Registro eliminado',
        'El registro se ha eliminado correctamente'
      );

      return true;
    } catch (error) {
      console.error('Error inesperado:', error);
      return false;
    }
  }

  // Obtener estadísticas del usuario
  async obtenerEstadisticas(): Promise<EstadisticasCable> {
    try {
      const hoy = new Date();
      const inicioSemana = new Date(hoy.getTime() - (hoy.getDay() * 24 * 60 * 60 * 1000));
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Obtener todos los registros
      const { data: todos, error: errorTodos } = await supabase
        .from('registros_cable')
        .select('metraje, created_at');

      if (errorTodos) throw errorTodos;

      // Registros de hoy
      const { data: hoyData, error: errorHoy } = await supabase
        .from('registros_cable')
        .select('metraje')
        .gte('created_at', hoy.toISOString().split('T')[0]);

      if (errorHoy) throw errorHoy;

      // Registros de esta semana
      const { data: semanaData, error: errorSemana } = await supabase
        .from('registros_cable')
        .select('metraje')
        .gte('created_at', inicioSemana.toISOString());

      if (errorSemana) throw errorSemana;

      // Registros de este mes
      const { data: mesData, error: errorMes } = await supabase
        .from('registros_cable')
        .select('metraje')
        .gte('created_at', inicioMes.toISOString());

      if (errorMes) throw errorMes;

      const totalMetraje = todos?.reduce((sum, r) => sum + Number(r.metraje), 0) || 0;
      const totalSemanaMetraje = semanaData?.reduce((sum, r) => sum + Number(r.metraje), 0) || 0;
      const totalMesMetraje = mesData?.reduce((sum, r) => sum + Number(r.metraje), 0) || 0;
      return {
        totalMetraje,
        registrosHoy: hoyData?.length || 0,
        registrosSemana: semanaData?.length || 0,
        registrosMes: mesData?.length || 0,
        totalSemanaMetraje,
        totalMesMetraje,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalMetraje: 0,
        registrosHoy: 0,
        registrosSemana: 0,
        registrosMes: 0,
        totalSemanaMetraje: 0,
        totalMesMetraje: 0,
      };
    }
  }

  // Obtener registros por rango de fechas
  async obtenerRegistrosPorFecha(fechaInicio: string, fechaFin: string): Promise<RegistroCable[]> {
    try {
      const { data, error } = await supabase
        .from('registros_cable')
        .select('*')
        .gte('created_at', fechaInicio)
        .lte('created_at', fechaFin)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener registros por fecha:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error inesperado:', error);
      return [];
    }
  }

  // Establecer cantidad inicial de cable en Supabase
  async setCantidadInicial(cantidad: number): Promise<boolean> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user) return false;
    const { error } = await supabase
      .from('inventario')
      .upsert({ user_id: user.id, cantidad_inicial: cantidad, cantidad_actual: cantidad });
    return !error;
  }

  // Obtener inventario (cantidad inicial y actual) desde Supabase
  async obtenerInventario(): Promise<{ cantidad_inicial: number; cantidad_actual: number } | null> {
    const { data, error } = await supabase
      .from('inventario')
      .select('cantidad_inicial, cantidad_actual')
      .single();
    if (error) {
      console.error('Error al obtener inventario:', error);
      return null;
    }
    return data;
  }
}

export default new CableService();
