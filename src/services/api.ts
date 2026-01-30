// src/services/api.ts
import type { Cita } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- AUTENTICACIÓN ---
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Credenciales inválidas');
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  me: async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  },

  // Obtener citas (opcional filtro por fecha)
  obtenerCitas: async (fecha?: string): Promise<Cita[]> => {
    try {
      const url = fecha
        ? `${API_URL}/citas?fecha=${fecha}`
        : `${API_URL}/citas`;

      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) {
        if (response.status === 401) throw new Error('No autorizado');
        throw new Error('Error al obtener citas');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Obtener solo las que necesitan validación de pago
  obtenerPendientes: async (): Promise<Cita[]> => {
    try {
      const response = await fetch(`${API_URL}/citas/pendientes`, { headers: getHeaders() });
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  // Validar o Rechazar un pago
  validarPago: async (id: string, accion: 'APROBAR' | 'RECHAZAR'): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/validar`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ accion })
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Obtener horarios disponibles (público o privado si se requiere)
  obtenerHorariosDisponibles: async (fecha: string): Promise<string[]> => {
    try {
      const response = await fetch(`${API_URL}/citas/horarios-disponibles?fecha=${fecha}`, { headers: getHeaders() });
      if (!response.ok) throw new Error('Error al obtener horarios');
      const data = await response.json();
      return data.horarios || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  // Crear cita desde panel admin
  crearCitaAdmin: async (datos: {
    clienteNombre: string;
    clienteTelefono: string;
    fecha: string;
    horario: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/citas/admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(datos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al crear la cita' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // Obtener resumen del dashboard
  obtenerResumen: async () => {
    try {
      const response = await fetch(`${API_URL}/citas/resumen`, { headers: getHeaders() });
      if (!response.ok) {
        if (response.status === 401) throw new Error('No autorizado');
        throw new Error('Error al obtener resumen');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  // Reprogramar cita
  reprogramarCita: async (id: string, fecha: string, horario: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/reprogramar`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ fecha, horario })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al reprogramar la cita' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  }
};