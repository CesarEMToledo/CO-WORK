'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Definimos la estructura para el rendimiento de cada producto
interface ProductoRendimiento {
  id: string;
  nombre: string;
  presentacion: string; // Ej. 6 oz, 8 oz
  categoria: string;
  unidadesVendidas: number;
  ingresosGenerados: number;
  stockActual: number;
  estadoStock: 'Suficiente' | 'Bajo Stock' | 'Agotado';
}

// Datos simulados (mock data) enfocados en tu inventario de bolis
const PRODUCTOS_INICIALES: ProductoRendimiento[] = [
  { id: '1', nombre: 'Bolis de Fresa', presentacion: '6 oz', categoria: 'Agua', unidadesVendidas: 450, ingresosGenerados: 2700.00, stockActual: 120, estadoStock: 'Suficiente' },
  { id: '2', nombre: 'Bolis de Rompope', presentacion: '6 oz', categoria: 'Leche', unidadesVendidas: 380, ingresosGenerados: 2660.00, stockActual: 15, estadoStock: 'Bajo Stock' },
  { id: '3', nombre: 'Bolis de Chocolate', presentacion: '6 oz', categoria: 'Leche', unidadesVendidas: 310, ingresosGenerados: 2170.00, stockActual: 8, estadoStock: 'Bajo Stock' },
  { id: '4', nombre: 'Bolis de Limón', presentacion: '6 oz', categoria: 'Agua', unidadesVendidas: 520, ingresosGenerados: 3120.00, stockActual: 200, estadoStock: 'Suficiente' },
  { id: '5', nombre: 'Bolis de Mango', presentacion: '6 oz', categoria: 'Agua', unidadesVendidas: 150, ingresosGenerados: 900.00, stockActual: 0, estadoStock: 'Agotado' },
];

export default function ProductosPage() {
  const [filtroStock, setFiltroStock] = useState<string>('todos');

  // Filtrar productos según el estado de stock seleccionado
  const productosFiltrados = PRODUCTOS_INICIALES.filter(p => {
    if (filtroStock === 'todos') return true;
    return p.estadoStock.toLowerCase().replace(' ', '-') === filtroStock;
  });

  // Cálculos rápidos para métricas principales (KPIs)
  const totalUnidadesVendidas = PRODUCTOS_INICIALES.reduce((sum, p) => sum + p.unidadesVendidas, 0);
  const totalIngresos = PRODUCTOS_INICIALES.reduce((sum, p) => sum + p.ingresosGenerados, 0);
  const productosBajosOAlerta = PRODUCTOS_INICIALES.filter(p => p.estadoStock !== 'Suficiente').length;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900">
      
      {/* Botón para regresar al menú */}
      <div className="mb-6">
        <Link href="/reportes" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al menú de reportes
        </Link>
      </div>

      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">📦 Rendimiento de Productos</h1>
          <p className="text-gray-600">Analiza cuáles sabores y presentaciones se venden más y monitorea el inventario.</p>
        </div>
      </header>

      {/* Tarjetas Informativas Rápidas (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Unidades Vendidas</div>
          <div className="text-2xl font-bold text-gray-800">{totalUnidadesVendidas} pzas</div>
          <div className="text-xs text-gray-400 mt-1">Acumulado en el periodo</div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Ingresos por Ventas</div>
          <div className="text-2xl font-bold text-blue-600">${totalIngresos.toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">Valor de mercancía salida</div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-500 mb-1">Alertas de Inventario</div>
          <div className={`text-2xl font-bold ${productosBajosOAlerta > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {productosBajosOAlerta} sabores
          </div>
          <div className="text-xs text-gray-400 mt-1">Requieren atención pronto</div>
        </div>
      </div>

      {/* Tabla de Rendimiento */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Filtros superiores */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-gray-700">Rendimiento por Sabores</h3>
          <div className="flex gap-2">
            {[
              { label: 'Todos', value: 'todos' },
              { label: 'Suficiente', value: 'suficiente' },
              { label: 'Bajo Stock', value: 'bajo-stock' },
              { label: 'Agotados', value: 'agotado' }
            ].map((opcion) => (
              <button
                key={opcion.value}
                onClick={() => setFiltroStock(opcion.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  filtroStock === opcion.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opcion.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Producto</th>
                <th className="p-4 text-center">Medida</th>
                <th className="p-4 text-center">Unidades Vendidas</th>
                <th className="p-4 text-right">Ingresos</th>
                <th className="p-4 text-center">Stock Físico</th>
                <th className="p-4 text-center">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {productosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-900">{p.nombre}</div>
                    <div className="text-xs text-gray-400">{p.categoria}</div>
                  </td>
                  <td className="p-4 text-center text-gray-600">{p.presentacion}</td>
                  <td className="p-4 text-center font-medium text-gray-700">{p.unidadesVendidas}</td>
                  <td className="p-4 text-right font-semibold text-gray-800">${p.ingresosGenerados.toFixed(2)}</td>
                  <td className="p-4 text-center font-medium text-gray-700">{p.stockActual} pzas</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      p.estadoStock === 'Suficiente' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      p.estadoStock === 'Bajo Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {p.estadoStock}
                    </span>
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No se encontraron productos con el filtro seleccionado.
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