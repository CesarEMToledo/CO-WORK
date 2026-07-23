"use client";

import { useEffect, useMemo, useState } from "react";
import { ESTADOS, getMunicipios } from "@/data/mexico-geo";

const OTRO = "__otro__";

interface EstadoMunicipioFieldsProps {
  estado: string;
  municipio: string;
  onEstadoChange: (estado: string) => void;
  onMunicipioChange: (municipio: string) => void;
  /** "md" (formulario de publicar) o "sm" (formulario de edición, más compacto). */
  size?: "sm" | "md";
}

const INPUT_CLASSES: Record<"sm" | "md", string> = {
  sm: "w-full px-3 py-2 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none",
  md: "w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white text-sm focus:ring-2 focus:ring-primary outline-none",
};

/**
 * Selects en cascada Estado -> Municipio — antes el municipio era texto
 * libre, lo que dejaba pasar errores de dedo (y nombres que no correspondían
 * a ningún lugar real). Al elegir el estado primero, la lista de municipios
 * que se muestra es solo la de ese estado (no los ~2,500 municipios del
 * país juntos).
 *
 * Si el municipio no está en el catálogo (una localidad muy chica que no
 * quedó en la lista, o algo que trajo el GPS y no hizo match exacto), se cae
 * a un campo de texto libre bajo la opción "Otro" — nunca se bloquea ni se
 * borra lo que la persona ya escribió o lo que trajo el GPS.
 */
export function EstadoMunicipioFields({
  estado,
  municipio,
  onEstadoChange,
  onMunicipioChange,
  size = "md",
}: EstadoMunicipioFieldsProps) {
  const municipios = useMemo(() => getMunicipios(estado), [estado]);
  const [useOtro, setUseOtro] = useState(() => municipio !== "" && !municipios.includes(municipio));

  // Si cambia el estado (a mano o porque el GPS lo adivinó), o si llega un
  // municipio prellenado desde fuera (GPS), reevaluamos si el municipio
  // actual sigue estando en la lista de ese estado.
  useEffect(() => {
    setUseOtro(municipio !== "" && !municipios.includes(municipio));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, municipio]);

  const inputClass = INPUT_CLASSES[size];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Estado *</label>
        <select
          value={estado}
          onChange={(e) => {
            onEstadoChange(e.target.value);
            onMunicipioChange("");
          }}
          className={inputClass}
        >
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Municipio *</label>
        {useOtro ? (
          <div className="space-y-1">
            <input
              value={municipio}
              onChange={(e) => onMunicipioChange(e.target.value)}
              placeholder="Escribe el municipio"
              className={inputClass}
            />
            {municipios.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onMunicipioChange("");
                  setUseOtro(false);
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Elegir de la lista
              </button>
            )}
          </div>
        ) : (
          <select
            value={municipio}
            onChange={(e) => {
              if (e.target.value === OTRO) {
                onMunicipioChange("");
                setUseOtro(true);
              } else {
                onMunicipioChange(e.target.value);
              }
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Selecciona...
            </option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            <option value={OTRO}>Otro (no aparece en la lista)</option>
          </select>
        )}
      </div>
    </div>
  );
}
