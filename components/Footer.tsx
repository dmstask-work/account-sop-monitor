"use client";

import { useEffect, useState } from "react";

interface FooterProps {
  lastUpdated: string;
}

export default function Footer({ lastUpdated }: FooterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© 2026 PT Bhakti Manusia Indonesia</p>
        <p className="footer-updated">
          Last update:{" "}
          <span className="tnum">{mounted ? lastUpdated : "—"}</span>
        </p>
      </div>
    </footer>
  );
}