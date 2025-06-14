import AsyncStorage from '@react-native-async-storage/async-storage';
import { EstadisticasCable, RegistroCable } from '../types/database';
import NotificationService from './NotificationService';

class LocalCableService {
  private storageKey = 'appcables_registros';
  private inventarioKey = 'appcables_inventario';
  private proyectosKey = 'appcables_proyectos_historial';

  // Crear un nuevo registro de cable (almacenado localmente)
  async crearRegistro(registro: Omit<RegistroCable, 'id' | 'created_at' | 'user_id'>): Promise<RegistroCable | null> {
    try {
      const id = Date.now().toString();
      const nuevoRegistro: RegistroCable = {
        id,
        created_at: new Date().toISOString(),
        user_id: 'local-user',
        ...registro,
      };

      const registrosExistentes = await this.obtenerRegistros();
      const registrosActualizados = [nuevoRegistro, ...registrosExistentes];
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(registrosActualizados));

      // Actualizar inventario restante
      const inv = await this.obtenerInventario();
      const nuevaCantidadActual = Math.max(0, inv.cantidad_actual - registro.metraje);
      await AsyncStorage.setItem(
        this.inventarioKey,
        JSON.stringify({ cantidad_inicial: inv.cantidad_inicial, cantidad_actual: nuevaCantidadActual })
      );

      // Enviar notificación de éxito
      await NotificationService.sendImmediateNotification(
        '✅ Registro guardado',
        `Se registraron ${registro.metraje} ${registro.unidad_medida} de cable`
      );

      return nuevoRegistro;
    } catch (error) {
      console.error('Error al crear registro:', error);
      return null;
    }
  }

  // Obtener todos los registros del usuario
  async obtenerRegistros(): Promise<RegistroCable[]> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const registros = JSON.parse(data) as RegistroCable[];
      // Ordenar por fecha (más recientes primero)
      return registros.sort((a, b) => 
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    } catch (error) {
      console.error('Error al obtener registros:', error);
      return [];
    }
  }

  // Actualizar un registro existente
  async actualizarRegistro(id: string, registro: Partial<RegistroCable>): Promise<RegistroCable | null> {
    try {
      const registros = await this.obtenerRegistros();
      const indice = registros.findIndex(r => r.id === id);
      
      if (indice === -1) {
        console.error('Registro no encontrado');
        return null;
      }

      registros[indice] = { ...registros[indice], ...registro };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(registros));

      await NotificationService.sendImmediateNotification(
        '✏️ Registro actualizado',
        'Los cambios se han guardado correctamente'
      );

      return registros[indice];
    } catch (error) {
      console.error('Error al actualizar registro:', error);
      return null;
    }
  }
  // Eliminar un registro
  async eliminarRegistro(id: string): Promise<boolean> {
    try {
      const registros = await this.obtenerRegistros();
      const registroAEliminar = registros.find(r => r.id === id);
      
      if (!registroAEliminar) {
        console.error('Registro no encontrado');
        return false;
      }
      
      // Restaurar la cantidad al inventario
      const inv = await this.obtenerInventario();
      const nuevaCantidadActual = inv.cantidad_actual + registroAEliminar.metraje;
      await AsyncStorage.setItem(
        this.inventarioKey,
        JSON.stringify({ cantidad_inicial: inv.cantidad_inicial, cantidad_actual: nuevaCantidadActual })
      );
      
      const registrosFiltrados = registros.filter(r => r.id !== id);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(registrosFiltrados));

      await NotificationService.sendImmediateNotification(
        '🗑️ Registro eliminado',
        `Se restauraron ${registroAEliminar.metraje} metros al inventario`
      );

      return true;
    } catch (error) {
      console.error('Error al eliminar registro:', error);
      return false;
    }
  }

  // Obtener estadísticas del usuario
  async obtenerEstadisticas(): Promise<EstadisticasCable> {
    try {
      const registros = await this.obtenerRegistros();
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Filtrar registros
      const registrosHoy = registros.filter(r => {
        const fechaRegistro = new Date(r.created_at!);
        fechaRegistro.setHours(0, 0, 0, 0);
        return fechaRegistro.getTime() === hoy.getTime();
      });

      const registrosSemana = registros.filter(r => {
        const fechaRegistro = new Date(r.created_at!);
        return fechaRegistro >= inicioSemana;
      });

      const registrosMes = registros.filter(r => {
        const fechaRegistro = new Date(r.created_at!);
        return fechaRegistro >= inicioMes;
      });

      // Calcular métricas
      const totalMetraje = registros.reduce((sum, r) => sum + Number(r.metraje), 0);
      const totalSemanaMetraje = registrosSemana.reduce((sum, r) => sum + Number(r.metraje), 0);
      const totalMesMetraje = registrosMes.reduce((sum, r) => sum + Number(r.metraje), 0);
      
      return {
        totalMetraje,
        registrosHoy: registrosHoy.length,
        registrosSemana: registrosSemana.length,
        registrosMes: registrosMes.length,
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
      const registros = await this.obtenerRegistros();
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      
      return registros.filter(r => {
        const fecha = new Date(r.created_at!);
        return fecha >= inicio && fecha <= fin;
      });
    } catch (error) {
      console.error('Error al obtener registros por fecha:', error);
      return [];
    }
  }

  // Establecer cantidad inicial de cable
  async setCantidadInicial(cantidad: number): Promise<void> {
    const inventario = { cantidad_inicial: cantidad, cantidad_actual: cantidad };
    await AsyncStorage.setItem(this.inventarioKey, JSON.stringify(inventario));
  }

  // Obtener inventario (inicial y actual)
  async obtenerInventario(): Promise<{ cantidad_inicial: number; cantidad_actual: number }> {
    const data = await AsyncStorage.getItem(this.inventarioKey);
    if (!data) {
      return { cantidad_inicial: 0, cantidad_actual: 0 };
    }
    return JSON.parse(data);
  }

  // Limpiar todos los datos (útil para desarrollo)
  async limpiarTodosLosDatos(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem(this.inventarioKey);
      await AsyncStorage.removeItem(this.proyectosKey);
      console.log('Todos los datos han sido eliminados');
    } catch (error) {
      console.error('Error al limpiar datos:', error);
    }
  }

  // Finalizar un proyecto actual y guardar en historial
  async finalizarProyecto(nombreProyecto: string): Promise<boolean> {
    try {
      // Obtener datos actuales
      const inv = await this.obtenerInventario();
      const cantidadUsada = inv.cantidad_inicial - inv.cantidad_actual;
      
      // Guardar en historial de proyectos
      const nuevoProyecto = {
        nombre: nombreProyecto,
        fecha: new Date().toISOString(),
        cantidadInicial: inv.cantidad_inicial,
        cantidadUsada: cantidadUsada
      };
      
      // Obtener historial existente
      const historialData = await AsyncStorage.getItem(this.proyectosKey);
      let historial = historialData ? JSON.parse(historialData) : [];
      historial.unshift(nuevoProyecto); // añadir al inicio
      
      // Guardar historial actualizado
      await AsyncStorage.setItem(this.proyectosKey, JSON.stringify(historial));
      
      // Limpiar registros actuales
      await AsyncStorage.removeItem(this.storageKey);
      
      // Limpiar inventario actual
      await AsyncStorage.removeItem(this.inventarioKey);
      
      await NotificationService.sendImmediateNotification(
        '✅ Proyecto finalizado',
        `"${nombreProyecto}" ha sido archivado en tu historial`
      );
      
      return true;
    } catch (error) {
      console.error('Error al finalizar proyecto:', error);
      return false;
    }
  }
    // Obtener historial de proyectos
  async obtenerHistorialProyectos(): Promise<Array<{
    nombre: string;
    fecha: string;
    cantidadInicial: number;
    cantidadUsada: number;
  }>> {
    try {
      const historialData = await AsyncStorage.getItem(this.proyectosKey);
      if (!historialData) return [];
      
      return JSON.parse(historialData);
    } catch (error) {
      console.error('Error al obtener historial de proyectos:', error);
      return [];
    }
  }

  // Eliminar un proyecto del historial
  async eliminarProyecto(index: number): Promise<boolean> {
    try {
      const historialData = await AsyncStorage.getItem(this.proyectosKey);
      if (!historialData) return false;
      
      const historial = JSON.parse(historialData);
      if (index < 0 || index >= historial.length) {
        console.error('Índice de proyecto inválido');
        return false;
      }
      
      // Eliminar el proyecto del historial
      historial.splice(index, 1);
      
      // Guardar historial actualizado
      await AsyncStorage.setItem(this.proyectosKey, JSON.stringify(historial));
      
      await NotificationService.sendImmediateNotification(
        '🗑️ Proyecto eliminado',
        'El proyecto ha sido eliminado del historial'
      );
      
      return true;
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
      return false;
    }
  }
}

export default new LocalCableService();
