/**
 * Normalisasi environment — HARUS diimpor paling awal.
 *
 * PrismaClient dibuat saat modul di-import, jadi perbaikan env di badan
 * server.ts sudah terlambat. Modul ini memuat .env lalu memastikan
 * DATABASE_URL memakai PostgreSQL, bukan MySQL yang ditulis template panel.
 */
import dotenv from 'dotenv';

// PORT yang disuntik panel harus menang atas nilai di .env.
const panelPort = process.env.PORT;

dotenv.config();

if (panelPort) process.env.PORT = panelPort;

const isMysql = (url?: string) => Boolean(url?.startsWith('mysql://'));

if (isMysql(process.env.DATABASE_URL)) {
  const fallback = process.env.DATABASE_URL_PG || process.env.POSTGRES_DATABASE_URL;
  if (fallback?.startsWith('postgres')) {
    process.env.DATABASE_URL = fallback;
  }
}

export const PORT = Number(process.env.PORT || 5000);
