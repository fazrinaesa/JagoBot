# 🎯 INSTRUKSI FINAL - TESTING SEKARANG

## ✅ SERVERS SUDAH RUNNING

- ✅ **Backend**: http://localhost:5000 (npm run dev)
- ✅ **Frontend**: http://localhost:3000 (npm run dev)

---

## 📋 PERUBAHAN REAL YANG SUDAH DILAKUKAN

### 1. Tombol "+ Tambah Project Baru" SEKARANG ADA DI 2 TEMPAT
- ✅ **Di navbar** samping project dropdown selector
- ✅ **Di profile dropdown** (klik avatar di top-right)

### 2. Console Logging SUDAH DITAMBAHKAN
- ✅ Frontend: DashboardLayout, KnowledgeBase, ChatbotPlayground
- ✅ Backend: dashboard.controller, chatController

### 3. ChatbotPlayground FIX
- ✅ Sekarang menggunakan `localStorage.getItem("activeBotId")`
- ✅ Bukan dari user object (yang sebelumnya salah)

### 4. Servers SUDAH RESTART
- ✅ Semua node processes di-kill
- ✅ Backend di-start fresh
- ✅ Frontend di-start fresh

---

## 🧪 TESTING SEKARANG - IKUTI LANGKAH INI

### STEP 1: Buka Browser & Console

```
1. Buka: http://localhost:3000
2. Tekan F12 (buka DevTools)
3. Pilih tab "Console"
4. Jangan tutup console ini
```

**Screenshot yang harus terlihat:**
- Browser menampilkan dashboard
- Console tab terbuka menampilkan logs

---

### STEP 2: Lihat Tombol "+ Tambah Project Baru"

```
1. Di navbar (top-right section), lihat area project selector
2. Ada dropdown dengan project name
3. Harus ada tombol "+" dengan warna biru di sebelahnya
4. ATAU klik avatar profile (top-right)
5. Di dropdown menu ada item "+ Tambah Project Baru"
```

**Console harus show:**
```
✅ Profile loaded: {nama: "Admin", toko: "..."}
🟢 [FetchBots] Response: ...
🟢 [FetchBots] Bots count: 1 (atau lebih)
🟢 [FetchBots] Bots data: [...]
```

**Jika TIDAK ada tombol atau console error:**
- Hard refresh: Ctrl+Shift+R
- Buka DevTools lagi: F12
- Check console untuk errors

---

### STEP 3: Klik Tombol "+ Tambah Project Baru"

```
1. Klik tombol "+" di navbar ATAU
   "+ Tambah Project Baru" di profile menu
2. Modal harus muncul dengan:
   - Title: "Buat Project Baru"
   - Label: "Nama Project"
   - Input field kosong
   - Button "Batal" dan "Buat Project"
```

**Console harus CLEAR** (jangan ada error sebelum ini)

---

### STEP 4: Isi Form & Submit

```
1. Ketik di input field: Warung Berkah
2. Klik button "Buat Project"
3. Button harus berubah jadi "Membuat..." dengan spinner
```

**Console harus show:**
```
🔵 [CreateBot] Mulai membuat project dengan nama: Warung Berkah
🔵 [CreateBot] Mengirim request ke /api/dashboard/create-bot
📤 [API] Sending POST /dashboard/create-bot with nama_bot: Warung Berkah
```

**Backend Terminal harus show:**
```
═══════════════════════════════════════════════════════
🟦 [Backend] CreateBot Request Received
═══════════════════════════════════════════════════════
👤 User ID dari Token: 1
🏷️  Bot Name dari Request Body: Warung Berkah
📦 Full Request Body: {nama_bot: "Warung Berkah"}
✅ Validasi nama bot OK, creating bot in database...
✅ Bot created successfully in database
🔑 New Bot ID: 5 (atau ID lainnya)
📋 New Bot Data: {id: 5, userId: 1, nama_bot: "Warung Berkah", ...}
📤 Sending response: {message: "Bot berhasil dibuat", data: {...}, id: 5}
═══════════════════════════════════════════════════════
```

---

### STEP 5: Verify Page Reload & Update Dropdown

```
Console harus show:
📥 [API] Received response from /dashboard/create-bot: {...}
🟢 [CreateBot] Response dari backend: {...}
🟢 [CreateBot] New Bot ID extracted: 5
🟢 [CreateBot] Menyimpan ke localStorage dengan key 'activeBotId': 5
🟢 [CreateBot] Modal ditutup, menunggu 500ms sebelum reload...
🟢 [CreateBot] Executing window.location.reload()

Kemudian dalam 500-800ms:
- Page reload otomatis
- Dropdown project harus menampilkan "Warung Berkah" dipilih
- Project list ada "Kpopmerch" dan "Warung Berkah"
```

**✅ CHECKPOINT 1 PASSED** - Project berhasil dibuat!

---

### STEP 6: Verify Knowledge Base Kosong

```
1. Navigate ke: http://localhost:3000/dashboard/knowledge
2. Halaman harus KOSONG (tidak ada dokumen)
3. Ada tulisan: "📭 Belum ada basis pengetahuan terdaftar."
4. Ada button "+ Tambah" untuk upload
```

**Console harus show:**
```
═══════════════════════════════════════════════════════
📄 [KnowledgeBase] Loading knowledge base
activeBotId from localStorage: 5
🔵 Numeric Bot ID: 5
📤 Fetching knowledge base list for botId: 5
📥 API Response: {...}
📂 Files count: 0
═══════════════════════════════════════════════════════
```

**✅ CHECKPOINT 2 PASSED** - Isolation terbukti (bot baru kosong)!

---

### STEP 7: Upload Knowledge (Opsional)

```
1. Klik "+ Tambah" button
2. Upload file ATAU input text tentang "Menu Kopi Gayo"
   Contoh text:
   - Judul: Menu Kopi Gayo
   - Isi: Kami menjual kopi Gayo dengan harga Rp 25.000 per cangkir
3. Klik "Upload" atau "Simpan"
```

**Console harus show success upload**

---

### STEP 8: Test di Playground

```
1. Navigate ke: http://localhost:3000/dashboard/playground
2. Console harus show:
   ═══════════════════════════════════════════════════════
   💬 [Playground] Sending message
   👤 User from localStorage: {...}
   🔑 Stored activeBotId: 5
   🤖 Numeric activeBotId: 5
   ✅ Bot ID valid, proceeding with message...
   ═══════════════════════════════════════════════════════

3. Ketik pertanyaan: Berapa harga kopi?
4. Tekan Enter / Click Send
```

**Console harus show:**
```
📤 [Playground] Sending request to /api/chat/send
📦 Request payload: {botId: 5, customerName: "...", message: "Berapa harga kopi?"}
```

**Backend Terminal harus show:**
```
═══════════════════════════════════════════════════════
💬 [Backend] Chat Request Received
═══════════════════════════════════════════════════════
🤖 Bot ID: 5
👤 Customer Name: User Jago
💭 Message: Berapa harga kopi?
📋 Fetching bot data from database...
✅ Bot data found: {namaBot: "Warung Berkah", gayaBahasa: "Ramah"}
📚 Fetching knowledge base for bot...
📂 Knowledge Base count: 1
✅ Chat log saved with ID: 123
📤 Sending response: {status: "success"}
═══════════════════════════════════════════════════════
```

**Browser harus show:**
- Bot answer terkait kopi Gayo
- Contoh: "Kopi Gayo kami harganya Rp 25.000 per cangkir"

**✅ CHECKPOINT 3 PASSED** - Playground & isolation bekerja!

---

### STEP 9: Switch ke Project Kpopmerch & Verify Berbeda

```
1. Klik dropdown project selector di navbar
2. Pilih "Kpopmerch"
3. Page loading dengan text "Berpindah Project..."
4. Setelah reload, page akan menampilkan Kpopmerch
```

**Console harus show:**
```
🔵 [FetchBots] Fetching user bots...
🟢 [FetchBots] Active bot already set: 1 (Kpopmerch ID)
```

```
5. Navigate ke Knowledge Base
6. Harus menampilkan dokumen Kpopmerch (BUKAN Menu Kopi Gayo)
7. Navigate ke Playground
8. Tanya ulang: "Berapa harga kopi?"
9. Bot menjawab BERBEDA (based on Kpopmerch knowledge, bukan Gayo)
```

**✅ CHECKPOINT 4 PASSED** - Project switcher & isolation perfect!

---

## 🎉 KESUKSESAN TOTAL JIKA:

- ✅ Tombol "+ Tambah Project Baru" MUNCUL di UI
- ✅ Modal bisa buka, isi nama, submit
- ✅ Console logs muncul sesuai expected
- ✅ Backend logs muncul di terminal
- ✅ Page reload otomatis setelah buat project
- ✅ Dropdown terupdate dengan project baru
- ✅ Knowledge Base kosong untuk project baru
- ✅ Upload knowledge berhasil
- ✅ Playground answer = Warung Berkah knowledge
- ✅ Switch ke Kpopmerch → Knowledge Base berbeda
- ✅ Playground answer = Kpopmerch knowledge (BERBEDA)

---

## 🐛 TROUBLESHOOTING

### Problem: Tombol "+ Tambah Project Baru" TIDAK MUNCUL

**Solution:**
1. Cek console (F12) untuk error
2. Hard refresh: Ctrl+Shift+R
3. Cek apakah `userBots.length > 0`
4. Cek localStorage: buka DevTools → Application → localStorage
   - Harus ada key `activeBotId`
   - Harus ada key `token`

### Problem: Modal Muncul tapi tidak bisa Submit

**Solution:**
1. Cek console error
2. Pastikan backend running: http://localhost:5000 (check terminal)
3. Cek network tab: POST request ke `/dashboard/create-bot` error apa?
4. Cek backend logs: ada error apa?

### Problem: Page tidak reload setelah buat project

**Solution:**
1. Cek console: apakah ada `Executing window.location.reload()`?
2. Cek browser: ada popup/alert blocking reload?
3. Cek backend: response 201 OK atau error?

### Problem: Knowledge Base tidak kosong untuk project baru

**Solution:**
1. Cek console: `activeBotId` value berapa?
2. Cek database: `SELECT * FROM "Bot" WHERE id = [botId_baru]`
3. Cek database: `SELECT * FROM "KnowledgeBase" WHERE botId = [botId_baru]`
4. Query harus return 0 rows untuk bot baru

---

## 📸 SCREENSHOT YANG PERLU DISIMPAN

1. **Console saat page load** - verifikasi FetchBots logs
2. **Tombol "+ Tambah Project Baru"** - verifikasi UI muncul
3. **Modal form** - verifikasi modal bisa buka
4. **Console saat submit** - verifikasi logs lengkap
5. **Backend terminal** - verifikasi backend logs
6. **Dropdown setelah reload** - verifikasi project updated
7. **Knowledge Base kosong** - verifikasi isolation
8. **Playground chat** - verifikasi answer = Warung Berkah
9. **Switch project** - verifikasi project switcher
10. **Playground after switch** - verifikasi answer = Kpopmerch

---

## ✅ READY TO TEST!

**Buka browser sekarang ke http://localhost:3000 dan mulai testing!**

Jika ada masalah, share:
1. Screenshot console errors
2. Backend terminal output
3. Network tab screenshot (POST /create-bot)
4. Database query results

**GOOD LUCK! 🚀**
