// src/types/index.ts
export type EstadoCita = 'PENDIENTE_PAGO' | 'VALIDANDO' | 'CONFIRMADA' | 'CANCELADA' | 'EXPIRADA';

export interface Cita {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  fecha: string; // ISO String 2025-12-20
  horario: string;  // "14:00"
  estado: EstadoCita;
  comprobanteUrl?: string; // URL de la imagen del pago
  creadoEn: string;
}

export interface Horario {
  hora: string;
  disponible: boolean;
}