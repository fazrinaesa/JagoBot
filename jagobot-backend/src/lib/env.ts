/**
 * Normalisasi environment — HARUS diimpor paling awal.
 *
 * PrismaClient dibuat saat modul di-import, jadi perbaikan env di badan
 * server.ts sudah terlambat. Modul ini memuat .env lalu memastikan
 * DATABASE_URL memakai PostgreSQL, bukan MySQL yang ditulis template panel.
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// PORT yang disuntik panel harus menang atas nilai di .env.
const panelPort = process.env.PORT;

/**
 * Panel hosting menulis ulang .env dengan template lama setiap deploy
 * (MySQL + placeholder). File .env.production.local tidak dikelola panel,
 * jadi dimuat lebih dulu agar kredensial produksi tetap utuh.
 */
const prodEnvFile = path.join(__dirname, '../../.env.production.local');
if (fs.existsSync(prodEnvFile)) {
  dotenv.config({ path: prodEnvFile });
}
dotenv.config();

if (panelPort) process.env.PORT = panelPort;

const isMysql = (url?: string) => Boolean(url?.startsWith('mysql://'));

/**
 * Template .env panel menulis DATABASE_URL MySQL dan menghapus variabel lain
 * setiap deploy. File .pgurl (tidak dikelola panel) jadi sumber terakhir agar
 * koneksi PostgreSQL tidak hilang setelah redeploy.
 */
function readPgUrlFile(): string | undefined {
  try {
    const candidates = [
      path.join(__dirname, '../../.pgurl'),
      path.join(process.cwd(), '.pgurl'),
      path.join(process.cwd(), '../.pgurl'),
    ];
    for (const file of candidates) {
      if (fs.existsSync(file)) {
        const url = fs.readFileSync(file, 'utf8').trim();
        if (url.startsWith('postgres')) return url;
      }
    }
  } catch {
    // diamkan: fallback berikutnya tetap dipakai
  }
  return undefined;
}

if (isMysql(process.env.DATABASE_URL)) {
  const fallback =
    process.env.DATABASE_URL_PG ||
    process.env.POSTGRES_DATABASE_URL ||
    readPgUrlFile();
  if (fallback?.startsWith('postgres')) {
    process.env.DATABASE_URL = fallback;
  }
}

export const PORT = Number(process.env.PORT || 5000);
