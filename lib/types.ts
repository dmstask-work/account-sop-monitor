export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

export interface SalesRow {
  detailProduk: string;
  tanggal: string;
  namaKlien: string;
  sesi: number;
  emailProduk: string;
  nominal: number;
  namaSales: string;
  kategori: string;
  jenisProduk: string;
  status: string;
  jenisLayanan: string;
  kategori2: string;
}

export interface SalespersonSummary {
  name: string;
  revenue: number;
  sessions: number;
  target: number;
  percentOfTarget: number;
  gapToTarget: number;
}

export interface ServiceSummary {
  jenisLayanan: string;
  revenue: number;
  sessions: number;
  percentVsLastMonth: number;
}

export interface SalesSummary {
  name: string;
  revenue: number;
  sessions: number;
  percentVsLastMonth: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalSessions: number;
  target: number;
  percentOfTarget: number;
  gapToTarget: number;
  salespersons: SalespersonSummary[];
  serviceBreakdown: ServiceSummary[];
  salesBreakdown: SalesSummary[];
  servicePercentVsLastMonth: number;
  serviceTotalPercentVsLastMonth: number;
  salesPercentVsLastMonth: number;
  lastUpdated: string;
}
