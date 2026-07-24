"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useSupabaseUser } from "@/components/SessionProviderWrapper";

interface LoginGateProps {
  children: ReactNode;
  /** Qué se está ocultando, en minúsculas y sin punto — p. ej. "el precio y la ubicación". */
  label: string;
  /**
   * "blur": el contenido real se sigue montando pero difuminado detrás del
   * candado — para cosas de baja sensibilidad (precio, ciudad/estado).
   * "replace": el contenido real NUNCA se monta sin sesión — para lo que sí
   * es sensible de verdad (teléfono del agente, coordenadas exactas del
   * mapa), así no queda ni en el DOM ni en las props del componente hijo.
   */
  mode?: "blur" | "replace";
  className?: string;
}

/**
 * Oculta información de una propiedad hasta que quien la ve inicie sesión —
 * es una barrera de UX/negocio (invitar a crear cuenta), no de seguridad de
 * datos: el catálogo público (/api/listings) sigue mandando todo al
 * navegador a propósito, para que el sitio se pueda explorar sin cuenta y
 * los buscadores lo indexen. Lo que cambia aquí es solo qué se le pinta en
 * pantalla a alguien sin sesión.
 */
export function LoginGate({ children, label, mode = "blur", className = "" }: LoginGateProps) {
  const { status } = useSupabaseUser();
  const pathname = usePathname();
  const authenticated = status === "authenticated";

  if (authenticated) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

  if (mode === "replace") {
    return (
      <div
        className={`rounded-lg bg-sahara-container/60 border border-dashed border-outline/25 p-4 flex flex-col items-center text-center gap-1.5 ${className}`}
      >
        <Lock size={16} className="text-primary" />
        <p className="text-xs font-semibold text-on-surface-variant">Inicia sesión para ver {label}</p>
        <Link href={loginHref} className="text-xs font-bold text-primary hover:underline">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/60 rounded-lg text-center px-3">
        <Lock size={16} className="text-primary" />
        <p className="text-xs font-bold text-on-surface">Inicia sesión para ver {label}</p>
        <Link href={loginHref} className="text-xs font-bold text-primary underline underline-offset-2">
          Iniciar sesión
        </Link>
      </div>
    </div>
  );
}
