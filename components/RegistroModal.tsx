import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RegistroCable } from '../types/database';

interface RegistroModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (registro: Omit<RegistroCable, 'id' | 'created_at' | 'user_id'>) => void;
  onUpdate?: (id: string, registro: Partial<RegistroCable>) => void;
  registro?: RegistroCable;
}

export default function RegistroModal({
  visible,
  onClose,
  onSave,
  onUpdate,
  registro,
}: RegistroModalProps) {  const [metraje, setMetraje] = useState('');
  const [unidadMedida, setUnidadMedida] = useState<'metros'>('metros');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = !!registro;

  useEffect(() => {
    if (visible) {
      if (registro) {
        setMetraje(registro.metraje.toString());
        setUnidadMedida(registro.unidad_medida);
        setNotas(registro.notas || '');
      } else {
        resetForm();
      }
    }
  }, [visible, registro]);

  const resetForm = () => {
    setMetraje('');
    setUnidadMedida('metros');
    setNotas('');
  };

  const handleSave = async () => {
    if (!metraje.trim()) {
      Alert.alert('Error', 'Por favor ingresa el metraje');
      return;
    }

    const metrajeFinal = parseFloat(metraje);
    if (isNaN(metrajeFinal) || metrajeFinal <= 0) {
      Alert.alert('Error', 'Por favor ingresa un metraje válido');
      return;
    }

    setLoading(true);

    try {
      const registroData = {
        metraje: metrajeFinal,
        unidad_medida: unidadMedida,
        notas: notas.trim() || undefined,
      };

      if (isEdit && onUpdate && registro) {
        await onUpdate(registro.id!, registroData);
      } else {
        await onSave(registroData);
      }

      onClose();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEdit ? 'Editar Registro' : 'Nuevo Registro'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Text>
          </TouchableOpacity>
        </View>        <ScrollView style={styles.content}>
          <View style={styles.section}>          <Text style={styles.label}>Cantidad de cable usado (metros) *</Text>
            <TextInput
              style={styles.input}
              value={metraje}
              onChangeText={setMetraje}
              placeholder="Ej: 15.5"
              keyboardType="numeric"
              returnKeyType="next"
            /></View>

          <View style={styles.section}>
            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.notasInput]}
              value={notas}
              onChangeText={setNotas}
              placeholder="Agrega detalles sobre este registro..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notasInput: {
    height: 100,
  },
});
