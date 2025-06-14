import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RegistroCable } from '../types/database';

interface RegistroCardProps {
  registro: RegistroCable;
  onEdit: (registro: RegistroCable) => void;
  onDelete: (id: string) => void;
}

export default function RegistroCard({ registro, onEdit, onDelete }: RegistroCardProps) {
  const fecha = new Date(registro.created_at!).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => onDelete(registro.id!)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>          <View style={styles.metrajeContainer}>
            <Text style={styles.metraje}>{registro.metraje}</Text>
            <Text style={styles.unidad}>metros</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={() => onEdit(registro)}
              style={styles.actionButton}
            >
              <Ionicons name="pencil" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.fecha}>{fecha}</Text>
        
        {registro.notas && (
          <Text style={styles.notas}>{registro.notas}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metrajeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metraje: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  unidad: {
    fontSize: 16,
    color: '#86868B',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fecha: {
    fontSize: 14,
    color: '#86868B',
    marginBottom: 4,
  },
  notas: {
    fontSize: 14,
    color: '#515154',
    fontStyle: 'italic',
  },
});
