import type {
  DashboardMetrics,
  DateRange,
  SalesRow,
  SalespersonSummary,
  SalesSummary,
  ServiceSummary,
} from "./types";
import { parseDate } from "./parse";

/** Format a number as Indonesian Rupiah. */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format a plain number with thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Format a percentage with one decimal. */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/** Normalize a salesperson name for grouping (case-insensitive, trim). */
function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

/** Get the date key (YYYY-MM-DD) for a row's date. */
function dateKey(row: SalesRow): string | null {
  const d = parseDate(row.tanggal);
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Check if a row's date falls within an inclusive date range. */
function inRange(row: SalesRow, range: DateRange | null): boolean {
  if (!range) return true;
  const key = dateKey(row);
  if (!key) return false;
  return key >= range.start && key <= range.end;
}

/** Shift a date range back by one month (month-to-date comparison). */
function shiftRangeBackOneMonth(range: DateRange): DateRange {
  const [sy, sm, sd] = range.start.split("-").map(Number);
  const [ey, em, ed] = range.end.split("-").map(Number);

  const startDate = new Date(sy, sm - 2, sd);
  const endDate = new Date(ey, em - 2, ed);

  // Clamp end to the last valid day of the previous month
  const lastDayPrevMonth = new Date(ey, em - 1, 0).getDate();
  const clampedEndDay = Math.min(ed, lastDayPrevMonth);
  const clampedEnd = new Date(ey, em - 2, clampedEndDay);

  const fmt = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  return { start: fmt(startDate), end: fmt(clampedEnd) };
}

/**
 * Compute all dashboard metrics from the raw rows.
 * @param rows All sales rows (cumulative).
 * @param target The revenue target for the selected period.
 * @param dateRange The selected date range (inclusive), or null for all.
 * @param salesTargets Optional per-salesperson targets.
 */
export function computeMetrics(
  rows: SalesRow[],
  target: number,
  dateRange: DateRange | null,
  salesTargets: Record<string, number> = {}
): DashboardMetrics {
  // Filter rows to the selected date range
  const rangeRows = rows.filter((r) => inRange(r, dateRange));

  // All rows (for "vs last month" comparison)
  const allRows = rows;

  // ── Totals ────────────────────────────────────────────────
  const totalRevenue = rangeRows.reduce((sum, r) => sum + r.nominal, 0);
  const totalSessions = rangeRows.reduce((sum, r) => sum + r.sesi, 0);
  const percentOfTarget = target > 0 ? (totalRevenue / target) * 100 : 0;
  const gapToTarget = Math.max(0, target - totalRevenue);

  // ── Per-salesperson ───────────────────────────────────────
  const salesMap = new Map<string, { revenue: number; sessions: number }>();
  for (const r of rangeRows) {
    const name = normalizeName(r.namaSales);
    if (!name) continue;
    const cur = salesMap.get(name) ?? { revenue: 0, sessions: 0 };
    cur.revenue += r.nominal;
    cur.sessions += r.sesi;
    salesMap.set(name, cur);
  }

  const salespersons: SalespersonSummary[] = Array.from(salesMap.entries())
    .map(([name, { revenue, sessions }]) => {
      const t = salesTargets[name] ?? 0;
      return {
        name,
        revenue,
        sessions,
        target: t,
        percentOfTarget: t > 0 ? (revenue / t) * 100 : 0,
        gapToTarget: Math.max(0, t - revenue),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // ── Revenue PE (by Jenis Layanan — only HADIR, WP, MHCU FOR COMPANY) ──
  const PE_SERVICES = ["HADIR", "WP", "MHCU FOR COMPANY"];
  const serviceMap = new Map<string, { revenue: number; sessions: number }>();
  for (const r of rangeRows) {
    const raw = r.jenisLayanan || "";
    const key = raw.trim().toUpperCase();
    if (!PE_SERVICES.includes(key)) continue;
    const cur = serviceMap.get(key) ?? { revenue: 0, sessions: 0 };
    cur.revenue += r.nominal;
    cur.sessions += r.sesi;
    serviceMap.set(key, cur);
  }

  const serviceBreakdown: ServiceSummary[] = Array.from(serviceMap.entries())
    .map(([jenisLayanan, { revenue, sessions }]) => ({
      jenisLayanan,
      revenue,
      sessions,
      percentVsLastMonth: computeVsLastMonth(
        allRows,
        jenisLayanan,
        "service",
        dateRange
      ),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Revenue TA SOP (by Nama Sales — excluding GDC & MS DHEA) ──
  // Only TA and MP transactions (by Detail Produk) count toward this table.
  const EXCLUDED_SALES = ["GDC", "MS DHEA", "B2B", "MS KEKE"];
  const TA_SOP_DETAILS = new Set(["TA", "MP"]);
  const taSalesMap = new Map<string, { revenue: number; sessions: number }>();
  for (const r of rangeRows) {
    if (!TA_SOP_DETAILS.has((r.detailProduk || "").trim().toUpperCase())) continue;
    const name = normalizeName(r.namaSales);
    if (!name) continue;
    const cur = taSalesMap.get(name) ?? { revenue: 0, sessions: 0 };
    cur.revenue += r.nominal;
    cur.sessions += r.sesi;
    taSalesMap.set(name, cur);
  }

  const salesBreakdown: SalesSummary[] = Array.from(taSalesMap.entries())
    .filter(([name]) => !EXCLUDED_SALES.includes(name))
    .map(([name, { revenue, sessions }]) => ({
      name,
      revenue,
      sessions,
      percentVsLastMonth: computeVsLastMonth(
        allRows,
        name,
        "sales",
        dateRange
      ),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Aggregate % vs last month for each table ─────────────
  const servicePercentVsLastMonth = computeAggregateVsLastMonth(
    allRows,
    dateRange,
    (r) => PE_SERVICES.includes((r.jenisLayanan || "").trim().toUpperCase())
  );

  // Revenue PE total excludes MHCU FOR COMPANY
  const serviceTotalPercentVsLastMonth = computeAggregateVsLastMonth(
    allRows,
    dateRange,
    (r) => {
      const svc = (r.jenisLayanan || "").trim().toUpperCase();
      return svc === "HADIR" || svc === "WP";
    }
  );

  const salesPercentVsLastMonth = computeAggregateVsLastMonth(
    allRows,
    dateRange,
    (r) =>
      TA_SOP_DETAILS.has((r.detailProduk || "").trim().toUpperCase()) &&
      !EXCLUDED_SALES.includes(normalizeName(r.namaSales))
  );

  return {
    totalRevenue,
    totalSessions,
    target,
    percentOfTarget,
    gapToTarget,
    salespersons,
    serviceBreakdown,
    salesBreakdown,
    servicePercentVsLastMonth,
    serviceTotalPercentVsLastMonth,
    salesPercentVsLastMonth,
    lastUpdated: new Date().toLocaleString("id-ID"),
  };
}

/**
 * Compute aggregate % change vs the same day-range last month
 * across the rows that pass the given filter.
 */
function computeAggregateVsLastMonth(
  rows: SalesRow[],
  dateRange: DateRange | null,
  filter: (r: SalesRow) => boolean
): number {
  if (!dateRange) return 0;
  const prevRange = shiftRangeBackOneMonth(dateRange);

  const currentRevenue = rows
    .filter((r) => inRange(r, dateRange) && filter(r))
    .reduce((sum, r) => sum + r.nominal, 0);

  const prevRevenue = rows
    .filter((r) => inRange(r, prevRange) && filter(r))
    .reduce((sum, r) => sum + r.nominal, 0);

  if (prevRevenue === 0) return currentRevenue > 0 ? 100 : 0;
  return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
}

/**
 * Compute % change vs the same day-range in the previous month.
 * @param rows All rows.
 * @param key The group key (service name or salesperson name).
 * @param type "service" or "sales".
 * @param dateRange The selected date range, or null for all-time.
 */
function computeVsLastMonth(
  rows: SalesRow[],
  key: string,
  type: "service" | "sales",
  dateRange: DateRange | null
): number {
  if (!dateRange) return 0;

  const prevRange = shiftRangeBackOneMonth(dateRange);

  const currentRevenue = rows
    .filter((r) => {
      if (!inRange(r, dateRange)) return false;
      return type === "service"
        ? (r.jenisLayanan || "").trim().toUpperCase() === key
        : normalizeName(r.namaSales) === key;
    })
    .reduce((sum, r) => sum + r.nominal, 0);

  const prevRevenue = rows
    .filter((r) => {
      if (!inRange(r, prevRange)) return false;
      return type === "service"
        ? (r.jenisLayanan || "").trim().toUpperCase() === key
        : normalizeName(r.namaSales) === key;
    })
    .reduce((sum, r) => sum + r.nominal, 0);

  if (prevRevenue === 0) return currentRevenue > 0 ? 100 : 0;
  return ((currentRevenue - prevRevenue) / prevRevenue) * 100;
}