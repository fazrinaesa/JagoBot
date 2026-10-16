# Rencana: RBAC Super Admin, Konfigurasi AI, Monitoring API & Model Rolling

**Tanggal:** 2026-10-16
**Project:** JagoBot (Tugas Akhir KoLab)
**Status:** RENCANA — belum diimplementasikan
**Aturan:** Tidak mengubah logika yang sudah berjalan. Semua perubahan bersifat **aditif** (tambah kolom/tabel/halaman), bukan menimpa.

---

## 1. Latar Belakang & Temuan Analisis

Hasil pembacaan kode saat ini:

| # | Temuan | Dampak |
|---|--------|--------|
| 1 | Model `User` **tidak punya field `role`** | Tidak ada pemisahan hak akses |
| 2 | Endpoint `/api/payment/admin/*` hanya pakai `verifyToken` | 🔴 **Celah:** user biasa bisa lihat/ubah data pembayaran semua orang |
| 3 | `src/pages/ApiManagement.tsx` = **mock penuh** (`INITIAL_KEYS`, `generateNewKey()` di browser, `BASE_URL` hardcoded) | Tidak ada data nyata, tidak ada tabel `ApiKey` |
| 4 | `src/lib/llm.ts` sudah punya fallback 9router→Gemini | ✅ Fondasi rolling sudah ada, tapi **hardcoded** |
| 5 | `ChatLog.tokenCount` + `Subscription.tokensUsedToday` sudah dicatat | ✅ Data mentah monitoring sudah ada |
| 6 | `dashboardController` sudah hitung `topFaq` | ✅ Tapi **per-user**, belum global |
| 7 | Konfigurasi AI dari `process.env` saja | Tidak bisa diubah dari UI |
| 8 | `crypto-js` sudah terinstall | Bisa untuk enkripsi API key (tanpa dependency baru) |
| 9 | `ChatLog.platform` berisi nama toko (bukan kanal) | Perlu diperhatikan saat agregasi |

---

## 2. Ruang Lingkup Permintaan

| Kode | Fitur yang diminta |
|------|--------------------|
| **F1** | Role baru (super admin) yang bisa membantu semua pengguna |
| **F2** | Super admin bisa melihat pertanyaan yang paling sering ditanyakan (global) |
| **F3** | Konfigurasi API Key & Base URL untuk chatbot project |
| **F4** | Dashboard pemantauan penggunaan API Key (sisa kuota, total token per pengguna) |
| **F5** | Admin bisa mengganti model AI untuk chatbot |
| **F6** | Gabungkan beberapa model jadi satu rantai — jika habis, rolling ke model berikutnya |

---

## 3. Desain Peran (RBAC)

### 3.1 Tiga tingkat peran

| Role | Deskripsi | Bisa akses |
|------|-----------|------------|
| `USER` | Default semua pendaftar | Dashboard pribadi saja |
| `ADMIN` | Staf operasional | + Review pembayaran, lihat data semua user (read-only) |
| `SUPER_ADMIN` | Pemilik sistem | + Konfigurasi API/model, monitoring token, kelola pengguna |

> Rekomendasi: mulai dari `USER` + `SUPER_ADMIN` dulu (paling sederhana), `ADMIN` bisa ditambah belakangan tanpa migrasi ulang karena tipenya `String`.

### 3.2 Perubahan Skema

```prisma
model User {
  // ... field yang sudah ada TETAP ...
  role          String   @default("USER")   // "USER" | "ADMIN" | "SUPER_ADMIN"
  isActive      Boolean  @default(true)     // untuk suspend akun
  lastLoginAt   DateTime?
  apiKeys       ApiKey[]
  usageLogs     ApiUsageLog[]
}
```

### 3.3 Bootstrap super admin pertama

Tanpa mengubah kode manual: tambahkan `SUPER_ADMIN_EMAIL` di `.env`. Saat server start (atau saat login), jika email cocok dan role belum `SUPER_ADMIN` → di-promote otomatis.

```
SUPER_ADMIN_EMAIL="fazrinaesa2005@gmail.com"
```

### 3.4 Middleware baru (`src/middleware/rbacMiddleware.ts`)

```ts
export const requireRole = (...roles: string[]) => (req, res, next) => {
  const role = req.user?.role || 'USER';
  if (!roles.includes(role)) return res.status(403).json({ message: 'Akses ditolak' });
  next();
};
export const requireSuperAdmin = requireRole('SUPER_ADMIN');
```

### 3.5 JWT

Tambah `role` ke payload agar tidak perlu query DB tiap request:
```ts
jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' })
```
> ⚠️ Token lama (tanpa `role`) diperlakukan sebagai `USER` → aman, tidak memaksa login ulang.

---

## 4. Skema Database Baru (Aditif)

### 4.1 `ApiKey` — API key nyata untuk integrasi eksternal (menggantikan mock)

```prisma
model ApiKey {
  id          Int      @id @default(autoincrement())
  userId      Int
  name        String
  keyHash     String   @unique   // SHA-256; key asli hanya ditampilkan sekali
  keyPrefix   String              // "jb_live_9a8b" untuk ditampilkan
  lastUsedAt  DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  revokedAt   DateTime?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  usageLogs   ApiUsageLog[]
}
```
> Keamanan: **jangan simpan key mentah**. Simpan hash; tampilkan sekali saat dibuat.

### 4.2 `ApiUsageLog` — pencatatan pemakaian (fondasi monitoring)

```prisma
model ApiUsageLog {
  id           Int      @id @default(autoincrement())
  apiKeyId     Int?
  userId       Int
  botId        Int?
  endpoint     String            // "/api/public/chat"
  model        String?           // model yang akhirnya dipakai
  promptTokens Int      @default(0)
  completionTokens Int  @default(0)
  totalTokens  Int      @default(0)
  statusCode   Int?
  latencyMs    Int?
  createdAt    DateTime @default(now())
  apiKey       ApiKey?  @relation(fields: [apiKeyId], references: [id])
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
> Ini yang membuat dashboard "sudah habis berapa juta token" mungkin dihitung akurat per hari/bulan.

### 4.3 `AiProviderConfig` — konfigurasi API Key & Base URL (F3)

```prisma
model AiProviderConfig {
  id          Int      @id @default(autoincrement())
  label       String              // "9router Utama", "Gemini Cadangan"
  provider    String              // "openai-compatible" | "gemini"
  baseUrl     String              // https://9router.jagoai.dev/v1
  apiKeyEnc   String              // terenkripsi AES (crypto-js)
  model       String              // nama model chat
  priority    Int      @default(1) // urutan rolling: 1 = dicoba pertama
  isActive    Boolean  @default(true)
  maxTokens   Int?
  temperature Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 4.4 `ModelChain` (opsional, bila ingin rantai bernama)

```prisma
model ModelChain {
  id        Int      @id @default(autoincrement())
  name      String   @unique     // "Rantai Hemat", "Rantai Cepat"
  isDefault Boolean  @default(false)
  items     ModelChainItem[]
}
model ModelChainItem {
  id           Int  @id @default(autoincrement())
  chainId      Int
  providerId   Int               // relasi ke AiProviderConfig
  order        Int               // 1,2,3... urutan rolling
}
```
> Untuk versi pertama, cukup pakai `AiProviderConfig.priority` (lebih KISS). `ModelChain` = pengembangan lanjutan.

---

## 5. Backend — Endpoint Baru

### 5.1 RBAC & Pengguna (SUPER_ADMIN)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/admin/users` | Daftar semua pengguna + role + token terpakai |
| PATCH | `/api/admin/users/:id/role` | Ubah role |
| PATCH | `/api/admin/users/:id/status` | Aktif/nonaktifkan akun |
| GET | `/api/admin/overview` | Statistik global (total user, bot, chat, token) |

### 5.2 Analitik Pertanyaan Global (F2)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/admin/analytics/top-questions?period=bulan&limit=20` | Agregasi `ChatLog.userMessage` lintas semua user |
| GET | `/api/admin/analytics/unanswered` | Pertanyaan yang jawabannya kosong/fallback (indikasi KB kurang) |
| GET | `/api/admin/analytics/trend?days=30` | Tren jumlah chat & token harian |

### 5.3 Konfigurasi AI (F3, F5)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/admin/ai/providers` | Daftar provider (API key disensor) |
| POST | `/api/admin/ai/providers` | Tambah provider (key dienkripsi) |
| PUT | `/api/admin/ai/providers/:id` | Ubah base URL / model / key |
| DELETE | `/api/admin/ai/providers/:id` | Hapus |
| POST | `/api/admin/ai/providers/:id/test` | Tes koneksi (ping 1 token) |
| PUT | `/api/admin/ai/providers/reorder` | Ubah urutan rolling (drag & drop) |

### 5.4 Monitoring API (F4)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/admin/api-usage/summary` | Per user: total token, sisa kuota, % terpakai |
| GET | `/api/admin/api-usage/timeline?days=30` | Grafik harian |
| GET | `/api/admin/api-usage/keys` | Daftar API key + pemakaian |
| GET | `/api/user/api-usage` | Versi user sendiri (halaman API existing) |

### 5.5 API Key nyata (menggantikan mock di `ApiManagement.tsx`)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/api/user/api-keys` | Daftar key milik user (tersensor) |
| POST | `/api/user/api-keys` | Generate key baru (plaintext dikembalikan **sekali**) |
| DELETE | `/api/user/api-keys/:id` | Revoke |

---

## 6. Model Rolling / Fallback Chain (F6) — Inti

### 6.1 Kondisi saat ini (`llm.ts`)
```
9router (NINEROUTER_CHAT_MODEL) → gagal retryable → Gemini (hardcoded 'gemini-3.8-flash')
```
Hanya **2 langkah tetap**, tidak bisa dikonfigurasi.

### 6.2 Rancangan baru (tanpa merusak perilaku lama)
```
for provider in AiProviderConfig (aktif, urut priority ASC):
    try  → sukses? return + catat model
    catch retryable (429/5xx/quota/timeout) → lanjut ke provider berikutnya
    catch non-retryable → lempar error
→ semua gagal? fallback terakhir ke env NINEROUTER_* / GEMINI_API_KEY (perilaku lama)
```

**Kunci backward-compatibility:** jika tabel `AiProviderConfig` **kosong** → otomatis pakai jalur lama (`env`). Jadi sistem tetap jalan sebelum admin mengisi apa pun.

### 6.3 Kapan dianggap "model habis" → rolling
| Kondisi | Aksi |
|---------|------|
| HTTP 429 (rate limit / kuota) | rolling |
| HTTP 500/502/503/504 | rolling |
| Timeout / ECONNRESET | rolling |
| Error "quota exceeded" / "insufficient" | rolling + tandai provider `isActive=false` sementara |
| Error 401/403 (key invalid) | **tidak** rolling, tandai provider bermasalah di UI |

### 6.4 Pencatatan
- `ChatLog` → tambah kolom `modelUsed String?` (opsional) agar bisa audit model mana yang melayani.
- `ApiUsageLog` → catat `model`, `totalTokens`, `latencyMs`.

### 6.5 Perbaikan penghitungan token (opsional, tapi disarankan)
Saat ini `estimateTokens = text.length / 4` (kasar). Bisa ditingkatkan:
- **Prioritas 1:** pakai `usage.total_tokens` dari respons API (akurat, gratis — sudah dikirim provider).
- **Prioritas 2:** tetap estimasi sebagai fallback.
> Ini yang membuat klaim "sudah habis berapa juta token" jadi **akurat**, bukan perkiraan.

---

## 7. Frontend — Halaman Baru

| Halaman | Route | Role | Isi |
|---------|-------|------|-----|
| Kelola Pengguna | `/admin/users` | SUPER_ADMIN | Tabel user, ubah role, suspend, lihat token |
| Pertanyaan Populer | `/admin/questions` | SUPER_ADMIN | Top FAQ global + filter periode + "belum terjawab" |
| Konfigurasi AI | `/admin/ai-config` | SUPER_ADMIN | CRUD provider (Base URL, API Key, model), tes koneksi |
| Rantai Model | `/admin/model-chain` | SUPER_ADMIN | Drag & drop urutan rolling, status tiap model |
| Monitoring API | `/admin/api-usage` | SUPER_ADMIN | Grafik token, tabel per user, sisa kuota, alert |
| Layout Admin | — | SUPER_ADMIN | Sidebar khusus admin (menu kondisional) |

### 7.1 Perubahan `DashboardLayout.tsx`
Menu `admin` **hanya muncul** bila `role === 'SUPER_ADMIN'`. Perlu tambahan: `menuItems` menjadi kondisional (tidak mengubah menu user biasa).

### 7.2 Perubahan `ApiManagement.tsx`
Ganti `INITIAL_KEYS` mock → panggil `/api/user/api-keys`. Struktur UI (tabel, tombol generate, copy) **dipertahankan** agar tampilan tidak berubah.

### 7.3 Guard rute frontend
Komponen `RequireSuperAdmin` yang membungkus rute admin; jika bukan super admin → redirect `/dashboard`.

---

## 8. Urutan Pengerjaan (Fase)

### Fase 0 — Persiapan (tanpa risiko)
- Backup DB + `.env` (sudah ada pola backup di `C:\jagobot-pg\backup-lokal\`)
- Buat branch `feat/superadmin-ai-config`

### Fase 1 — Fondasi RBAC ⭐ (wajib duluan) — ✅ **SELESAI 2026-10-16**
1. ~~Migrasi: `User.role`, `User.isActive`, `User.lastLoginAt`~~ ✅
2. ~~`rbacMiddleware.ts` + `requireSuperAdmin`~~ ✅
3. ~~JWT sertakan `role`~~ ✅
4. ~~Bootstrap `SUPER_ADMIN_EMAIL`~~ ✅ (`browsertest@example.com`)
5. ~~**Tutup celah:** pasang `requireAdmin` di `/api/payment/admin/*`~~ ✅
6. ~~Endpoint `/api/admin/users`~~ ✅ (+ overview, me, role, status)
> Verifikasi: user biasa → 403 di endpoint admin; super admin → 200. ✅ TERBUKTI

**Hasil Fase 1 (terverifikasi):**
- Migrasi aditif: 27 user utuh, semua otomatis `role='USER'`
- Bootstrap: login `browsertest@example.com` → otomatis `SUPER_ADMIN`
- RBAC: `/api/admin/*` & `/api/payment/admin/*` → SUPER=200, USER=403, tanpa token=403
- Kontrol: role tidak valid=400, cegah turunkan diri sendiri=400
- Regresi: register=201, login=200, profile/stats/quota=200, chat publik=200
- `npm run lint`=0, `npm run build`=OK, `tsc` backend=0
- Berkas: `rbacMiddleware.ts`, `adminController.ts`, `adminRoutes.ts`, `migration-fase1-rbac.sql`


### Fase 2 — Konfigurasi AI (F3, F5) — ✅ **SELESAI 2026-10-16**
1. ~~Migrasi: `AiProviderConfig`~~ ✅ (aditif, 14 kolom)
2. ~~CRUD + enkripsi key (crypto-js AES)~~ ✅ (`cryptoKey.ts`, `aiConfigController.ts`)
3. ~~Endpoint tes koneksi~~ ✅ (gemini & openai-compatible)
4. ~~Halaman `/dashboard/admin/ai-config`~~ ✅ (`AiConfigPage.tsx`)

**Hasil Fase 2 (terverifikasi):**
- API key tersimpan **terenkripsi AES** (`U2FsdGVkX19...`), UI hanya lihat bentuk tersensor (`AQ.A••••••4QQg`)
- Endpoint: GET/POST/PUT/DELETE `/api/admin/ai/providers`, PUT `/reorder`, POST `/:id/test`
- Tes koneksi: key palsu ❌ · key asli ✅ (1.7s)
- Urutan rolling bisa diubah dari UI (tombol naik/turun) → tersimpan ke DB
- **`llm.ts` baca provider dari DB** urut priority; tabel kosong → fallback ke `.env` (backward-compatible)
- Guard: `/api/admin/ai/providers` → SUPER=200, USER=403
- Menu "Konfigurasi AI" hanya muncul untuk SUPER_ADMIN; guard `RequireSuperAdmin` aktif
- Rolling dari DB terbukti: provider rusak di priority 1 dilewati, chat tetap terjawab (4s)
- lint/build/tsc = 0
- Berkas: `cryptoKey.ts`, `aiConfigController.ts`, `AiConfigPage.tsx`, `RequireSuperAdmin.tsx`, `migration-fase2-ai-provider.sql`

### Fase 3 — Model Rolling (F6) — ⚠️ **SEBAGIAN SELESAI (darurat) 2026-10-16**
> **Pemicu:** `gemini-3.8-flash` (model tunggal yang dipakai) kena **503 high demand** →
> seluruh chat balas *"Maaf, saya sedang tidak bisa memproses pesan Anda."* selama ~34 detik.
> Perbaikan darurat dikerjakan lebih awal dari urutan rencana.

**Sudah dikerjakan:**
- ~~Refactor `generateChatCompletion` → iterasi rantai model~~ ✅ (rantai Gemini via `GEMINI_CHAT_MODELS`)
- ~~Timeout per model (`GEMINI_TIMEOUT_MS`, default 10s)~~ ✅
- ~~Fallback ke jalur env bila tabel kosong (backward compatible)~~ ✅
- ~~Provider dari DB (Fase 2) ikut dalam rantai rolling~~ ✅

**Bukti rolling:**
```
⚠️ [LLM] Gemini "gemini-3.8-flash" gagal (timeout 20000ms) → rolling ke model berikutnya
✅ [LLM] Gemini rolling berhasil pakai model: gemini-2.5-flash
```
- Uji rantai `gemini-3.8-flash(❌),gemini-2.5-flash(✅)` → jawab dalam **2.6s**
- Chat publik: **34s (rusak) → 2-4s (sehat)**

**Sisa Fase 3 (belum):**
- Ambil `usage.total_tokens` dari respons provider (akurasi token)
- Simpan `modelUsed` di `ChatLog`

### Fase 4 — Monitoring API (F4)
1. Migrasi: `ApiKey`, `ApiUsageLog`
2. Catat pemakaian di `chatController` + `integrasiController`
3. Endpoint summary/timeline
4. Halaman `/admin/api-usage`
5. Sambungkan `ApiManagement.tsx` ke data nyata
> Verifikasi: kirim chat → muncul di `ApiUsageLog`; total token bertambah.

### Fase 5 — Analitik Global (F2)
1. Endpoint top-questions / unanswered / trend
2. Halaman `/admin/questions`
> Verifikasi: pertanyaan yang sama dari user berbeda teragregasi.

### Fase 6 — Halaman Admin & Polish
1. Layout admin + menu kondisional
2. `RequireSuperAdmin` guard
3. Uji end-to-end semua role

---

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| Migrasi merusak data | **Hanya aditif** (`ADD COLUMN ... DEFAULT`, `CREATE TABLE`); tidak ada `DROP`. Backup dulu. |
| Logika chat rusak saat refactor `llm.ts` | Fallback ke jalur env bila tabel kosong → perilaku identik sebelum fitur dipakai |
| Token lama tanpa `role` di JWT | Default `USER` → aman, tidak memaksa login ulang |
| API key bocor | Simpan **hash** (ApiKey) & **AES terenkripsi** (provider); tampilkan sekali |
| Endpoint admin terbuka | Middleware `requireSuperAdmin` di **setiap** route admin (termasuk yang lama) |
| DB lokal `vector(3072)` | Tidak disentuh; migrasi hanya tabel/kolom biasa |
| Super admin terkunci | Bootstrap via `SUPER_ADMIN_EMAIL` di `.env` → selalu bisa dipulihkan |

---

## 10. Keputusan yang Perlu Konfirmasi

> **STATUS: DITETAPKAN SEMENTARA (default aman) — 2026-10-16.**
> User tidak memberi konfirmasi dalam batas waktu; dipilih opsi paling fleksibel.
> Semua keputusan di bawah **mudah diubah** tanpa migrasi ulang.

| # | Pertanyaan | **Keputusan default** | Alasan / cara ubah |
|---|-----------|----------------------|--------------------|
| 1 | Jumlah role | **3 role:** `USER` → `ADMIN` → `SUPER_ADMIN`<br>• `ADMIN`: lihat pertanyaan global, monitoring API, review pembayaran<br>• `SUPER_ADMIN`: + konfigurasi AI, ubah model, kelola role | Field `role` bertipe `String`; menambah/mengurangi role cukup ubah middleware, tanpa migrasi |
| 2 | Akurasi token | **Pakai `usage.total_tokens`** dari respons provider (akurat), estimasi `length/4` hanya sebagai cadangan | Provider sudah mengirim `usage`; tidak ada biaya tambahan |
| 3 | Periode kuota | **Harian tetap** (`dailyTokenQuota`) **+ agregasi bulanan** untuk laporan "berapa juta token/bulan" | Agregasi dihitung dari `ApiUsageLog`, bukan kolom baru |
| 4 | Model chain | **Prioritas sederhana** via `AiProviderConfig.priority` (KISS). `ModelChain` disiapkan sebagai pengembangan lanjutan | Tidak perlu UI drag-drop rumit di versi pertama |
| 5 | API key & endpoint publik | **Lindungi `/api/public/chat`** dengan API key opsional: jika header `X-API-Key` ada → validasi; jika tidak ada → tetap jalan (backward compatible) | Widget lama tidak rusak |
| 6 | Biaya rupiah | **Jumlah token saja** dulu; tabel siap menyimpan `costIdr` bila nanti diperlukan | Hindari ketergantungan harga per model yang sering berubah |

**Cara mengubah:** cukup edit tabel ini lalu beri tahu saya (mis. *"pakai 2 role saja"* atau *"kuota bulanan"*), tanpa membongkar rencana lain.


---

## 11. Definisi Selesai (Definition of Done)

- [ ] User biasa tidak bisa mengakses endpoint/halaman admin (403 / redirect)
- [ ] Super admin bisa ubah role & suspend pengguna
- [ ] Super admin bisa lihat top pertanyaan global dengan filter periode
- [ ] Super admin bisa CRUD Base URL + API Key + model dari UI
- [ ] Super admin bisa mengatur urutan model rolling
- [ ] Chat tetap terjawab walau model utama habis (rolling terbukti)
- [ ] Dashboard monitoring menampilkan token per pengguna & sisa kuota
- [ ] `npm run lint`, `npm run build`, `tsc --noEmit` backend → **exit 0**
- [ ] Logika lama (chat, KB, RAG, pembayaran) **tidak berubah** — dibuktikan uji regresi
