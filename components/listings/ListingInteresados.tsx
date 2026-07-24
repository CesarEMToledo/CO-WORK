"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import type { VisitRequestRow } from "./types";

const STATUS_LABELS: Record<VisitRequestRow["status"], string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<VisitRequestRow["status"], string> = {
  pending: "bg-warning-container text-on-warning-container",
  contacted: "bg-primary-container text-on-primary-container",
  confirmed: "bg-success-container text-on-success-container",
  cancelled: "bg-error-container text-on-error-container",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

/** Gente que agendó una visita o reserva desde la página pública de esta propiedad. */
export function ListingInteresados({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interesados, setInteresados] = useState<VisitRequestRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/listings/${listingId}/interesados`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.interesados) setInteresados(data.interesados);
        else setError(data.error || "No se pudieron cargar los interesados.");
      })
      .catch(() => !cancelled && setError("No se pudieron cargar los interesados — revisa tu conexión."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-on-surface-variant py-6 justify-center">
        <Loader2 size={16} className="animate-spin" /> Cargando interesados...
      </div>
    );
  }

  if (error) return <p className="text-sm font-medium text-red-600 py-4">{error}</p>;

  if (interesados.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant py-4 text-center">
        Nadie ha agendado una visita o reserva para esta propiedad todavía.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {interesados.map((i) => (
        <div key={i.id} className="bg-white rounded-lg border border-outline/15 p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="font-bold text-on-surface text-sm">{i.requesterName}</p>
              <p className="text-xs text-on-surface-variant">
                {i.type === "visita" ? "Visita" : "Reserva"} · {formatDate(i.visitDate)} · {i.visitTime}
              </p>
            </div>
            <span className={`shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-lg ${STATUS_STYLES[i.status]}`}>
              {STATUS_LABELS[i.status]}
            </span>
          </div>
          {i.message && <p className="text-xs text-on-surface-variant mb-2">"{i.message}"</p>}
          <div className="flex items-center gap-3 text-xs">
            {i.requesterPhone && (
              <a
                href={`https://wa.me/52${i.requesterPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <MessageCircle size={13} /> WhatsApp
              </a>
            )}
            {i.requesterPhone && (
              <a href={`tel:${i.requesterPhone}`} className="flex items-center gap-1 font-semibold text-on-surface-variant hover:text-primary">
                <Phone size={13} /> {i.requesterPhone}
              </a>
            )}
            {i.requesterEmail && (
              <a href={`mailto:${i.requesterEmail}`} className="flex items-center gap-1 font-semibold text-on-surface-variant hover:text-primary">
                <Mail size={13} /> {i.requesterEmail}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
