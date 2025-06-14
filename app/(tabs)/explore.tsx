import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import EstadisticasCard from '../../components/EstadisticasCard';
import LocalCableService from '../../services/LocalCableService';
import { EstadisticasCable, RegistroCable } from '../../types/database';

export default function Historial() {
  const [registros, setRegistros] = useState<RegistroCable[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasCable | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState<'semana' | 'mes' | 'todo'>('semana');
  const [activeTab, setActiveTab] = useState<'registros' | 'proyectos'>('registros');  const [proyectos, setProyectos] = useState<Array<{
    nombre: string;
    fecha: string;
    cantidadInicial: number;
    cantidadUsada: number;
  }>>([]);

  // Ref para rastrear los Swipeable abiertos
  const swipeableRefs = useRef<Array<Swipeable | null>>([]);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [registrosData, estadisticasData, proyectosData] = await Promise.all([
        LocalCableService.obtenerRegistros(),
        LocalCableService.obtenerEstadisticas(),
        LocalCableService.obtenerHistorialProyectos(),
      ]);
      setRegistros(registrosData);
      setEstadisticas(estadisticasData);
      setProyectos(proyectosData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  // Función para eliminar un registro
  const handleEliminarRegistro = async (id: string) => {
    try {
      const eliminado = await LocalCableService.eliminarRegistro(id);
      if (eliminado) {
        await loadData();
      }
    } catch (error) {
      console.error('Error al eliminar registro:', error);
    }
  };

  // Función para eliminar un proyecto
  const handleEliminarProyecto = async (index: number) => {
    try {
      const eliminado = await LocalCableService.eliminarProyecto(index);
      if (eliminado) {
        await loadData();
      }
    } catch (error) {
      console.error('Error al eliminar proyecto:', error);
    }
  };

  // Cerrar todos los Swipeable abiertos excepto el actual
  const closeOtherSwipeables = (index: number) => {
    swipeableRefs.current.forEach((ref, i) => {
      if (i !== index && ref) {
        ref.close();
      }
    });
  };
  
  // Filtrar registros según el período seleccionado
  const getRegistrosFiltrados = () => {
    if (!registros.length) return [];
    
    const hoy = new Date();
    if (filtroFecha === 'semana') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Inicio de semana (domingo)
      return registros.filter(r => new Date(r.created_at!) >= inicioSemana);
    } else if (filtroFecha === 'mes') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return registros.filter(r => new Date(r.created_at!) >= inicioMes);
    }
    return registros;
  };

  const registrosFiltrados = getRegistrosFiltrados();
    // Renderiza la lista de registros
  const renderRegistrosList = () => (
    <>
      {estadisticas && <EstadisticasCard estadisticas={estadisticas} />}
      
      <View style={styles.filtroContainer}>
        <TouchableOpacity
          style={[styles.filtroBtn, filtroFecha === 'semana' && styles.filtroBtnActivo]}
          onPress={() => setFiltroFecha('semana')}
        >
          <Text style={[styles.filtroText, filtroFecha === 'semana' && styles.filtroTextActivo]}>
            Esta semana
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filtroBtn, filtroFecha === 'mes' && styles.filtroBtnActivo]}
          onPress={() => setFiltroFecha('mes')}
        >
          <Text style={[styles.filtroText, filtroFecha === 'mes' && styles.filtroTextActivo]}>
            Este mes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filtroBtn, filtroFecha === 'todo' && styles.filtroBtnActivo]}
          onPress={() => setFiltroFecha('todo')}
        >
          <Text style={[styles.filtroText, filtroFecha === 'todo' && styles.filtroTextActivo]}>
            Todo
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={registrosFiltrados}
        keyExtractor={(item) => item.id!}
        renderItem={({ item, index }) => {
          // Renderizar las acciones al deslizar a la derecha
          const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
            const trans = dragX.interpolate({
              inputRange: [-100, 0],
              outputRange: [0, 100],
              extrapolate: 'clamp',
            });
            
            return (
              <View style={styles.rightActionsContainer}>
                <Animated.View
                  style={[
                    styles.deleteAction,
                    {
                      transform: [{ translateX: trans }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleEliminarRegistro(item.id!)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            );
          };
          
          return (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[index] = ref;
              }}
              renderRightActions={renderRightActions}
              onSwipeableOpen={() => closeOtherSwipeables(index)}
              friction={2}
              rightThreshold={40}
            >
              <View style={styles.registroCard}>
                <View style={styles.registroHeader}>
                  <View style={styles.registroCantidadContainer}>
                    <Ionicons name="cut-outline" size={16} color="#FF9500" style={{marginRight: 6}} />
                    <Text style={styles.registroCantidad}>{item.metraje} m</Text>
                  </View>
                  <Text style={styles.registroFecha}>
                    {new Date(item.created_at!).toLocaleDateString()}
                  </Text>
                </View>
                
                {item.notas && (
                  <View style={styles.registroNotasContainer}>
                    <Ionicons name="document-text-outline" size={14} color="#86868B" style={{marginRight: 6, marginTop: 2}} />
                    <Text style={styles.registroNotas}>{item.notas}</Text>
                  </View>
                )}
              </View>
            </Swipeable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No hay registros en este período</Text>
            <Text style={styles.emptyStateSubtext}>
              Cuando registres uso de cable, aparecerá aquí
            </Text>
          </View>
        }        contentContainerStyle={[
          styles.listContent,
          registrosFiltrados.length === 0 && styles.emptyStateContainer
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            title="Cargando..."
            titleColor="#86868B"
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }      
      />
    </>
  );
  // Renderiza la lista de proyectos finalizados
  const renderProyectosList = () => {
    return (
      <FlatList
        data={proyectos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          // Renderizar las acciones al deslizar a la derecha
          const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
            const trans = dragX.interpolate({
              inputRange: [-100, 0],
              outputRange: [0, 100],
              extrapolate: 'clamp',
            });
            
            return (
              <View style={styles.rightActionsContainer}>
                <Animated.View
                  style={[
                    styles.deleteAction,
                    {
                      transform: [{ translateX: trans }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleEliminarProyecto(index)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            );
          };
          
          return (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[index + registros.length] = ref; // Offset to avoid conflicts with registros swipeables
              }}
              renderRightActions={renderRightActions}
              onSwipeableOpen={() => closeOtherSwipeables(index + registros.length)}
              friction={2}
              rightThreshold={40}
            >
              <View style={styles.proyectoCard}>
                <View style={styles.proyectoHeader}>
                  <View style={styles.proyectoTitleContainer}>
                    <Ionicons name="file-tray-full-outline" size={22} color="#007AFF" style={{marginRight: 8}} />
                    <Text style={styles.proyectoNombre}>{item.nombre}</Text>
                  </View>
                  <Text style={styles.proyectoFecha}>
                    {new Date(item.fecha).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.proyectoDivider} />
                
                <View style={styles.proyectoDetalles}>
                  <View style={styles.proyectoDetalle}>
                    <Text style={styles.proyectoDetalleLabel}>Cable inicial:</Text>
                    <Text style={styles.proyectoDetalleValor}>{item.cantidadInicial} m</Text>
                  </View>
                  <View style={styles.proyectoDetalle}>
                    <Text style={styles.proyectoDetalleLabel}>Cable utilizado:</Text>
                    <Text style={[styles.proyectoDetalleValor, {color: '#FF9500'}]}>{item.cantidadUsada} m</Text>
                  </View>
                  <View style={styles.proyectoDetalle}>
                    <Text style={styles.proyectoDetalleLabel}>Restante:</Text>
                    <Text style={[styles.proyectoDetalleValor, {color: '#34C759'}]}>{item.cantidadInicial - item.cantidadUsada} m</Text>
                  </View>
                  <View style={styles.proyectoDetalle}>
                    <Text style={styles.proyectoDetalleLabel}>% Utilizado:</Text>
                    <Text style={styles.proyectoDetalleValor}>
                      {Math.round((item.cantidadUsada / item.cantidadInicial) * 100)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={{height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden'}}>
                    <View 
                      style={[
                        { 
                          height: '100%',
                          width: `${Math.min(100, (item.cantidadUsada / item.cantidadInicial) * 100)}%`,
                          backgroundColor: item.cantidadUsada > item.cantidadInicial * 0.8 ? '#FF3B30' : '#34C759',
                          borderRadius: 3
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressBarText}>
                    {Math.round((item.cantidadUsada / item.cantidadInicial) * 100)}% utilizado
                  </Text>
                </View>
              </View>
            </Swipeable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>No hay proyectos finalizados</Text>
            <Text style={styles.emptyStateSubtext}>
              Usa el botón "Finalizar proyecto" en la pantalla principal
            </Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => setActiveTab('registros')}
            >
              <Text style={styles.emptyStateButtonText}>Ver registros</Text>
            </TouchableOpacity>
          </View>
        }        contentContainerStyle={[
          styles.listContent,
          proyectos.length === 0 && styles.emptyStateContainer
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            title="Cargando..."
            titleColor="#86868B"
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSubtitle}>Registros y proyectos finalizados</Text>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'registros' && styles.activeTabButton]} 
          activeOpacity={0.7}
          onPress={() => setActiveTab('registros')}
        >
          <Ionicons 
            name="list-outline" 
            size={18} 
            color={activeTab === 'registros' ? '#FFFFFF' : '#1D1D1F'} 
            style={styles.tabIcon} 
          />
          <Text style={[styles.tabText, activeTab === 'registros' && styles.activeTabText]}>
            Registros
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'proyectos' && styles.activeTabButton]} 
          activeOpacity={0.7}
          onPress={() => setActiveTab('proyectos')}
        >
          <Ionicons 
            name="folder-outline" 
            size={18} 
            color={activeTab === 'proyectos' ? '#FFFFFF' : '#1D1D1F'} 
            style={styles.tabIcon} 
          />
          <Text style={[styles.tabText, activeTab === 'proyectos' && styles.activeTabText]}>
            Proyectos
          </Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'registros' ? renderRegistrosList() : renderProyectosList()}
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#86868B',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 4,
    height: 50,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    height: '100%',
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabIcon: {
    marginRight: 6,
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 4,
  },
  filtroBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filtroBtnActivo: {
    backgroundColor: '#007AFF',
  },
  filtroText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  filtroTextActivo: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  registroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  registroCantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registroCantidad: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  registroFecha: {
    fontSize: 14,
    color: '#86868B',
  },
  registroNotasContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  registroNotas: {
    fontSize: 14,
    color: '#515154',
    flex: 1,
  },
  proyectoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  proyectoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  proyectoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proyectoNombre: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  proyectoFecha: {
    fontSize: 14,
    color: '#86868B',
  },
  proyectoDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  proyectoDetalles: {
    marginBottom: 12,
  },
  proyectoDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  proyectoDetalleLabel: {
    fontSize: 14,
    color: '#86868B',
  },
  proyectoDetalleValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  progressBarContainer: {
    marginTop: 8,
  },  progressBarText: {
    fontSize: 12,
    color: '#86868B',
    marginTop: 6,
    textAlign: 'right',
  },
  // Estilos para las acciones de swipe
  rightActionsContainer: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});