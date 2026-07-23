import type { Property } from "@/data/mockProperties";

/** Lo que regresa GET /api/listings/mine — el shape público Property más los campos que solo el dueño necesita. */
export interface OwnedListing extends Property {
  estado: string;
  municipio: string;
  localidad: string | null;
  calle: string;
  numero: string | null;
  colonia: string | null;
  interesadosCount: number;
  rentalCount: number;
  totalNetEarnings: number;
}

export interface VisitRequestRow {
  id: string;
  type: "visita" | "reserva";
  requesterName: string;
  requesterPhone: string | null;
  requesterEmail: string | null;
  visitDate: string;
  visitTime: string;
  message: string | null;
  status: "pending" | "contacted" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface RentalTransactionRow {
  id: string;
  startDate: string;
  endDate: string;
  guestName: string | null;
  notes: string | null;
  grossAmount: string;
  stripeFeeAmount: string;
  platformFeeAmount: string;
  estimatedTaxAmount: string;
  netAmount: string;
  createdAt: string;
}

export interface MonthlyEarningsRow {
  month: string;
  label: string;
  rentalCount: number;
  grossAmount: number;
  stripeFeeAmount: number;
  platformFeeAmount: number;
  estimatedTaxAmount: number;
  netAmount: number;
}
