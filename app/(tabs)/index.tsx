import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import RegistroCard from '@/components/RegistroCard';
import RegistroModal from '@/components/RegistroModal';
import { ThemedView } from '@/components/ThemedView';
import CableService from '@/services/LocalCableService';
import NotificationService from '@/services/NotificationService';
import { RegistroCable } from '@/types/database';

export default function Inventario() {
  // Datos principales
  const [inventario, setInventario] = useState<{ cantidad_inicial: number; cantidad_actual: number } | null>(null);
  const [registros, setRegistros] = useState<RegistroCable[]>([]);
  
  // Estados de UI
  const [configurandoInicial, setConfigurandoInicial] = useState(false);
  const [nuevaCantidad, setNuevaCantidad] = useState('');  
  const [modalVisible, setModalVisible] = useState(false);
  const [registroAEditar, setRegistroAEditar] = useState<RegistroCable | undefined>();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [finalizandoProyecto, setFinalizandoProyecto] = useState(false);
  const [proyectoNombre, setProyectoNombre] = useState('Mi Proyecto');  
  
  // Historial de proyectos finalizados
  const [historialProyectos, setHistorialProyectos] = useState<Array<{
    nombre: string;
    fecha: string;
    cantidadInicial: number;
    cantidadUsada: number;
  }>>([]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [registrosData, inventarioData] = await Promise.all([
        CableService.obtenerRegistros(),
        CableService.obtenerInventario(),
      ]);
      
      setRegistros(registrosData);
      setInventario(inventarioData);
      
      // Si no hay inventario configurado, mostrar la pantalla de configuración
      if (!inventarioData || inventarioData.cantidad_inicial === 0) {
        setConfigurandoInicial(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  // Inicializar notificaciones solo una vez al montar el componente
  useEffect(() => {
    NotificationService.initializeNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const handleCrearRegistro = async (registro: Omit<RegistroCable, 'id' | 'created_at' | 'user_id'>) => {
    const nuevoRegistro = await CableService.crearRegistro(registro);
    if (nuevoRegistro) {
      await cargarDatos();
    }
  };

  const handleEditarRegistro = async (id: string, registro: Partial<RegistroCable>) => {
    const registroActualizado = await CableService.actualizarRegistro(id, registro);
    if (registroActualizado) {
      await cargarDatos();
    }
  };

  const handleEliminarRegistro = async (id: string) => {
    const eliminado = await CableService.eliminarRegistro(id);
    if (eliminado) {
      await cargarDatos();
    }
  };

  const abrirModalEdicion = (registro: RegistroCable) => {
    setRegistroAEditar(registro);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setRegistroAEditar(undefined);
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>📏 AppCables</Text>
        <Text style={styles.subtitle}>Inventario de cables</Text>
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Registros de uso</Text>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cut-outline" size={64} color="#86868B" />
      <Text style={styles.emptyTitle}>No has usado cable aún</Text>
      <Text style={styles.emptySubtitle}>
        Registra cuánto cable utilizas con el botón inferior
      </Text>
    </View>
  );

  const renderInventarioPanel = () => {
    if (!inventario) return null;
  
    return (
      <View style={styles.inventarioPanel}>
        <View style={styles.inventarioHeader}>
          <Text style={styles.inventarioTitulo}>Inventario de Cable</Text>
          {inventario.cantidad_inicial > 0 && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={() => setFinalizandoProyecto(true)}
                style={[styles.configButton, { marginRight: 8 }]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#34C759" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setConfigurandoInicial(true)}
                style={styles.configButton}
              >
                <Ionicons name="settings-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.inventarioMedidores}>
          <View style={styles.medidor}>
            <Text style={styles.medidorLabel}>Cantidad Inicial</Text>
            <Text style={styles.medidorValor}>{inventario.cantidad_inicial} m</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.medidor}>
            <Text style={styles.medidorLabel}>Restante</Text>
            <Text style={[
              styles.medidorValor, 
              inventario.cantidad_actual < inventario.cantidad_inicial * 0.2 ? styles.valorBajo : null
            ]}>
              {inventario.cantidad_actual} m
            </Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${Math.min(100, inventario.cantidad_inicial > 0 ? (inventario.cantidad_actual / inventario.cantidad_inicial) * 100 : 0)}%`,
                backgroundColor: inventario.cantidad_actual < inventario.cantidad_inicial * 0.2 ? '#FF3B30' : '#34C759'
              }
            ]} 
          />
        </View>
        
        <Text style={styles.porcentajeTexto}>
          {inventario.cantidad_inicial > 0 ? 
            `${Math.round((inventario.cantidad_actual / inventario.cantidad_inicial) * 100)}% disponible` : 
            "0% disponible"}
        </Text>
      </View>
    );
  };

  const renderConfiguracionInicial = () => (
    <ScrollView 
      contentContainerStyle={styles.configuracionInicialScrollView}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.configuracionInicial}>
        <Ionicons name="flash" size={48} color="#007AFF" />
        <Text style={styles.configuracionTitulo}>
          {inventario && inventario.cantidad_inicial > 0 
            ? 'Modificar cantidad inicial' 
            : 'Configurar tu inventario'}
        </Text>
        <Text style={styles.configuracionSubtitulo}>
          {inventario && inventario.cantidad_inicial > 0 
            ? 'Cambia la cantidad inicial de cable' 
            : 'Ingresa la cantidad total de cable disponible'}
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Ej: 7000"
            placeholderTextColor="#86868B"
            onChangeText={(text) => setNuevaCantidad(text)}
            autoFocus={true}
          />
          <Text style={styles.inputLabel}>metros</Text>
        </View>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            const valor = Number(nuevaCantidad);
            if (valor > 0) {
              await CableService.setCantidadInicial(valor);
              await cargarDatos();
              setNuevaCantidad('');
              setConfigurandoInicial(false);
            } else {
              Alert.alert('Error', 'Ingresa un valor válido mayor a cero');
            }
          }}
        >
          <Text style={styles.actionButtonText}>Guardar</Text>
        </TouchableOpacity>
        
        {inventario && inventario.cantidad_inicial > 0 && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setConfigurandoInicial(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );

  const renderFinalizarProyectoModal = () => (
    <ScrollView 
      contentContainerStyle={styles.finalizarProyectoContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
    >
      <View style={styles.finalizarProyectoContent}>
        <Ionicons name="checkmark-circle" size={48} color="#34C759" />
        <Text style={styles.configuracionTitulo}>
          Finalizar proyecto actual
        </Text>
        <Text style={styles.configuracionSubtitulo}>
          Se guardará el historial y podrás comenzar un nuevo proyecto con otra cantidad de cable
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { textAlign: 'left', flex: 1 }]}
            placeholder="Nombre del proyecto"
            value={proyectoNombre}
            onChangeText={setProyectoNombre}
            autoFocus={true}
          />
        </View>
        
        <View style={styles.resumenProyecto}>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Cable inicial:</Text>
            <Text style={styles.resumenValor}>{inventario?.cantidad_inicial || 0} m</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Cable utilizado:</Text>
            <Text style={[styles.resumenValor, {color: '#FF9500'}]}>
              {inventario ? (inventario.cantidad_inicial - inventario.cantidad_actual) : 0} m
            </Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Cable restante:</Text>
            <Text style={[styles.resumenValor, {color: '#34C759'}]}>{inventario?.cantidad_actual || 0} m</Text>
          </View>
          <View style={styles.resumenItem}>
            <Text style={styles.resumenLabel}>Porcentaje utilizado:</Text>
            <Text style={styles.resumenValor}>
              {inventario ? Math.round(((inventario.cantidad_inicial - inventario.cantidad_actual) / inventario.cantidad_inicial) * 100) : 0}%
            </Text>
          </View>
        </View>
        
        <View style={styles.progressBarContainerResumen}>
          <View style={{height: 8, backgroundColor: '#E5E5EA', borderRadius: 4, overflow: 'hidden', width: '100%'}}>
            <View 
              style={[
                { 
                  height: '100%',
                  width: inventario ? `${Math.min(100, ((inventario.cantidad_inicial - inventario.cantidad_actual) / inventario.cantidad_inicial) * 100)}%` : '0%',
                  backgroundColor: inventario && (inventario.cantidad_inicial - inventario.cantidad_actual > inventario.cantidad_inicial * 0.8) ? '#FF3B30' : '#34C759',
                  borderRadius: 4
                }
              ]} 
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={async () => {
            if (!proyectoNombre.trim()) {
              Alert.alert('Error', 'Por favor ingresa un nombre para el proyecto');
              return;
            }
            
            const success = await CableService.finalizarProyecto(proyectoNombre);
            if (success) {
              setFinalizandoProyecto(false);
              setProyectoNombre('Mi Proyecto');
              await cargarDatos();
            } else {
              Alert.alert('Error', 'No se pudo finalizar el proyecto');
            }
          }}
        >
          <Text style={styles.actionButtonText}>Finalizar y crear nuevo proyecto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setFinalizandoProyecto(false)}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Header modificado para mostrar el inventario
  const renderInventarioHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>📏 Inventario Cable</Text>
        <Text style={styles.subtitle}>Control de inventario</Text>
      </View>
      
      {renderInventarioPanel()}
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Registros de uso</Text>
        <Text style={styles.sectionSubtitle}>
          Total registrado: {registros.reduce((sum, r) => sum + r.metraje, 0)} m
        </Text>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {configurandoInicial ? (
        renderConfiguracionInicial()
      ) : finalizandoProyecto ? (
        renderFinalizarProyectoModal()
      ) : (
        <>
          <FlatList
            data={registros}
            keyExtractor={(item) => item.id!}
            renderItem={({ item }) => (
              <RegistroCard
                registro={item}
                onEdit={abrirModalEdicion}
                onDelete={handleEliminarRegistro}
              />
            )}
            ListHeaderComponent={renderInventarioHeader}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={[
              registros.length === 0 ? styles.emptyList : undefined,
              { paddingBottom: 80 } // Espacio para el FAB
            ]}
            showsVerticalScrollIndicator={false}
          />
          
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="remove" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}

      {modalVisible && (
        <RegistroModal
          visible={modalVisible}
          onClose={cerrarModal}
          onSave={handleCrearRegistro}
          onUpdate={handleEditarRegistro}
          registro={registroAEditar}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    color: '#86868B',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#86868B',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 8,
  },
  // Panel de inventario
  inventarioPanel: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inventarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inventarioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  configButton: {
    padding: 6,
  },
  inventarioMedidores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  medidor: {
    flex: 1,
    alignItems: 'center',
  },
  medidorLabel: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 4,
  },
  medidorValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  valorBajo: {
    color: '#FF3B30',
  },
  // Estilos para el resumen de proyecto
  resumenProyecto: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resumenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resumenLabel: {
    fontSize: 16,
    color: '#4F4F4F',
  },
  resumenValor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  separator: {
    height: '80%',
    width: 1,
    backgroundColor: '#E5E5EA',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E5EA',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  porcentajeTexto: {
    textAlign: 'center',
    fontSize: 13,
    color: '#86868B',
    fontWeight: '500',
  },
  // Configuración inicial
  configuracionInicialScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  configuracionInicial: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  configuracionTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginTop: 16,
  },
  configuracionSubtitulo: {
    fontSize: 16,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F2F2F7',
    fontSize: 20,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 18,
    marginLeft: 8,
    color: '#1D1D1F',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  // Estilos para pantalla "Finalizar Proyecto"
  finalizarProyectoContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  finalizarProyectoContent: {
    alignItems: 'center',
    width: '100%',
  },
  progressBarContainerResumen: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
});
