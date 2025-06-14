import { ThemedView } from '@/components/ThemedView';
import CableService from '@/services/CableService';
import NotificationService from '@/services/NotificationService';
import { EstadisticasCable, RegistroCable } from '@/types/database';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ExploreScreen() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasCable>({
    totalMetraje: 0,
    registrosHoy: 0,
    registrosSemana: 0,
    registrosMes: 0,
    totalSemanaMetraje: 0,
    totalMesMetraje: 0,
  });
  const [registrosRecientes, setRegistrosRecientes] = useState<RegistroCable[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    try {
      const [estadisticasData, registrosData] = await Promise.all([
        CableService.obtenerEstadisticas(),
        CableService.obtenerRegistros(),
      ]);
      
      setEstadisticas(estadisticasData);
      setRegistrosRecientes(registrosData.slice(0, 5)); // Solo los 5 más recientes
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const configurarNotificaciones = async () => {
    try {
      await NotificationService.scheduleNotificationReminder();
      await NotificationService.scheduleWeeklyReport();
      Alert.alert(
        'Notificaciones configuradas',
        'Recibirás recordatorios diarios a las 6 PM y reportes semanales los domingos a las 8 PM'
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron configurar las notificaciones');
    }
  };



  const formatNumber = (num: number) => num.toFixed(1);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Estadísticas</Text>
          <Text style={styles.subtitle}>Análisis detallado de uso de cables</Text>
        </View>

        {/* Totales semana y mes */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardSecondary]}>
            <Text style={styles.statNumber}>{estadisticas.totalSemanaMetraje.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Metraje semana</Text>
          </View>
          <View style={[styles.statCard, styles.statCardWarning]}>
            <Text style={styles.statNumber}>{estadisticas.totalMesMetraje.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Metraje mes</Text>
          </View>
        </View>

        {/* Registros recientes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          {registrosRecientes.length > 0 ? (
            registrosRecientes.map((registro) => (
              <View key={registro.id} style={styles.recentItem}>
                <View style={styles.recentItemContent}>
                  <Text style={styles.recentItemMetraje}>
                    {registro.metraje} {registro.unidad_medida}
                  </Text>
                  <Text style={styles.recentItemDate}>
                    {new Date(registro.created_at!).toLocaleDateString('es-ES')}
                  </Text>
                </View>
                {registro.notas && (
                  <Text style={styles.recentItemNotes}>{registro.notas}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay registros recientes</Text>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#86868B',
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
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 120,
  },
  statCardPrimary: {
    backgroundColor: '#E3F2FD',
  },
  statCardSecondary: {
    backgroundColor: '#E8F5E8',
  },
  statCardWarning: {
    backgroundColor: '#FFF3E0',
  },
  statCardDanger: {
    backgroundColor: '#FFEBEE',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#86868B',
    textAlign: 'center',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#86868B',
    marginTop: 2,
  },
  recentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recentItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemMetraje: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  recentItemDate: {
    fontSize: 14,
    color: '#86868B',
  },
  recentItemNotes: {
    fontSize: 14,
    color: '#515154',
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#86868B',
    fontSize: 16,
    marginTop: 20,
  },
});
