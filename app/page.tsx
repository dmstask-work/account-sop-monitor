"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import Header from "@/components/Header";
import TopStats from "@/components/TopStats";
import SalesCards from "@/components/SalesCards";
import RevenueTables from "@/components/RevenueTables";
import TargetModal from "@/components/TargetModal";
import Footer from "@/components/Footer";
import { SAMPLE_ROWS } from "@/lib/sampleData";
import { fetchSheetData } from "@/lib/parse";
import { computeMetrics } from "@/lib/metrics";
import type { DateRange, SalesRow } from "@/lib/types";

const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_CSV_URL;

const TARGET_STORAGE_KEY = "sop-dashboard-target";
const SALES_TARGETS_KEY = "sop-dashboard-sales-targets";

const DEFAULT_GLOBAL_TARGET = 320000000;

const DEFAULT_SALES_TARGETS: Record<string, number> = {
  "MS DHEA": 60000000,
  GDC: 50000000,
  "MS NUR": 25000000,
  "MS KEKE": 25000000,
  "MS AYU": 35000000,
  "MS SHINTA": 35000000,
  "MS ARINA": 35000000,
  "MS YUYUN": 35000000,
  "MS PRILLY": 0,
  B2B: 0,
};

/** Format a Date as YYYY-MM-DD. */
function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Build a month-to-date range: 1st of current month → today. */
function currentMonthToDate(): DateRange {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { start: fmtDate(start), end: fmtDate(today) };
}

export default function DashboardPage() {
  const [rows, setRows] = useState<SalesRow[]>(SAMPLE_ROWS);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | null>(
    currentMonthToDate
  );
  const [target, setTarget] = useState<number>(DEFAULT_GLOBAL_TARGET);
  const [salesTargets, setSalesTargets] =
    useState<Record<string, number>>(DEFAULT_SALES_TARGETS);
  const [modalOpen, setModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load targets from localStorage (fall back to defaults if empty)
  useEffect(() => {
    try {
      const t = localStorage.getItem(TARGET_STORAGE_KEY);
      if (t !== null) setTarget(Number(t) || 0);
      else setTarget(DEFAULT_GLOBAL_TARGET);
      const st = localStorage.getItem(SALES_TARGETS_KEY);
      if (st !== null) setSalesTargets(JSON.parse(st));
      else setSalesTargets(DEFAULT_SALES_TARGETS);
    } catch {
      // ignore
    }
  }, []);

  // Fetch live data
  useEffect(() => {
    let cancelled = false;
    fetchSheetData(SHEET_URL, SAMPLE_ROWS).then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(
    () => computeMetrics(rows, target, dateRange, salesTargets),
    [rows, target, dateRange, salesTargets]
  );

  const salesNames = useMemo(
    () => metrics.salespersons.map((s) => s.name),
    [metrics.salespersons]
  );

  const handleSaveTargets = useCallback(
    (global: number, per: Record<string, number>) => {
      setTarget(global);
      setSalesTargets(per);
      try {
        localStorage.setItem(TARGET_STORAGE_KEY, String(global));
        localStorage.setItem(SALES_TARGETS_KEY, JSON.stringify(per));
      } catch {
        // ignore
      }
      setModalOpen(false);
    },
    []
  );

  const handleCapture = useCallback(async () => {
    if (!dashboardRef.current) return;
    setIsCapturing(true);
    try {
      const blob = await toBlob(dashboardRef.current, {
        pixelRatio: 2,
        backgroundColor: "oklch(97% 0.012 240)",
      });
      if (!blob) throw new Error("Failed to render image");

      // Copy the image to the clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
    } catch (err) {
      console.error("Copy failed:", err);
      // Fallback: download the image so the user still gets it
      try {
        const dataUrl = await toBlob(dashboardRef.current, {
          pixelRatio: 2,
          backgroundColor: "oklch(97% 0.012 240)",
        });
        if (dataUrl) {
          const link = document.createElement("a");
          link.download = `sales-performance-${new Date()
            .toISOString()
            .slice(0, 10)}.png`;
          link.href = URL.createObjectURL(dataUrl);
          link.click();
          URL.revokeObjectURL(link.href);
        }
      } catch {
        // ignore fallback failure
      }
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return (
    <div className="page" ref={dashboardRef}>
      <Header
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onAddTarget={() => setModalOpen(true)}
        onCapture={handleCapture}
        isCapturing={isCapturing}
      />

      <main className="container main">
        {loading ? (
          <div className="loading" role="status">
            <span className="spinner" aria-hidden="true" />
            Memuat data…
          </div>
        ) : (
          <>
            <TopStats
              totalRevenue={metrics.totalRevenue}
              totalSessions={metrics.totalSessions}
              target={metrics.target}
              percentOfTarget={metrics.percentOfTarget}
              gapToTarget={metrics.gapToTarget}
            />

            <SalesCards salespersons={metrics.salespersons} />

            <RevenueTables
              serviceBreakdown={metrics.serviceBreakdown}
              salesBreakdown={metrics.salesBreakdown}
              servicePercentVsLastMonth={metrics.servicePercentVsLastMonth}
              serviceTotalPercentVsLastMonth={
                metrics.serviceTotalPercentVsLastMonth
              }
              salesPercentVsLastMonth={metrics.salesPercentVsLastMonth}
            />
          </>
        )}
      </main>

      <Footer lastUpdated={metrics.lastUpdated} />

      <TargetModal
        open={modalOpen}
        globalTarget={target}
        salesTargets={salesTargets}
        salesNames={salesNames}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTargets}
      />
    </div>
  );
}