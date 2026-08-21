import Papa from "papaparse";
import type { SalesRow } from "./types";

/**
 * Parse a nominal value like "Rp69,000" or "69.000" or "69000" into a number.
 */
export function parseNominal(value: string | number): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  // Remove "Rp", spaces, and thousands separators (both , and .)
  const cleaned = value
    .replace(/Rp/gi, "")
    .replace(/\s/g, "")
    .replace(/,/g, "")
    .replace(/\./g, "");
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a date string like "1/2/2026" or "2026-02-01" into a Date.
 * Returns null if unparseable.
 */
export function parseDate(value: string): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Try ISO format first (YYYY-MM-DD)
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(trimmed);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // Try M/D/YYYY or D/M/YYYY (Google Sheets US locale default is M/D/YYYY)
  const slash = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(trimmed);
  if (slash) {
    const [, a, b, y] = slash;
    // Assume M/D/YYYY (US locale, Google Sheets default)
    return new Date(Number(y), Number(a) - 1, Number(b));
  }

  return null;
}

/**
 * Normalize a raw CSV row (object keyed by header) into a SalesRow.
 */
export function normalizeRow(raw: Record<string, string>): SalesRow {
  const get = (...keys: string[]): string => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null) return String(raw[k]).trim();
    }
    return "";
  };

  return {
    detailProduk: get("Detail Produk", "detailProduk"),
    tanggal: get("Tanggal", "tanggal"),
    namaKlien: get("Nama Klien", "namaKlien"),
    sesi: Number(get("Sesi", "sesi")) || 0,
    emailProduk: get("Email/Produk", "emailProduk"),
    nominal: parseNominal(get("Nominal", "nominal")),
    namaSales: get("Nama Sales", "namaSales"),
    kategori: get("KATEGORI", "kategori"),
    jenisProduk: get("Jenis Produk", "jenisProduk"),
    status: get("Status", "status"),
    jenisLayanan: get("Jenis Layanan", "jenisLayanan"),
    kategori2: get("Kategori", "kategori2"),
  };
}

/**
 * Fetch and parse the Google Sheet CSV.
 * Falls back to sample data on failure.
 */
export async function fetchSheetData(
  url: string | undefined,
  fallback: SalesRow[]
): Promise<SalesRow[]> {
  if (!url) return fallback;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const result = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (result.errors.length > 0 && result.data.length === 0) {
      throw new Error("CSV parse failed");
    }
    const rows = result.data
      .map(normalizeRow)
      .filter((r: SalesRow) => r.nominal > 0);
    if (rows.length === 0) throw new Error("No valid rows");
    return rows;
  } catch (err) {
    console.warn("Sheet fetch failed, using sample data:", err);
    return fallback;
  }
}