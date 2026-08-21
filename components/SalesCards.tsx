"use client";

import { formatIDR, formatNumber, formatPercent } from "@/lib/metrics";
import type { SalespersonSummary } from "@/lib/types";

interface SalesCardsProps {
  salespersons: SalespersonSummary[];
}

export default function SalesCards({ salespersons }: SalesCardsProps) {
  return (
    <section className="sales-cards" aria-label="Performa per sales">
      {/* <div className="section-head">
        <h2>Sales Performance</h2>
        <p className="section-sub">Performa per salesperson</p>
      </div> */}

      {salespersons.length === 0 ? (
        <p className="empty-state">Belum ada data sales untuk periode ini.</p>
      ) : (
        <div className="sales-grid">
          {salespersons.map((s) => {
            const progress = Math.min(100, s.percentOfTarget);
            const hasTarget = s.target > 0;
            const isOnTarget = hasTarget && s.percentOfTarget >= 100;
            return (
              <article key={s.name} className="card sales-card">
                <div className="sales-card-head">
                  <h3 className="sales-name">{s.name}</h3>
                  <span
                    className={`badge ${
                      !hasTarget
                        ? "badge-warning"
                        : isOnTarget
                          ? "badge-success"
                          : "badge-warning"
                    }`}
                  >
                    {hasTarget
                      ? formatPercent(s.percentOfTarget)
                      : "No target"}
                  </span>
                </div>

                <div className="sales-card-stats">
                  <div>
                    <p className="stat-label">Revenue</p>
                    <p className="stat-value tnum">{formatIDR(s.revenue)}</p>
                  </div>
                  <div>
                    <p className="stat-label">Sesi</p>
                    <p className="stat-value tnum">{formatNumber(s.sessions)}</p>
                  </div>
                </div>

                <div className="sales-card-progress">
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="sales-card-progress-labels">
                    <span className="tnum">
                      {hasTarget
                        ? `${formatIDR(s.revenue)} / ${formatIDR(s.target)}`
                        : formatIDR(s.revenue)}
                    </span>
                    {hasTarget && s.gapToTarget > 0 && (
                      <span className="tnum muted">
                        Gap: {formatIDR(s.gapToTarget)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}