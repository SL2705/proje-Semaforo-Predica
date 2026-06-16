
export interface Usuario {
  id: string;
  nombre: string;
  numero_reloj: string;
  rol: string;
}

export interface Solicitud {
  id: string;
  usuario_id: string;
  nombre: string;
  reloj: string;
  linea: string;
  motivo?: string;
  estado: 'PENDIENTE RH' | 'SUSPENDIDO' | 'RECHAZADA';
  fecha_solicitud: string;
}

export interface Operador {
  id: string;
  reloj: string;
  nombre: string;
  linea: string;
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'INCAPACIDAD';
  semaforo: 'rojo' | 'amarillo' | 'verde';
  total_faltas?: number;
  total_retardos?: number;
  historial?: HistorialEvento[];
}

export interface HistorialEvento {
  fecha: string;
  evento: string;
  icono: string;
  claseIcono: string;
}

export interface Reporte {
  ok: boolean;
  filtro: 'rojo' | 'amarillo' | 'verde';
  total: number;
  fecha_generacion: string;
  datos: OperadorReporte[];
}

export interface OperadorReporte {
  numero_reloj: string;
  nombre_completo: string;
  linea: string;
  faltas: number;
  retardos: number;
  semaforo: string;
}

export interface RespuestaApi {
  ok?: boolean;
  error?: string;
  mensaje?: string;
  [key: string]: any;
}
