"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarClock, CheckCheck, Home, Wallet } from "lucide-react";
import { useSupabaseUser } from "@/components/SessionProviderWrapper";
import { useNotifications, type NotificationRow } from "@/lib/use-notifications";

const ICONS: Record<NotificationRow["type"], typeof Bell> = {
  interesado: CalendarClock,
  renta_registrada: Wallet,
  propiedad_publicada: Home,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

/**
 * Campanita del navbar — notificaciones de "Mis propiedades": nuevos
 * interesados/agendaciones, rentas registradas (con la fecha de inicio) y
 * confirmación de que una propiedad ya quedó publicada. Ver
 * lib/notifications.ts (quién las crea) y lib/use-notifications.ts (cómo
 * las consume este componente).
 */
export function NotificationsBell() {
  const { status } = useSupabaseUser();
  const enabled = status === "authenticated";
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(enabled);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!enabled) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Notificaciones"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex text-on-surface-variant hover:text-primary transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] max-h-[28rem] overflow-y-auto bg-white rounded-lg shadow-soft border border-outline/10 z-50">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-outline/10 sticky top-0 bg-white">
            <span className="text-sm font-bold text-on-surface">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <CheckCheck size={13} /> Marcar todas
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-on-surface-variant text-center">
              Aún no tienes notificaciones — aquí verás cuando alguien se interese en tus propiedades publicadas o
              registres una renta.
            </p>
          ) : (
            <ul className="divide-y divide-outline/10">
              {notifications.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <Link
                      href={n.link ?? "/perfil/propiedades"}
                      onClick={() => {
                        setOpen(false);
                        if (!n.read) markRead(n.id);
                      }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-sahara-container/60 transition-colors ${
                        n.read ? "" : "bg-primary/5"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Icon size={14} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-bold text-on-surface">{n.title}</span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">{n.message}</span>
                        <span className="block text-[11px] text-on-surface-variant/70 mt-1">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
