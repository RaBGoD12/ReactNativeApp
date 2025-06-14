import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EstadisticasCable } from '../types/database';

interface EstadisticasCardProps {
  estadisticas: EstadisticasCable;
}

export default function EstadisticasCard({ estadisticas }: EstadisticasCardProps) {
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Estadísticas</Text>
      
      <View style={styles.grid}>
        <View style={styles.stat}>
          <Ionicons name="analytics" size={24} color="#007AFF" />
          <Text style={styles.statNumber}>{formatNumber(estadisticas.totalMetraje)}</Text>
          <Text style={styles.statLabel}>Total metros</Text>
        </View>
        
        <View style={styles.stat}>
          <Ionicons name="today" size={24} color="#34C759" />
          <Text style={styles.statNumber}>{estadisticas.registrosHoy}</Text>
          <Text style={styles.statLabel}>Registros hoy</Text>
        </View>
          <View style={styles.stat}>
          <Ionicons name="calendar" size={24} color="#FF9500" />
          <Text style={styles.statNumber}>{estadisticas.registrosSemana}</Text>
          <Text style={styles.statLabel}>Esta semana</Text>
        </View>
        
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={24} color="#FF3B30" />
          <Text style={styles.statNumber}>{estadisticas.registrosMes}</Text>
          <Text style={styles.statLabel}>Este mes</Text>
        </View>

        <View style={styles.stat}>
          <Ionicons name="speedometer" size={24} color="#5856D6" />
          <Text style={styles.statNumber}>{formatNumber(estadisticas.totalSemanaMetraje)}</Text>
          <Text style={styles.statLabel}>Metraje semana</Text>
        </View>

        <View style={styles.stat}>
          <Ionicons name="speedometer" size={24} color="#FF2D55" />
          <Text style={styles.statNumber}>{formatNumber(estadisticas.totalMesMetraje)}</Text>
          <Text style={styles.statLabel}>Metraje mes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stat: {
    width: '48%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 20,
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
});
