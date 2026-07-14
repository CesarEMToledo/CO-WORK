'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Definimos la estructura de una transacción financiera
interface Transaccion {
  id: string;
  fecha: string;
  descripcion: string;
  categoria: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
}

// Datos de ejemplo
const TRANSACCIONES_INICIALES: Transaccion[] = [
  { id: '1', fecha: '2026-07-10', descripcion: 'Venta de Bolis de 6oz (Lote Semanal)', categoria: 'Ventas', monto: 1850.00, tipo: 'ingreso' },
  { id: '2', fecha: '2026-07-11', descripcion: 'Compra de materia prima e insumos', categoria: 'Producción', monto: 450.00, tipo: 'egreso' },
  { id: '3', fecha: '2026-07-12', descripcion: 'Adquisición de empaques y bolsas', categoria: 'Empaque', monto: 220.00, tipo: 'egreso' },
  { id: '4', fecha: '2026-07-13', descripcion: 'Venta directa cliente mayorista', categoria: 'Ventas', monto: 950.00, tipo: 'ingreso' },
  { id: '5', fecha: '2026-07-14', descripcion: 'Mantenimiento de congelador', categoria: 'Mantenimiento', monto: 300.00, tipo: 'egreso' },
];

export default function FinanzasPage() {
  const [filtro, setFiltro] = useState<'todos' | 'ingreso' | 'egreso'>('todos');

  // Filtrar transacciones según el botón seleccionado
  const transaccionesFiltradas = TRANSACCIONES_INICIALES.filter(t => {
    if (filtro === 'todos') return true;
    return t.tipo === filtro;
  });

  // Cálculos dinámicos de los totales
  const totalIngresos = TRANSACCIONES_INICIALES
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const totalEgresos = TRANSACCIONES_INICIALES
    .filter(t => t.tipo === 'egreso')
    .reduce((sum, t) => sum + t.monto, 0);

  const balanceNeto = totalIngresos - totalEgresos;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900">
      
      {/* Navegación de regreso */}
      <div className="mb-6">
        <Link href="/reportes" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al menú de reportes
        </Link>
      </div>

      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">💰 Reporte Financiero</h1>
          <p className="text-gray-600">Monitorea tus flujos de caja, ingresos y egresos operativos.</p>
        </div>
        <div>
          <button 
            onClick={() => alert('Exportando datos a Excel...')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            📥 Exportar a Excel
          </button>
        </div>
      </header>

      {/* Tarjetas de Resumen Numérico (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Tarjeta Ingresos */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Ingresos</div>
          <div className="text-2xl font-bold text-emerald-600">${totalIngresos.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">Entradas registradas</div>
        </div>

        {/* Tarjeta Egresos */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Egresos</div>
          <div className="text-2xl font-bold text-red-600">${totalEgresos.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">Gastos de operación</div>
        </div>

        {/* Tarjeta Balance Neto */}
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Balance Neto</div>
          <div className={`text-2xl font-bold ${balanceNeto >= 0 ? 'text-blue-600' : 'text-red-700'}`}>
            ${balanceNeto.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">Utilidad disponible</div>
        </div>

      </div>

      {/* Sección de la Tabla y Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filtros de la Tabla */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">Listado de Movimientos</h3>
          <div className="flex gap-2">
            {(['todos', 'ingreso', 'egreso'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                  filtro === tipo 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tipo === 'todos' ? 'Ver Todos' : tipo === 'ingreso' ? 'Ingresos' : 'Egresos'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Fecha</th>
                <th className="p-4">Descripción</th>
                <th className="p-4">Categoría</th>
                <th className="p-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {transaccionesFiltradas.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-600">{t.fecha}</td>
                  <td className="p-4 text-gray-900 font-medium">{t.descripcion}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {t.categoria}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-semibold ${t.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.tipo === 'ingreso' ? '+' : '-'}${t.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
              {transaccionesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay transacciones registradas para este filtro.
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