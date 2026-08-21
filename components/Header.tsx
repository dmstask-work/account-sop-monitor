"use client";

import Image from "next/image";
import sopLogo from "@/assets/SOP.png";
import type { DateRange } from "@/lib/types";

interface HeaderProps {
  dateRange: DateRange | null;
  onDateRangeChange: (range: DateRange | null) => void;
  onAddTarget: () => void;
  onCapture: () => void;
  isCapturing: boolean;
}

export default function Header({
  dateRange,
  onDateRangeChange,
  onAddTarget,
  onCapture,
  isCapturing,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="container header-inner">
        {/* Left: logo + title */}
        <div className="header-left">
          <div className="logo">
            <Image
              src={sopLogo}
              alt="SOP Logo"
              width={40}
              height={40}
              className="logo-img"
              priority
            />
          </div>
          <div className="header-title">
            <h1>Sales Performance Report</h1>
            <p className="header-sub">PT Bhakti Manusia Indonesia</p>
          </div>
        </div>

        {/* Right: date range filter + actions */}
        <div className="header-right">
          <div className="date-range">
            <div className="field">
              <label htmlFor="date-start" className="sr-only">
                Start date
              </label>
              <input
                id="date-start"
                type="date"
                className="date-input"
                value={dateRange?.start ?? ""}
                onChange={(e) => {
                  const start = e.target.value;
                  if (!start) {
                    onDateRangeChange(null);
                    return;
                  }
                  onDateRangeChange({
                    start,
                    end: dateRange?.end && dateRange.end >= start ? dateRange.end : start,
                  });
                }}
              />
            </div>
            <span className="date-range-sep" aria-hidden="true">
              -
            </span>
            <div className="field">
              <label htmlFor="date-end" className="sr-only">
                End date
              </label>
              <input
                id="date-end"
                type="date"
                className="date-input"
                value={dateRange?.end ?? ""}
                min={dateRange?.start}
                onChange={(e) => {
                  const end = e.target.value;
                  if (!end) {
                    onDateRangeChange(null);
                    return;
                  }
                  onDateRangeChange({
                    start: dateRange?.start && dateRange.start <= end ? dateRange.start : end,
                    end,
                  });
                }}
              />
            </div>
          </div>

          {dateRange && (
            <button
              type="button"
              className="btn btn-clear"
              onClick={() => onDateRangeChange(null)}
            >
              Semua
            </button>
          )}

          <button type="button" className="btn" onClick={onAddTarget}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Target
          </button>

          <button
            type="button"
            className="btn"
            onClick={onCapture}
            disabled={isCapturing}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {isCapturing ? "Capturing…" : "Capture"}
          </button>
        </div>
      </div>
    </header>
  );
}