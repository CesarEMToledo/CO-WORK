'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Estructura para registrar la actividad de un usuario
interface ActividadUsuario {
  id: string;
  usuario: string;
  correo: string;
  rol: 'Administrador' | 'Colaborador';
  accion: 'Inicio de Sesión' | 'Registro de Venta' | 'Actualización de Inventario' | 'Cierre de Caja';
  fechaHora: string;
  dispositivo: string;
}

// Datos simulados (mock data) de uso diario
const ACTIVIDADES_INICIALES: ActividadUsuario[] = [
  { id: '1', usuario: 'Sofía Martínez', correo: 'sofia@placetive.com', rol: 'Administrador', accion: 'Registro de Venta', fechaHora: '2026-07-14 11:24:12', dispositivo: 'Web - Chrome' },
  { id: '2', usuario: 'Alejandro Ruiz', correo: 'ale.ruiz@placetive.com', rol: 'Colaborador', accion: 'Inicio de Sesión', fechaHora: '2026-07-14 10:15:30', dispositivo: 'Móvil - Safari' },
  { id: '3', usuario: 'Sofía Martínez', correo: 'sofia@placetive.com', rol: 'Administrador', accion: 'Actualización de Inventario', fechaHora: '2026-07-14 09:30:00', dispositivo: 'Web - Chrome' },
  { id: '4', usuario: 'Alejandro Ruiz', correo: 'ale.ruiz@placetive.com', rol: 'Colaborador', accion: 'Cierre de Caja', fechaHora: '2026-07-13 18:00:15', dispositivo: 'Web - Edge' },
  { id: '5', usuario: 'Sofía Martínez', correo: 'sofia@placetive.com', rol: 'Administrador', accion: 'Inicio de Sesión', fechaHora: '2026-07-13 08:45:10', dispositivo: 'Móvil - Android' },
];

export default function UsuariosPage() {
  const [filtroAccion, setFiltroAccion] = useState<string>('todos');

  // Filtramos la bitácora según el botón que se oprima
  const actividadesFiltradas = ACTIVIDADES_INICIALES.filter(act => {
    if (filtroAccion === 'todos') return true;
    return act.accion.toLowerCase().includes(filtroAccion);
  });

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900">
      
      {/* Botón para regresar al menú */}
      <div className="mb-6">
        <Link href="/reportes" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al menú de reportes
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">👥 Actividad de Usuarios</h1>
        <p className="text-gray-600">Monitorea los accesos, registros y acciones clave de tu equipo de trabajo.</p>
      </header>

      {/* KPIs Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Usuarios Activos</div>
          <div className="text-2xl font-bold text-gray-800">2 Integrantes</div>
          <div className="text-xs text-gray-400 mt-1">Conectados recientemente</div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Sesiones de Hoy</div>
          <div className="text-2xl font-bold text-indigo-600">3 inicios de sesión</div>
          <div className="text-xs text-gray-400 mt-1">Desde distintos dispositivos</div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Tasa de Operación</div>
          <div className="text-2xl font-bold text-emerald-600">100% Estable</div>
          <div className="text-xs text-gray-400 mt-1">Sin errores de sistema reportados</div>
        </div>
      </div>

      {/* Bitácora de Actividades */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filtros de Eventos */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">Bitácora de Eventos</h3>
          <div className="flex gap-2">
            {[
              { label: 'Todos', value: 'todos' },
              { label: 'Ventas', value: 'venta' },
              { label: 'Accesos', value: 'sesión' },
              { label: 'Inventario', value: 'inventario' }
            ].map((opcion) => (
              <button
                key={opcion.value}
                onClick={() => setFiltroAccion(opcion.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filtroAccion === opcion.value 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Bitácora */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Acción Realizada</th>
                <th className="p-4">Fecha y Hora</th>
                <th className="p-4">Dispositivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {actividadesFiltradas.map((act) => (
                <tr key={act.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{act.usuario}</div>
                    <div className="text-xs text-gray-400">{act.correo}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                      act.rol === 'Administrador' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {act.rol}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{act.accion}</td>
                  <td className="p-4 text-gray-600">{act.fechaHora}</td>
                  <td className="p-4 text-gray-500 text-xs">{act.dispositivo}</td>
                </tr>
              ))}
              {actividadesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No se encontraron registros para este tipo de acción.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}