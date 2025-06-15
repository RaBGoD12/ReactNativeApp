import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { RegistroCable } from '../types/database';
import NotificationService from './NotificationService';

class DiagnosticCableService {
  private storageKey = 'appcables_registros';
  private inventarioKey = 'appcables_inventario';
  private proyectosKey = 'appcables_proyectos_historial';

  // Crear un nuevo registro de cable (almacenado localmente) con diagnóstico
  async crearRegistro(registro: Omit<RegistroCable, 'id' | 'created_at' | 'user_id'>): Promise<RegistroCable | null> {
    try {
      // Paso 1: Crear el objeto de registro nuevo
      Alert.alert('Diagnóstico', 'Paso 1: Creando objeto de registro');
      const id = Date.now().toString();
      const nuevoRegistro: RegistroCable = {
        id,
        created_at: new Date().toISOString(),
        user_id: 'local-user',
        ...registro,
      };

      // Paso 2: Obtener registros existentes
      Alert.alert('Diagnóstico', 'Paso 2: Obteniendo registros existentes');
      const registrosExistentes = await this.obtenerRegistros();
      const registrosActualizados = [nuevoRegistro, ...registrosExistentes];
      
      // Paso 3: Guardar registros actualizados
      Alert.alert('Diagnóstico', 'Paso 3: Guardando registros');
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(registrosActualizados));

      // Paso 4: Actualizar inventario
      Alert.alert('Diagnóstico', 'Paso 4: Actualizando inventario');
      const inv = await this.obtenerInventario();
      const nuevaCantidadActual = Math.max(0, inv.cantidad_actual - registro.metraje);
      await AsyncStorage.setItem(
        this.inventarioKey,
        JSON.stringify({ cantidad_inicial: inv.cantidad_inicial, cantidad_actual: nuevaCantidadActual })
      );

      // Paso 5: Enviar notificación
      Alert.alert('Diagnóstico', 'Paso 5: Enviando notificación');
      try {
        await NotificationService.sendImmediateNotification(
          '✅ Registro guardado',
          `Se registraron ${registro.metraje} ${registro.unidad_medida} de cable`
        );
      } catch (notifError) {
        Alert.alert('Error en notificación', 'Hubo un error al enviar la notificación, pero el registro se guardó.');
        console.error('Error en notificación:', notifError);
      }

      Alert.alert('Diagnóstico', 'Registro completado exitosamente');
      return nuevoRegistro;
    } catch (error) {
      Alert.alert('Error en diagnóstico', `Error: ${error instanceof Error ? error.message : String(error)}`);
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

  // Obtener inventario (inicial y actual)
  async obtenerInventario(): Promise<{ cantidad_inicial: number; cantidad_actual: number }> {
    const data = await AsyncStorage.getItem(this.inventarioKey);
    if (!data) {
      return { cantidad_inicial: 0, cantidad_actual: 0 };
    }
    return JSON.parse(data);
  }
}

export default new DiagnosticCableService();
