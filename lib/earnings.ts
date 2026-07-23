/**
 * Calculadora de ganancias netas por renta.
 *
 * IMPORTANTE — esto NO es asesoría fiscal ni contable. Los porcentajes de
 * abajo son estimaciones configurables para darte una idea de cuánto te
 * queda después de comisiones e impuestos aproximados; confírmalos con tu
 * contador antes de tomarlos como cifra exacta para declarar. Nada aquí
 * retiene o declara impuestos de verdad ante el SAT — es solo para que veas
 * un estimado dentro del sitio.
 *
 * Solo aplica a RENTAS. Las VENTAS de casas no pasan por Stripe ni por
 * ninguna comisión — son solo catálogo, el trato se cierra en persona.
 */

export const EARNINGS_CONFIG = {
  /**
   * Comisión de Stripe para tarjetas nacionales mexicanas (MXN), cobrada por
   * transacción exitosa. Verificado en stripe.com/mx/pricing (jul 2026) —
   * confírmalo ahí de nuevo si pasa mucho tiempo, Stripe cambia sus tarifas
   * de vez en cuando.
   */
  stripePercentFee: 3.6,
  stripeFixedFeeMXN: 3.0,

  /**
   * La comisión de la plataforma (CO-WORK) sobre cada renta — la que se
   * configura directamente en Stripe (application fee) para que se quede
   * automáticamente con este porcentaje. Editable aquí libremente.
   */
  platformPercentFee: 2,

  /**
   * ESTIMADO de impuestos (ISR + IVA) sobre ingresos por renta de
   * alojamiento facilitada por una plataforma digital en México. Es un
   * número de referencia, no una tasa oficial fija — varía según el régimen
   * fiscal de cada propietario (persona física, RESICO, arrendamiento,
   * etc.). Ajusta este número si tu contador te da uno más preciso para tu
   * caso.
   */
  estimatedTaxPercent: 6,
} as const;

export interface EarningsBreakdown {
  grossAmount: number;
  stripeFeeAmount: number;
  platformFeeAmount: number;
  estimatedTaxAmount: number;
  netAmount: number;
}

/** Redondea a centavos, evitando errores de punto flotante feos como 99.99999999. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calcula el desglose de una renta a partir del monto bruto cobrado.
 * El resultado se guarda tal cual en RentalTransaction al momento de
 * registrar la renta, para que cambios futuros a EARNINGS_CONFIG no
 * reescriban el historial ya registrado.
 */
export function calculateRentalEarnings(grossAmount: number): EarningsBreakdown {
  const gross = Math.max(0, grossAmount);
  const stripeFeeAmount = round2((gross * EARNINGS_CONFIG.stripePercentFee) / 100 + EARNINGS_CONFIG.stripeFixedFeeMXN);
  const platformFeeAmount = round2((gross * EARNINGS_CONFIG.platformPercentFee) / 100);
  const estimatedTaxAmount = round2((gross * EARNINGS_CONFIG.estimatedTaxPercent) / 100);
  const netAmount = round2(gross - stripeFeeAmount - platformFeeAmount - estimatedTaxAmount);

  return {
    grossAmount: round2(gross),
    stripeFeeAmount,
    platformFeeAmount,
    estimatedTaxAmount,
    netAmount,
  };
}

export interface RentalTransactionLike {
  startDate: Date | string;
  // Los montos vienen de Prisma como instancias de Decimal (decimal.js), no
  // como number/string — se tipan como `unknown` a propósito y se convierten
  // con Number(...) adentro, que funciona igual para Decimal, string o
  // number.
  grossAmount: unknown;
  stripeFeeAmount: unknown;
  platformFeeAmount: unknown;
  estimatedTaxAmount: unknown;
  netAmount: unknown;
}

export interface MonthlyEarnings {
  /** "YYYY-MM" */
  month: string;
  label: string;
  rentalCount: number;
  grossAmount: number;
  stripeFeeAmount: number;
  platformFeeAmount: number;
  estimatedTaxAmount: number;
  netAmount: number;
}

const MONTH_LABELS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Agrupa transacciones de renta ya registradas por mes calendario (según startDate). */
export function groupEarningsByMonth(transactions: RentalTransactionLike[]): MonthlyEarnings[] {
  const byMonth = new Map<string, MonthlyEarnings>();

  for (const t of transactions) {
    const date = new Date(t.startDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = byMonth.get(month);
    const entry: MonthlyEarnings =
      existing ??
      {
        month,
        label: `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`,
        rentalCount: 0,
        grossAmount: 0,
        stripeFeeAmount: 0,
        platformFeeAmount: 0,
        estimatedTaxAmount: 0,
        netAmount: 0,
      };

    entry.rentalCount += 1;
    entry.grossAmount = round2(entry.grossAmount + Number(t.grossAmount));
    entry.stripeFeeAmount = round2(entry.stripeFeeAmount + Number(t.stripeFeeAmount));
    entry.platformFeeAmount = round2(entry.platformFeeAmount + Number(t.platformFeeAmount));
    entry.estimatedTaxAmount = round2(entry.estimatedTaxAmount + Number(t.estimatedTaxAmount));
    entry.netAmount = round2(entry.netAmount + Number(t.netAmount));

    byMonth.set(month, entry);
  }

  return Array.from(byMonth.values()).sort((a, b) => b.month.localeCompare(a.month));
}
