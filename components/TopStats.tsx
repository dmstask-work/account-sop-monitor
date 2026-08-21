"use client";

import { formatIDR, formatNumber, formatPercent } from "@/lib/metrics";

interface TopStatsProps {
  totalRevenue: number;
  totalSessions: number;
  target: number;
  percentOfTarget: number;
  gapToTarget: number;
}

export default function TopStats({
  totalRevenue,
  totalSessions,
  target,
  percentOfTarget,
  gapToTarget,
}: TopStatsProps) {
  const progress = Math.min(100, percentOfTarget);
  const isOnTarget = percentOfTarget >= 100;
  const percentNeeded = isOnTarget ? 0 : Math.max(0, 100 - percentOfTarget);

  return (
    <section className="top-stats" aria-label="Ringkasan performa">
      <div className="card stat-hero">
        <div className="stat-hero-main">
          <div>
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value tnum">{formatIDR(totalRevenue)}</p>
          </div>
          <div className="stat-target">
            <span
              className={`badge ${isOnTarget ? "badge-success" : "badge-warning"}`}
            >
              {formatPercent(percentOfTarget)} vs target
            </span>
          </div>
        </div>

        <div className="stat-progress">
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="stat-progress-labels">
            <span className="tnum">{formatIDR(totalRevenue)}</span>
            <span className="tnum">Target: {formatIDR(target)}</span>
          </div>
        </div>
      </div>

      <div className="card stat-mini">
        <p className="stat-label">Gap to Target</p>
        <p className="stat-value tnum">{formatIDR(gapToTarget)}</p>
        <p className="stat-hint">
          {isOnTarget
            ? "Target tercapai 🎉"
            : `${formatPercent(percentNeeded)} needed to achieve target`}
        </p>
      </div>

      <div className="card stat-mini">
        <p className="stat-label">Total Sesi</p>
        <p className="stat-value tnum">{formatNumber(totalSessions)}</p>
        <p className="stat-hint">Semua sesi tercatat</p>
      </div>
    </section>
  );
}