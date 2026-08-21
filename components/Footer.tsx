"use client";

interface FooterProps {
  lastUpdated: string;
}

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>© 2026 PT Bhakti Manusia Indonesia</p>
        <p className="footer-updated">
          Last update: <span className="tnum">{lastUpdated}</span>
        </p>
      </div>
    </footer>
  );
}