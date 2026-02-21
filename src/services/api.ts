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
  },

  marcarNoAsistio: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/no-asistio`, {
        method: 'PUT',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al marcar como no asistió' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  marcarAsistio: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/asistio`, {
        method: 'PUT',
        headers: getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al marcar como asistió' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // --- DESCRIPCIÓN ---
  actualizarDescripcion: async (id: string, descripcion: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/citas/${id}/descripcion`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ descripcion })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al actualizar descripción' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  // --- CHAT ---
  obtenerConversaciones: async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversaciones`, { headers: getHeaders() });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  obtenerMensajes: async (jid: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/mensajes/${encodeURIComponent(jid)}`, { headers: getHeaders() });
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  enviarMensajeChat: async (jid: string, texto: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/chat/enviar/${encodeURIComponent(jid)}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ texto })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Error al enviar mensaje' };
      }

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Error de conexión' };
    }
  },

  eliminarConversacion: async (jid: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_URL}/chat/conversacion/${encodeURIComponent(jid)}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return response.ok ? { success: true } : { success: false };
    } catch {
      return { success: false };
    }
  }
};
