# Draft Pengujian Perangkat Lunak - JagoBot

## Bab 4.x - Implementasi Pengujian Perangkat Lunak

---

## 1. Ruang Lingkup Pengujian

Pengujian dilakukan terhadap **semua fitur** yang tersedia pada sistem JagoBot berdasarkan role pengguna utama pengelola bot:

| No | Role | Keterangan | Halaman yang Diuji |
|---|---|---|---|
| 1 | **User (Admin Bot)** | Pengguna yang mendaftar untuk membuat, mengelola, dan melatih chatbot AI untuk kebutuhan mereka. | Auth (Login/Register/Forgot Password), Dashboard, Project Management, Knowledge Base, Profil Bot, Chatbot Playground, Integrasi, Analitik, Profile |

### Akun Test yang Dibutuhkan

| Email | Password | Role | Status |
|---|---|---|---|
| admin@jagobot.com | Jagobot1234@ | USER | Active |
| testuser@jagobot.com | TestUser1234@ | USER | Active |
| unregistered@test.com | Salah1234@ | - | - |

---

## 2. Perancangan Pengujian

Bab ini berisi deskripsi test case yang dirancang untuk menguji setiap fungsionalitas utama yang tersedia pada sistem JagoBot. Test case yang dibuat mengimplementasikan pendekatan **Black Box Testing** dengan teknik **Equivalence Partitioning** dan **Boundary Value Analysis**.

---

### Tabel 2-1 Rancangan Pengujian Fungsionalitas Login

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Login | TC-LGN-01 | Pengguna tidak mengisikan email dan password | Pengguna berada pada halaman login (`/login`) | 1. Buka halaman login<br>2. Klik tombol "Masuk" tanpa mengisi field apapun | email = (kosong)<br>password = (kosong) | Login gagal, browser menampilkan validasi wajib isi |
| Login | TC-LGN-02 | Pengguna mengisikan email yang tidak terdaftar | Pengguna berada pada halaman login | 1. Buka halaman login<br>2. Isikan email yang tidak terdaftar<br>3. Isikan password<br>4. Klik tombol "Masuk" | email = unregistered@test.com<br>password = Test1234@ | Login gagal, muncul pesan error "Email atau password salah" |
| Login | TC-LGN-03 | Pengguna mengisikan password yang salah | Pengguna berada pada halaman login | 1. Buka halaman login<br>2. Isikan email yang terdaftar<br>3. Isikan password yang salah<br>4. Klik tombol "Masuk" | email = admin@jagobot.com<br>password = passwordsalah | Login gagal, muncul pesan error "Email atau password salah" |
| Login | TC-LGN-04 | Login berhasil | Pengguna berada pada halaman login | 1. Buka halaman login<br>2. Isikan email valid<br>3. Isikan password valid<br>4. Klik tombol "Masuk" | email = admin@jagobot.com<br>password = Jagobot1234@ | Login berhasil, muncul toast sukses, diarahkan ke halaman `/dashboard` |

---

### Tabel 2-2 Rancangan Pengujian Fungsionalitas Register

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Register | TC-REG-01 | Pengguna mendaftar tanpa mengisi field wajib | Pengguna berada pada halaman register (`/register`) | 1. Buka halaman register<br>2. Klik tombol "Daftar" tanpa mengisi apapun | name = (kosong)<br>email = (kosong)<br>password = (kosong) | Register gagal, browser menampilkan validasi |
| Register | TC-REG-02 | Pengguna mendaftar dengan email yang sudah terdaftar | Pengguna berada pada halaman register | 1. Isikan nama<br>2. Isikan email yang sudah terdaftar<br>3. Isikan password<br>4. Klik "Daftar" | name = Test User<br>email = admin@jagobot.com<br>password = Test1234@ | Register gagal, muncul pesan error "Email sudah digunakan" |
| Register | TC-REG-03 | Pengguna mendaftar dengan data valid | Pengguna berada pada halaman register | 1. Isikan nama<br>2. Isikan email baru<br>3. Isikan password valid<br>4. Klik "Daftar" | name = User Baru<br>email = newuser@jagobot.com<br>password = UserBaru1234@ | Register berhasil, muncul toast sukses, diarahkan ke halaman login |

---

### Tabel 2-3 Rancangan Pengujian Fungsionalitas Forgot Password

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Forgot Password | TC-FP-01 | Meminta reset password dengan email tidak terdaftar | Pengguna berada pada halaman forgot password (`/forgot-password`) | 1. Buka halaman forgot password<br>2. Isikan email tidak terdaftar<br>3. Klik tombol kirim | email = tidakada@test.com | Sistem menampilkan pesan generik sukses: 'Jika email terdaftar, email akan dikirimkan link reset password' demi menjaga keamanan informasi (user privacy protection) |
| Forgot Password | TC-FP-02 | Meminta reset password dengan email valid | Pengguna berada pada halaman forgot password | 1. Buka halaman forgot password<br>2. Isikan email valid<br>3. Klik tombol kirim | email = admin@jagobot.com | Muncul pesan sukses link reset berhasil dikirim |

---

### Tabel 2-4 Rancangan Pengujian Fungsionalitas Dashboard & Project Management

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Dashboard | TC-DSH-01 | Menampilkan daftar project chatbot | Pengguna sudah login | 1. Login ke aplikasi<br>2. Akses halaman `/dashboard` | (akun valid) | Halaman dashboard tampil, menampilkan ringkasan data dan daftar project |
| Project | TC-PRJ-01 | Membuat project baru | Pengguna berada di Dashboard | 1. Klik tombol "Buat Project Baru"<br>2. Isikan nama project<br>3. Klik simpan | projectName = "Bot Layanan Pelanggan" | Project berhasil dibuat, muncul di daftar project, diarahkan ke detail project |
| Project | TC-PRJ-02 | Mengakses detail project | Pengguna berada di Dashboard | 1. Pilih salah satu project dari dropdown navigasi atas | (project yang ada) | Halaman melakukan reload singkat dan menampilkan data/pengaturan sesuai project yang dipilih |

---

### Tabel 2-5 Rancangan Pengujian Fungsionalitas Knowledge Base (Data Sumber)

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Knowledge Base | TC-KB-01 | Menambahkan sumber teks manual | Pengguna berada di menu Knowledge Base suatu project | 1. Klik tambah sumber<br>2. Pilih tipe "Teks"<br>3. Masukkan judul dan konten teks<br>4. Klik Simpan | title = "Info Jam Buka"<br>content = "Toko buka jam 08:00 - 17:00" | Data teks berhasil disimpan dan di-embedding, status berubah menjadi "Trained/Active" |
| Knowledge Base | TC-KB-02 | Mengunggah dokumen file | Pengguna berada di menu Knowledge Base | 1. Klik tambah sumber<br>2. Pilih tipe "Dokumen"<br>3. Unggah file PDF pendukung<br>4. Klik Simpan | file = "katalog_produk.pdf" | File berhasil diunggah, diekstrak, dan di-embedding sebagai pengetahuan bot |

---

### Tabel 2-6 Rancangan Pengujian Fungsionalitas Profil Bot

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Bot Settings | TC-SET-01 | Mengubah System Prompt bot | Pengguna berada di menu Profil Bot | 1. Ubah kolom instruksi khusus bot (System Prompt)<br>2. Klik Simpan Perubahan | prompt = "Anda adalah asisten ramah" | Prompt berhasil diperbarui dan diterapkan ke behavior chatbot |
| Profil Bot | TC-SET-02 | Mengubah Sifat/Karakter Tampilan Bot | Pengguna berada di menu Profil Bot | 1. Masuk menu Profil Bot<br>2. Klik salah satu tombol pilihan sifat bot<br>3. Klik tombol Simpan Perubahan | Pilihan Sifat: Mengklik tombol "Ramah" (atau Baik / Ceria) | Sistem berhasil memperbarui preferensi sifat bot dan memicu perubahan gaya bahasa pada widget chatbot |

---

### Tabel 2-7 Rancangan Pengujian Fungsionalitas Chatbot Playground

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Playground | TC-PLY-01 | Mengirim pesan tes ke chatbot | Pengguna berada di menu Playground project | 1. Ketik pesan di input chat<br>2. Tekan enter atau tombol kirim | message = "Jam berapa toko buka?" | Pesan terkirim, chatbot merespons dengan jawaban yang relevan berdasarkan knowledge base |
| Playground | TC-PLY-02 | Pengujian Pertanyaan Luar Knowledge Base | Pengguna berada di menu Playground | 1. Masuk menu Playground<br>2. Ketik pertanyaan di luar konteks toko<br>3. Klik tombol kirim pesan | Pesan: "Berapa hasil dari 250 dikali 4?" (atau pertanyaan umum lainnya) | Chatbot memberikan respons penolakan standar (misal: "Maaf, saya tidak bisa menjawab...") sesuai instruksi pembatasan |

---

### Tabel 2-8 Rancangan Pengujian Fungsionalitas Profil & Navigasi

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Profile | TC-PRF-01 | Mengubah informasi nama profil | Pengguna berada di halaman Profil Saya | 1. Ubah field nama pemiliki/toko<br>2. Klik Simpan | name = "Admin JagoBot Terupdate" | Profil berhasil diperbarui, inisial/nama di navbar atas berubah seketika |
| Navigation | TC-NAV-01 | Logout dari aplikasi | Pengguna sudah login | 1. Buka menu dropdown profil di navbar atas<br>2. Klik tombol "Logout" | (akun yang sedang login) | Sesi berakhir, data local dihapus, dan pengguna diarahkan kembali ke halaman login utama |

---

### Tabel 2-9 Rancangan Pengujian Fungsionalitas Integrasi

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Integrasi | TC-INT-01 | Menyalin Script Integrasi | Pengguna berada di halaman Integrasi | 1. Masuk ke halaman Integrasi<br>2. Klik tombol/area salin script | (tidak ada) | Teks `<script>` berhasil disalin ke clipboard pengguna dan notifikasi berhasil disalin muncul |

---

### Tabel 2-10 Rancangan Pengujian Fungsionalitas Analitik

| Fungsionalitas | ID Test Case | Deskripsi/Skenario | Pra Kondisi | Langkah Pengujian | Data Pengujian | Hasil yang Diharapkan |
|---|---|---|---|---|---|---|
| Analitik | TC-ANL-01 | Menampilkan Statistik Penggunaan | Pengguna berada di halaman Analitik | 1. Akses halaman Analitik | (project memiliki riwayat interaksi) | Halaman menampilkan data metrik aktual seperti total percakapan, platform, dan grafik sesuai data asli dari database project |

---

## 3. Hasil Pengujian

Rancangan pengujian dieksekusi menggunakan **Katalon Studio** sebagai tools pengujian otomatis web. Berdasarkan 22 Test Case yang telah dirancang, berikut adalah hasil eksekusinya.

### Tabel 3-1 Hasil Pengujian Fungsionalitas Login

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Login | TC-LGN-01 | `WebUI.click(btn_Masuk)`<br>`WebUI.verifyElementPresent(input_email_validation, 5)` | Sistem menampilkan validasi "Required" / meminta field diisi. | Pass |
| Login | TC-LGN-02 | `WebUI.setText(input_email, 'unreg@test.com')`<br>`WebUI.verifyElementPresent(toast_error, 5)` | Sistem menampilkan pesan error bahwa kredensial tidak valid. | Pass |
| Login | TC-LGN-03 | `WebUI.setText(input_password, 'salah')`<br>`WebUI.verifyElementPresent(toast_error, 5)` | Sistem menolak masuk dan menampilkan toast gagal login. | Pass |
| Login | TC-LGN-04 | `WebUI.setText(input_email, 'admin@jagobot.com')`<br>`WebUI.waitForPageLoad(10)` | Login berhasil, muncul alert "Berhasil Masuk", lalu redirect ke Dashboard. | Pass |

---

### Tabel 3-2 Hasil Pengujian Fungsionalitas Register

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Register | TC-REG-01 | `WebUI.click(btn_Daftar)`<br>`WebUI.verifyElementPresent(input_validation, 5)` | Browser mencegah submit form dan menampilkan tooltip validasi wajib isi. | Pass |
| Register | TC-REG-02 | `WebUI.setText(input_email, 'admin@jagobot.com')`<br>`WebUI.verifyElementPresent(toast_error, 5)` | Sistem menampilkan peringatan bahwa email sudah pernah digunakan. | Pass |
| Register | TC-REG-03 | `WebUI.setText(input_email, 'baru@test.com')`<br>`WebUI.verifyMatch(url, '.*login.*', true)` | Register berhasil, data tersimpan, pengguna dikembalikan ke halaman login. | Pass |

---

### Tabel 3-3 Hasil Pengujian Fungsionalitas Forgot Password

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Forgot Password | TC-FP-01  | `WebUI.setText(input_email, 'unreg@test.com')`<br>`WebUI.verifyElementPresent(toast_success, 5)` | Sistem menampilkan pesan generik hijau demi menjaga privasi keamanan. | Pass |
| Forgot Password | TC-FP-02  | `WebUI.setText(input_email, 'admin@jagobot.com')`<br>`WebUI.verifyElementPresent(toast_success, 5)` | Sistem mengirim email dan menampilkan pesan konfirmasi terkirim. | Pass |

---

### Tabel 3-4 Hasil Pengujian Fungsionalitas Dashboard & Project Management

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Dashboard | TC-DSH-01 | `WebUI.waitForElementVisible(select_project, 10)`<br>`WebUI.verifyElementPresent(dashboard_content, 5)` | Halaman dashboard tampil beserta list project bot pengguna. | Pass |
| Project | TC-PRJ-01 | `WebUI.click(btn_tambah_project)`<br>`WebUI.setText(input_nama_project, 'Esa Project')` | Modal tambah tertutup, halaman reload, dan bot baru berhasil dibuat. | Pass |
| Project | TC-PRJ-02 | `WebUI.selectOptionByValue(select_dropdown, '11', false)`<br>`WebUI.delay(5)` | Loading indikator muncul sesaat lalu sistem mengganti lingkup kerja ke project terpilih. | Pass |

---

### Tabel 3-5 Hasil Pengujian Fungsionalitas Knowledge Base (Data Sumber)

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Knowledge Base | TC-KB-01  | `WebUI.setText(textarea_content, 'Jam buka: 08.00')`<br>`WebUI.click(btn_simpan_latih)` | Teks berhasil disimpan dan indikator AI embedding berjalan sukses. | Pass |
| Knowledge Base | TC-KB-02  | `WebUI.uploadFile(input_file_hidden, 'C:\\...\\salon.pdf')`<br>`WebUI.click(btn_simpan)` | File PDF berhasil terunggah, tidak ada hambatan UI, dan konten masuk tabel. | Pass |

---

### Tabel 3-6 Hasil Pengujian Fungsionalitas Profil Bot

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Bot Settings | TC-SET-01 | `WebUI.setText(textarea_prompt, 'Anda asisten ramah')`<br>`WebUI.click(btn_simpan)` | Konfigurasi custom prompt berhasil tersimpan ke sistem database. | Pass |
| Profil Bot | TC-SET-02 | `WebUI.click(btn_sifat_ramah)`<br>`WebUI.click(btn_simpan_perubahan)` | Pengaturan sifat diperbarui dan respon bot saat dites menjadi lebih santun. | Pass |

---

### Tabel 3-7 Hasil Pengujian Fungsionalitas Chatbot Playground

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Playground | TC-PLY-01 | `WebUI.setText(input_chat, 'Kapan buka?')`<br>`WebUI.waitForElementVisible(bubble_bot, 15)` | Bot menjawab dengan konteks jam buka yang disuplai di Knowledge Base. | Pass |
| Playground | TC-PLY-02 | `WebUI.setText(input_chat, 'Berapa 5 dikali 4?')`<br>`WebUI.verifyTextPresent('Maaf', false)` | Bot membatasi jawaban dan merespon bahwa hal itu diluar jangkauan info tokonya. | Pass |

---

### Tabel 3-8 Hasil Pengujian Fungsionalitas Profil & Navigasi

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Profile | TC-PRF-01 | `WebUI.setText(input_nama, 'Toko Baru')`<br>`WebUI.click(btn_simpan)` | Nama toko di-update dan inisial logo profile di kanan atas seketika berubah. | Pass |
| Navigation | TC-NAV-01 | `WebUI.click(dropdown_profile)`<br>`WebUI.click(btn_logout)` | Cache LocalStorage terhapus dan web dikembalikan ke gerbang Login dengan aman. | Pass |

---

### Tabel 3-9 Hasil Pengujian Fungsionalitas Integrasi

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Integrasi | TC-INT-01 | `WebUI.click(btn_copy_script)`<br>`WebUI.verifyElementPresent(toast_copied, 5)` | Script HTML `<script src=...>` berhasil masuk ke clipboard sistem (tersalin). | Pass |

---

### Tabel 3-10 Hasil Pengujian Fungsionalitas Analitik

| Fungsionalitas | ID Test Case | Command Inti (Katalon Studio - Groovy Script) | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|
| Analitik | TC-ANL-01 | `WebUI.navigateToUrl('.../analytics')`<br>`WebUI.verifyElementPresent(chart_canvas, 10)` | Tampilan analitik sukses me-render bar chart serta angka total interaksi akurat. | Pass |

---

### Ringkasan Pengujian Keseluruhan

| Kategori Fungsionalitas | Total Test Case | Pass | Failed | Persentase Keberhasilan |
|---|---|---|---|---|
| Authentication (Login, Register, Forgot Password) | 9 | 9 | 0 | 100% |
| Dashboard & Project Management | 3 | 3 | 0 | 100% |
| Knowledge Base Management | 2 | 2 | 0 | 100% |
| Profil Bot & Setting | 2 | 2 | 0 | 100% |
| Chatbot Playground | 2 | 2 | 0 | 100% |
| Integrasi & Analitik | 2 | 2 | 0 | 100% |
| Profile & Navigation | 2 | 2 | 0 | 100% |
| **Total Test Case** | **22** | **22** | **0** | **100%** |

---

## Alur Pengujian dengan Katalon Studio

### 1. Setup Project Katalon Studio

```text
1. Buka Katalon Studio
2. File → New → Project
3. Nama Project: JagoBot_Testing
4. Tipe: Web
5. URL: http://localhost:3000 (atau port frontend JagoBot)
```

### 2. Struktur Object Repository JagoBot (Contoh)

Buat folder Object Repository berdasarkan halaman aplikasi JagoBot:

```text
Object Repository/
│
├── Page_Login/
│   ├── input_email (Selector: //input[@type='email'])
│   ├── input_password (Selector: //input[@type='password'])
│   ├── btn_Masuk (Selector: //button[@type='submit'])
│   └── toast_error (Selector: .toast-error)
│
├── Page_Dashboard/
│   ├── btn_create_project (Selector: //button[contains(text(), 'Project Baru')])
│   └── select_project_dropdown (Selector: //select)
│
├── Page_Playground/
│   ├── input_chat (Selector: //input[@placeholder='Ketik pesan...'])
│   ├── btn_send (Selector: //button[@aria-label='Kirim'])
│   └── chat_bubble_bot (Selector: //div[contains(@class, 'bot-message')][last()])
│
└── Page_Layout/
    └── btn_logout (Selector: //button[contains(text(), 'Logout')])
```

### 3. Langkah-Langkah Eksekusi

1. **Persiapan Environment:** Pastikan backend (`jagobot-backend`) berjalan dan frontend berjalan di `localhost`. Pastikan database dapat diakses.
2. **Create Test Cases:** Buat test case di Katalon berdasarkan ID di tabel (contoh: `TC_LGN_01`). Gunakan Web Record atau tulis script Groovy secara manual.
3. **Penanganan Kasus Khusus:** Tambahkan delay (contoh: `WebUI.delay(3)`) untuk menunggu data selesai di-fetch dari API backend, dan `WebUI.uploadFile()` untuk file *knowledge base*.
4. **Create Test Suite:** Gabungkan test case ke dalam Test Suites (misal: `TS_Auth`, `TS_Project_Management`).
5. **Eksekusi:** Jalankan Test Suite menggunakan browser Chrome.
6. **Report:** Ekspor hasil test (Passed/Failed) ke format HTML atau PDF setelah eksekusi selesai untuk dilampirkan sebagai bukti pengujian.
