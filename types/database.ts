export interface RegistroCable {
  id?: string;
  created_at?: string;
  user_id?: string;
  metraje: number;
  unidad_medida: 'metros';
  notas?: string;
}

export interface Usuario {
  id: string;
  email?: string;
  created_at?: string;
}

export interface EstadisticasCable {
  totalMetraje: number;
  registrosHoy: number;
  registrosSemana: number;
  registrosMes: number;
  totalSemanaMetraje: number;
  totalMesMetraje: number;
}
