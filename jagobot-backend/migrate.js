/**
 * JagoBot — Migrasi data Supabase -> PostgreSQL lokal
 *  - BACA dari Supabase REST API (service key)  → read-only, tidak mengubah apa pun
 *  - TULIS ke localhost:5433 (database jagobot)
 * Jalankan:  node migrate.js
 */
require('dotenv').config({ quiet: true });
const { Client } = require('pg');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

const LOCAL = {
  host: 'localhost', port: 5433,
  user: 'postgres', password: 'postgres', database: 'jagobot',
};

// urutan penting (parent dulu, agar foreign key valid)
const TABLES = [
  'User',
  'Bot',
  'KnowledgeBase',
  'DocumentChunk',
  'ChatLog',
  'Subscription',
  'PaymentProof',
  'GoogleSheetsConnection',
];

async function fetchAll(table) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) throw new Error(`${table}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

// nilai embedding dari Supabase datang sebagai string "[0.1,0.2,...]" atau array
function toVector(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return `[${v.join(',')}]`;
  const s = String(v).trim();
  if (s === '') return null;
  return s.startsWith('[') ? s : `[${s}]`;
}

// kolom yang bertipe vektor
const VECTOR_COLS = { DocumentChunk: ['embedding'] };

(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_KEY tidak ada di .env');
    process.exit(1);
  }

  const pg = new Client(LOCAL);
  await pg.connect();
  console.log('✅ Terhubung ke PostgreSQL lokal (jagobot)\n');

  // urutan insert: hapus dulu isi lokal (aman: DB lokal masih kosong)
  await pg.query('BEGIN');
  try {
    for (const t of [...TABLES].reverse()) {
      await pg.query(`DELETE FROM "${t}"`);
    }
    console.log('🧹 Isi tabel lokal dikosongkan (untuk idempotensi)\n');

    const summary = [];
    for (const table of TABLES) {
      const rows = await fetchAll(table);
      if (rows.length === 0) {
        summary.push([table, 0, 'kosong']);
        continue;
      }

      const cols = Object.keys(rows[0]);
      const vecCols = VECTOR_COLS[table] || [];
      const colList = cols.map((c) => `"${c}"`).join(', ');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const sql = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = cols.map((c) =>
          vecCols.includes(c) ? toVector(row[c]) : row[c]
        );
        await pg.query(sql, values);
      }
      summary.push([table, rows.length, 'OK']);
    }

    // reset sequence agar auto-increment tidak bentrok
    console.log('🔢 Reset sequence...');
    for (const t of TABLES) {
      await pg.query(
        `SELECT setval(pg_get_serial_sequence('"${t}"','id'),
                COALESCE((SELECT MAX("id") FROM "${t}"), 0) + 1, false)`
      );
    }

    await pg.query('COMMIT');

    console.log('\n════════ HASIL MIGRASI ════════');
    for (const [t, n, s] of summary) {
      console.log(`  ${t.padEnd(24)} ${String(n).padStart(4)} baris  ${s}`);
    }
    console.log('═══════════════════════════════');
    console.log('✅ MIGRASI SELESAI');
  } catch (e) {
    await pg.query('ROLLBACK');
    console.error('❌ GAGAL, di-rollback:', e.message);
    process.exitCode = 1;
  } finally {
    await pg.end();
  }
})();
