// src/services/api.ts
import type { Cita } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Obtener citas (opcional filtro por fecha)
  obtenerCitas: async (fecha?: string): Promise<Cita[]> => {
    try {
      const url = fecha
        ? `${API_URL}/citas?fecha=${fecha}`
        : `${API_URL}/citas`;

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener citas');
      return await response.json();
    } catch (error) {
      console.error(error);
      return []; // Retorna array vacío para no romper la UI
    }
  },

  // Obtener solo las que necesitan validación de pago
  obtenerPendientes: async (): Promise<Cita[]> => {
    try {
      const response = await fetch(`${API_URL}/citas/pendientes`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Validar o Rechazar un pago
  validarPago: async (id: string, accion: 'APROBAR' | 'RECHAZAR'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/validar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};