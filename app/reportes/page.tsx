import React from 'react';
import Link from 'next/link';

// Definimos la estructura de las opciones de reportes
interface ReportOption {
  id: string;
  name: string;
  description: string;
  category: string;
  path: string;
  icon: string;
}

const REPORT_LIST: ReportOption[] = [
  { 
    id: '1', 
    name: 'Ingresos y Egresos', 
    description: 'Balance general financiero y flujos de caja', 
    category: 'Finanzas', 
    path: '/reportes/finanzas',
    icon: '💰' 
  },
  { 
    id: '2', 
    name: 'Ventas por Período', 
    description: 'Detalle de ventas diarias, mensuales y anuales', 
    category: 'Ventas', 
    path: '/reportes/ventas', 
    icon: '📈' 
  },
  { 
    id: '3', 
    name: 'Rendimiento de Productos', 
    description: 'Estadísticas de productos más vendidos y métricas', 
    category: 'Ventas', 
    path: '/reportes/productos', 
    icon: '📦' 
  },
  { 
    id: '4', 
    name: 'Actividad de Usuarios', 
    description: 'Análisis de registros, interacciones y bajas', 
    category: 'Clientes', 
    path: '/reportes/usuarios', 
    icon: '👥' 
  },
];

export default function ReportesPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Panel de Reportes</h1>
        <p className="text-gray-600">Selecciona una categoría para visualizar los datos analíticos y exportar métricas.</p>
      </header>

      {/* Grid options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {REPORT_LIST.map((reporte) => (
          <Link 
            key={reporte.id} 
            href={reporte.path}
            className="group block p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <span className="text-3xl p-3 bg-gray-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                {reporte.icon}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {reporte.name}
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {reporte.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {reporte.description}
                </p>
                <div className="mt-4 text-xs font-medium text-blue-600 flex items-center group-hover:underline">
                  Ver reporte →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}