import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import DiagnosticCableService from '@/services/DiagnosticCableService';

export default function DiagnosticScreen() {
  // Estado para el metraje a registrar
  const [metraje, setMetraje] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para probar la creación de un registro de forma segura
  const probarCrearRegistro = async () => {
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
      Alert.alert('Diagnóstico', 'Iniciando prueba de crear registro');
      
      const registroData = {
        metraje: metrajeFinal,
        unidad_medida: 'metros' as 'metros',
        notas: 'Registro de prueba para diagnóstico',
      };

      const resultado = await DiagnosticCableService.crearRegistro(registroData);
      
      if (resultado) {
        Alert.alert('Éxito', 'Registro creado correctamente: ' + JSON.stringify(resultado));
        setMetraje('');
      } else {
        Alert.alert('Error', 'No se pudo crear el registro');
      }
    } catch (error) {
      Alert.alert('Error inesperado', `Ocurrió un error: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error en prueba de crear registro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar inventario
  const verificarInventario = async () => {
    try {
      const inventario = await DiagnosticCableService.obtenerInventario();
      Alert.alert('Inventario', `Inicial: ${inventario.cantidad_inicial} m\nActual: ${inventario.cantidad_actual} m`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el inventario');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛠️ Diagnóstico AppCables</Text>
        <Text style={styles.subtitle}>Herramienta para solución de problemas</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Probar creación de registro</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={metraje}
            onChangeText={setMetraje}
            placeholder="Metraje (ej: 15.5)"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={probarCrearRegistro}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Probando...' : 'Probar crear registro'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Otras pruebas</Text>
        
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={verificarInventario}
        >
          <Text style={styles.buttonSecondaryText}>Verificar inventario</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#86868B',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
