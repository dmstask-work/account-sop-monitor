"use client";

import { useState } from "react";

interface TargetModalProps {
  open: boolean;
  globalTarget: number;
  salesTargets: Record<string, number>;
  salesNames: string[];
  onClose: () => void;
  onSave: (globalTarget: number, salesTargets: Record<string, number>) => void;
}

/** Insert a comma every 3 digits as the user types. */
function formatWithCommas(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function TargetModal({
  open,
  globalTarget,
  salesTargets,
  salesNames,
  onClose,
  onSave,
}: TargetModalProps) {
  const [global, setGlobal] = useState(
    formatWithCommas(String(globalTarget || ""))
  );
  const [perSales, setPerSales] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const name of salesNames) {
      init[name] = salesTargets[name] ? formatWithCommas(String(salesTargets[name])) : "";
    }
    return init;
  });

  if (!open) return null;

  const handleSave = () => {
    const g = Number(global.replace(/[^\d]/g, "")) || 0;
    const per: Record<string, number> = {};
    for (const name of salesNames) {
      const v = Number(perSales[name]?.replace(/[^\d]/g, "")) || 0;
      if (v > 0) per[name] = v;
    }
    onSave(g, per);
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="target-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="target-modal-title">Set Revenue Targets</h2>
          <button
            type="button"
            className="btn-icon"
            aria-label="Close"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="global-target">Global Revenue Target (Rp)</label>
            <input
              id="global-target"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 320,000,000"
              value={global}
              onChange={(e) => setGlobal(formatWithCommas(e.target.value))}
            />
          </div>

          {salesNames.length > 0 && (
            <div className="modal-sales-targets">
              <p className="modal-sub">Per-salesperson targets (optional)</p>
              {salesNames.map((name) => (
                <div key={name} className="field">
                  <label htmlFor={`target-${name}`}>{name}</label>
                  <input
                    id={`target-${name}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="Rp"
                    value={perSales[name] ?? ""}
                    onChange={(e) =>
                      setPerSales((prev) => ({
                        ...prev,
                        [name]: formatWithCommas(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            Save Targets
          </button>
        </div>
      </div>
    </div>
  );
}