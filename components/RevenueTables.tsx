"use client";

import { formatIDR, formatNumber, formatPercent } from "@/lib/metrics";
import type { SalesSummary, ServiceSummary } from "@/lib/types";

interface RevenueTablesProps {
  serviceBreakdown: ServiceSummary[];
  salesBreakdown: SalesSummary[];
  servicePercentVsLastMonth: number;
  salesPercentVsLastMonth: number;
}

function PercentCell({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span
      className={`tnum ${positive ? "text-success" : "text-danger"}`}
    >
      {positive ? "▲" : "▼"} {formatPercent(Math.abs(value))}
    </span>
  );
}

export default function RevenueTables({
  serviceBreakdown,
  salesBreakdown,
  servicePercentVsLastMonth,
  salesPercentVsLastMonth,
}: RevenueTablesProps) {
  return (
    <section className="revenue-tables" aria-label="Rincian revenue">
      <div className="tables-grid">
        <div className="card table-card">
          <div className="table-head">
            <h2>Revenue PE</h2>
            <p className="section-sub">
              <PercentCell value={servicePercentVsLastMonth} /> vs last month
            </p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Jenis Layanan</th>
                  <th className="num">Sesi</th>
                  <th className="num">Nominal</th>
                  <th className="num">% vs Last Month</th>
                </tr>
              </thead>
              <tbody>
                {serviceBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  serviceBreakdown.map((s) => (
                    <tr key={s.jenisLayanan}>
                      <td>{s.jenisLayanan}</td>
                      <td className="num tnum">{formatNumber(s.sessions)}</td>
                      <td className="num tnum">{formatIDR(s.revenue)}</td>
                      <td className="num">
                        <PercentCell value={s.percentVsLastMonth} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card table-card">
          <div className="table-head">
            <h2>Revenue TA SOP</h2>
            <p className="section-sub">
              <PercentCell value={salesPercentVsLastMonth} /> vs last month
            </p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nama Sales</th>
                  <th className="num">Sesi</th>
                  <th className="num">Nominal</th>
                  <th className="num">% vs Last Month</th>
                </tr>
              </thead>
              <tbody>
                {salesBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      Belum ada data.
                    </td>
                  </tr>
                ) : (
                  salesBreakdown.map((s) => (
                    <tr key={s.name}>
                      <td>{s.name}</td>
                      <td className="num tnum">{formatNumber(s.sessions)}</td>
                      <td className="num tnum">{formatIDR(s.revenue)}</td>
                      <td className="num">
                        <PercentCell value={s.percentVsLastMonth} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}