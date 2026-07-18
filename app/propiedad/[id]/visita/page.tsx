"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Calendar as CalendarIcon,
  Send,
  MessageCircleQuestion,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SpecIcon } from "@/lib/spec-icon";
import { allProperties } from "@/data/mockProperties";
import { usePublishedProperties } from "@/lib/use-published-properties";
import { getAgentForProperty } from "@/lib/property-details";

const WEEKDAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

// Placeholder booking slots. There's no real-time availability backend yet,
// so we show a fixed daily schedule and deterministically "block" one slot
// per date so the UI reads as realistic. Swap this for real availability
// data once visits/reservations are tracked server-side.
const TIME_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:30 AM", "01:00 PM", "02:00 PM", "03:30 PM"];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatLongDate(date: Date): string {
  return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()].toLowerCase()} de ${date.getFullYear()}`;
}

interface CalendarCell {
  date: Date;
  inMonth: boolean;
}

function getMonthMatrix(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
  }
  return cells;
}

export default function ScheduleVisitPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { published } = usePublishedProperties();

  const property = [...published, ...allProperties].find((p) => p.id === params.id);
  const agent = property ? getAgentForProperty(property) : null;

  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [requesterName, setRequesterName] = useState(session?.user?.name ?? "");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [waUrl, setWaUrl] = useState<string | null>(null);

  if (!property || !agent) {
    return (
      <>
        <Navbar />
        <main className="w-full max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-on-surface mb-2">Propiedad no encontrada</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Puede que el enlace esté roto o que la propiedad ya no esté disponible.
          </p>
          <Link href="/" className="text-primary font-bold text-sm underline underline-offset-2">
            Volver al inicio
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const isVenta = property.type === "VENTA";
  const pageTitle = isVenta ? "Agendar una Visita" : "Reservar el Espacio";
  const pageSubtitle = isVenta
    ? "Elige una fecha y hora para conocer el espacio en persona."
    : "Elige una fecha y hora para reservar tu espacio.";
  const confirmLabel = isVenta ? "Confirmar Visita" : "Confirmar Reservación";
  const successTitle = isVenta ? "¡Visita agendada!" : "¡Reservación enviada!";
  const agentFirstName = agent.name.split(" ")[0];

  const unavailableIdx = hashString(`${property.id}-${dateKey(selectedDate)}`) % TIME_SLOTS.length;

  const cells = getMonthMatrix(viewMonth);
  const monthLabel = `${MONTH_LABELS[viewMonth.getMonth()]} ${viewMonth.getFullYear()}`;

  const goPrevMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () => setViewMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectDay = (cell: CalendarCell) => {
    if (cell.date < today) return;
    setSelectedDate(cell.date);
    setSelectedTime(null);
  };

  const canSubmit = requesterName.trim().length >= 2 && !!selectedTime && !loading;

  const handleConfirm = async () => {
    setError("");
    if (requesterName.trim().length < 2) {
      setError("Cuéntanos tu nombre para que el anfitrión sepa quién visita.");
      return;
    }
    if (!selectedTime) {
      setError("Selecciona un horario disponible.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/visit-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        type: isVenta ? "visita" : "reserva",
        requesterName: requesterName.trim(),
        requesterPhone: requesterPhone.trim(),
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        message: message.trim(),
        agentName: agent.name,
        agentPhone: agent.phone,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo enviar tu solicitud. Intenta de nuevo.");
      return;
    }

    const dayLabel = formatLongDate(selectedDate);
    let detail = isVenta
      ? `"${property.title}" desea ser vista. ${requesterName.trim()} agendó una visita para el ${dayLabel} a las ${selectedTime}.`
      : `"${property.title}" desea ser reservada. ${requesterName.trim()} solicitó reservarla para el ${dayLabel} a las ${selectedTime}.`;
    if (requesterPhone.trim()) detail += ` Tel. de contacto: ${requesterPhone.trim()}.`;
    if (message.trim()) detail += ` Tiene las siguientes dudas: "${message.trim()}"`;

    const text = encodeURIComponent(`Hola ${agentFirstName}, ${detail}`);
    const url = `https://wa.me/52${agent.phone}?text=${text}`;
    setWaUrl(url);
    setSuccess(true);
    if (typeof window !== "undefined") window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Navbar />
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/propiedad/${property.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Volver a detalles del espacio
        </Link>

        <div className="bg-white rounded-lg shadow-card overflow-hidden grid grid-cols-1 lg:grid-cols-5">
          {/* Property summary */}
          <div className="lg:col-span-2 bg-sahara-container/50 p-6 lg:border-r border-outline/10">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
              <Image
                alt={property.title}
                src={property.imageUrl}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
              <div className={`absolute top-3 left-3 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg ${isVenta ? "bg-on-surface" : "bg-primary"}`}>
                EN {property.type}
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-on-surface leading-snug">{property.title}</h2>
            <p className="text-sm text-on-surface-variant flex items-center gap-1.5 mt-1 mb-4">
              <MapPin size={14} /> {property.location}
            </p>

            <p className="text-2xl font-extrabold text-on-surface mb-4">
              {property.price}{" "}
              {property.priceSuffix && (
                <span className="text-sm font-bold text-on-surface-variant">{property.priceSuffix}</span>
              )}
            </p>

            {property.specs.length > 0 && (
              <div className="flex items-center gap-5 py-4 border-y border-outline/10 mb-4">
                {property.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-on-surface font-semibold text-sm">
                    <SpecIcon name={spec.icon} className="w-4 h-4 text-primary" />
                    {spec.label}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-sm">
                {agent.initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Anfitrión</p>
                <p className="font-bold text-on-surface text-sm truncate">{agent.name}</p>
              </div>
            </div>
          </div>

          {/* Booking form / success state */}
          <div className="lg:col-span-3 p-6 sm:p-8">
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h1 className="text-2xl font-extrabold text-on-surface mb-2">{successTitle}</h1>
                <p className="text-sm text-on-surface-variant max-w-sm mb-1">
                  Guardamos tu solicitud para <span className="font-bold text-on-surface">{property.title}</span> el{" "}
                  <span className="font-bold text-on-surface">{formatLongDate(selectedDate)}</span> a las{" "}
                  <span className="font-bold text-on-surface">{selectedTime}</span>.
                </p>
                <p className="text-sm text-on-surface-variant max-w-sm mb-6">
                  Le avisamos a {agentFirstName} por WhatsApp con todos tus datos. Si no se abrió automáticamente,
                  puedes enviarle el mensaje directamente.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {waUrl && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg py-3 px-6 transition-colors"
                    >
                      <Send size={16} /> Enviar mensaje por WhatsApp
                    </a>
                  )}
                  <Link
                    href={`/propiedad/${property.id}`}
                    className="text-sm font-bold text-primary underline underline-offset-2"
                  >
                    Volver a la propiedad
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-on-surface mb-1">{pageTitle}</h1>
                <p className="text-sm text-on-surface-variant mb-6">{pageSubtitle}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">Tu nombre</label>
                    <input
                      type="text"
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="¿Cómo te llamas?"
                      className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-1.5">
                      Tu teléfono <span className="font-normal text-on-surface-variant">(Opcional)</span>
                    </label>
                    <input
                      type="tel"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="10 dígitos"
                      className="w-full px-4 py-2.5 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-extrabold uppercase tracking-wider text-on-surface">{monthLabel}</p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={goPrevMonth}
                        aria-label="Mes anterior"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-sahara-container/60 hover:text-primary transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={goNextMonth}
                        aria-label="Mes siguiente"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-sahara-container/60 hover:text-primary transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {WEEKDAY_LABELS.map((label) => (
                      <div key={label} className="text-center text-[11px] font-bold text-on-surface-variant uppercase py-1">
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map((cell, idx) => {
                      const isPast = cell.date < today;
                      const isSelected = isSameDay(cell.date, selectedDate);
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isPast}
                          onClick={() => selectDay(cell)}
                          className={`aspect-square rounded-lg text-sm font-semibold transition-colors ${
                            isSelected
                              ? "bg-primary text-white font-extrabold"
                              : isPast
                              ? "text-on-surface-variant/30 cursor-not-allowed"
                              : !cell.inMonth
                              ? "text-on-surface-variant/40 hover:bg-sahara-container/60"
                              : "text-on-surface hover:bg-sahara-container/60"
                          }`}
                        >
                          {cell.date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-bold text-on-surface uppercase tracking-wider mb-3">Horarios Disponibles</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TIME_SLOTS.map((slot, idx) => {
                      const disabled = idx === unavailableIdx;
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={disabled}
                          onClick={() => setSelectedTime(slot)}
                          className={`px-2 py-2.5 rounded-lg border text-sm font-bold transition-colors ${
                            disabled
                              ? "border-outline/10 text-on-surface-variant/40 line-through cursor-not-allowed"
                              : isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-outline/20 text-on-surface hover:border-primary/50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface uppercase tracking-wider mb-2">
                    <MessageCircleQuestion size={15} className="text-primary" />
                    Mensaje para el anfitrión <span className="font-normal normal-case text-on-surface-variant">(Opcional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="¿Alguna pregunta o requerimiento especial?"
                    className="w-full px-4 py-3 rounded-lg border border-outline/20 bg-white focus:ring-2 focus:ring-primary outline-none text-sm resize-none"
                  />
                </div>

                {error && <p className="text-sm font-medium text-red-600 mb-4">{error}</p>}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline/10">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!canSubmit}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg py-3 px-6 transition-colors"
                  >
                    {loading ? "Enviando..." : confirmLabel} <CalendarIcon size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
