# 🧪 TESTING GUIDE - Multi-Project Bot Feature dengan DEBUG LOGGING

## ✅ Servers Status
- ✅ Backend running: http://localhost:5000
- ✅ Frontend running: http://localhost:3000

---

## 🔍 Console Logging yang Telah Ditambahkan

### Frontend Logs (Buka DevTools dengan F12)

#### 1. DashboardLayout.tsx - saat page load
```
🔵 [FetchBots] Fetching user bots...
🟢 [FetchBots] Response: {...}
🟢 [FetchBots] Bots count: 1
🟢 [FetchBots] Bots data: [...]
```

#### 2. saat klik "+ Tambah Project Baru"
```
🔵 [CreateBot] Mulai membuat project dengan nama: Warung Berkah
🔵 [CreateBot] Mengirim request ke /api/dashboard/create-bot
📤 [API] Sending POST /dashboard/create-bot with nama_bot: Warung Berkah
```

#### 3. saat backend respond
```
📥 [API] Received response from /dashboard/create-bot: {...}
🟢 [CreateBot] Response dari backend: {...}
🟢 [CreateBot] Response data: {...}
🟢 [CreateBot] Bot object: {id: 5, nama_bot: "Warung Berkah", ...}
🟢 [CreateBot] New Bot ID extracted: 5
🟢 [CreateBot] Menyimpan ke localStorage dengan key 'activeBotId': 5
🟢 [CreateBot] Modal ditutup, menunggu 500ms sebelum reload...
🟢 [CreateBot] Executing window.location.reload()
```

#### 4. KnowledgeBase.tsx - saat page load
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

#### 5. ChatbotPlayground.tsx - saat kirim pesan
```
═══════════════════════════════════════════════════════
💬 [Playground] Sending message
👤 User from localStorage: {...}
🔑 Stored activeBotId: 5
🤖 Numeric activeBotId: 5
✅ Bot ID valid, proceeding with message...
💭 Message content: Berapa harga kopi?
═══════════════════════════════════════════════════════

📤 [Playground] Sending request to /api/chat/send
📦 Request payload: {botId: 5, customerName: "...", message: "Berapa harga kopi?"}
📥 [Playground] Response status: 200
📥 [Playground] Response data: {...}
✅ [Playground] Bot response extracted: "Kopi Gayo kami harganya Rp 25.000..."
```

### Backend Logs (Terminal Backend)

#### 1. saat POST /api/dashboard/create-bot
```
═══════════════════════════════════════════════════════
🟦 [Backend] CreateBot Request Received
═══════════════════════════════════════════════════════
👤 User ID dari Token: 1
🏷️  Bot Name dari Request Body: Warung Berkah
📦 Full Request Body: {nama_bot: "Warung Berkah"}
✅ Validasi nama bot OK, creating bot in database...
✅ Bot created successfully in database
🔑 New Bot ID: 5
📋 New Bot Data: {id: 5, userId: 1, nama_bot: "Warung Berkah", ...}
📤 Sending response: {message: "Bot berhasil dibuat", data: {...}, id: 5}
═══════════════════════════════════════════════════════
```

#### 2. saat POST /api/chat/send
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

---

## 🧪 STEP-BY-STEP TESTING INSTRUCTIONS

### PRE-TEST CHECKLIST
- [ ] Sudah login ke aplikasi
- [ ] Project "Kpopmerch" sudah ada dengan knowledge base
- [ ] Browser DevTools terbuka (F12)
- [ ] Terminal backend & frontend visible

### TEST STEP 1: Verify Current Project

1. **Open http://localhost:3000 di browser**
2. **Buka DevTools (F12) → Console tab**
3. **Lihat di browser:**
   - Dropdown project harus menampilkan project list
   - HARUS muncul tombol **"+ Tambah Project Baru"** (ada 2 tempat):
     - Di navbar samping dropdown project selector
     - Di profile menu dropdown

**✅ CHECKPOINT:** Tombol "+" muncul di kedua lokasi?

---

### TEST STEP 2: Create New Project "Warung Berkah"

1. **Klik tombol "+ Tambah Project Baru"**
   - Di navbar ATAU di profile dropdown
2. **Modal harus muncul dengan:**
   - Title: "Buat Project Baru"
   - Label: "Nama Project"
   - Input field kosong, fokus otomatis
3. **Di Console (F12), harus lihat log:**
   ```
   🔵 [CreateBot] Mulai membuat project dengan nama: ...
   ```

---

### TEST STEP 3: Input Nama Project

1. **Ketik di input field:** `Warung Berkah`
2. **Klik button "Buat Project"**
3. **Observe Console Logs:**
   ```
   📤 [API] Sending POST /dashboard/create-bot with nama_bot: Warung Berkah
   ```
4. **Observe Backend Terminal:**
   ```
   🟦 [Backend] CreateBot Request Received
   👤 User ID dari Token: ...
   🏷️  Bot Name dari Request Body: Warung Berkah
   ✅ Bot created successfully in database
   🔑 New Bot ID: 5 (atau ID baru lainnya)
   ```

---

### TEST STEP 4: Verify Reload & Project Switch

1. **Button harus show "Membuat..." dengan loading spinner**
2. **Dalam 500-800ms, page harus reload otomatis**
3. **Observe Console:**
   ```
   🟢 [CreateBot] Executing window.location.reload()
   ```
4. **Setelah reload, dropdown project harus:**
   - Menampilkan "Warung Berkah" **pilihan** (selected)
   - Di list juga ada "Kpopmerch"

**✅ CHECKPOINT:** Project berhasil dibuat dan dropdown terupdate?

---

### TEST STEP 5: Verify Knowledge Base Isolation

1. **Navigate ke: http://localhost:3000/dashboard/knowledge**
2. **Lihat di Console:**
   ```
   📄 [KnowledgeBase] Loading knowledge base
   activeBotId from localStorage: 5
   📂 Files count: 0
   ```
3. **Halaman harus KOSONG** (tidak ada dokumen)
   - Ini membuktikan bot baru terisolasi!
4. **Klik "+ Tambah" button**
5. **Upload file atau masukkan text manual tentang "Menu Kopi Gayo"**

---

### TEST STEP 6: Verify Chat Isolation

1. **Navigate ke: http://localhost:3000/dashboard/playground**
2. **Lihat di Console saat page load:**
   ```
   🔵 [Playground] Sending message
   🔑 Stored activeBotId: 5
   🤖 Numeric activeBotId: 5
   ```
3. **Ketik pertanyaan:** `Berapa harga kopi?`
4. **Klik Send/kirim**
5. **Lihat di Console:**
   ```
   📤 [Playground] Sending request to /api/chat/send
   📦 Request payload: {botId: 5, ...}
   ```
6. **Lihat di Backend Terminal:**
   ```
   💬 [Backend] Chat Request Received
   🤖 Bot ID: 5
   📚 Fetching knowledge base for bot...
   📂 Knowledge Base count: 1
   ```
7. **Bot harus answer berdasarkan "Warung Berkah" knowledge base**

---

### TEST STEP 7: Verify Project Switcher

1. **Buka project selector dropdown di navbar**
2. **Pilih "Kpopmerch"**
3. **Page harus loading dengan text "Berpindah Project..."**
4. **Setelah reload, di Console harus lihat:**
   ```
   🔵 [FetchBots] Fetching user bots...
   🟢 [FetchBots] Active bot already set: 1 (Kpopmerch ID)
   ```
5. **Navigate ke Knowledge Base:**
   ```
   🔑 Stored activeBotId: 1
   📂 Files count: 3 (atau sesuai Kpopmerch knowledge)
   ```
   - Harus menampilkan dokumen Kpopmerch (bukan Warung Berkah)

---

### TEST STEP 8: Switch Back to Warung Berkah

1. **Buka project selector dropdown**
2. **Pilih "Warung Berkah"**
3. **Page reload**
4. **Navigate ke Knowledge Base:**
   ```
   🔑 Stored activeBotId: 5
   📂 Files count: 1 (Menu Kopi Gayo)
   ```
   - Harus menampilkan dokumen yang baru ditambahkan

5. **Navigate ke Playground:**
6. **Tanya ulang:** `Berapa harga kopi?`
7. **Bot harus answer dengan data Warung Berkah** (bukan Kpopmerch)

---

## ✅ SUCCESS CRITERIA

Jika semua log muncul dengan benar DAN UI muncul sesuai ekspektasi:

- ✅ Tombol "+ Tambah Project Baru" MUNCUL di UI
- ✅ Modal bisa dibuka dan input nama project
- ✅ Backend menerima request dan create bot ke database
- ✅ Frontend receive response dengan correct botId
- ✅ localStorage activeBotId terupdate dengan botId baru
- ✅ Page reload otomatis
- ✅ Project dropdown menampilkan project baru
- ✅ Knowledge Base terisolasi per project
- ✅ Chat/Playground terisolasi per project
- ✅ Project switcher bekerja dengan benar
- ✅ Bot answers berbeda untuk project berbeda

## 🐛 TROUBLESHOOTING

### Tombol "+ Tambah Project Baru" tidak muncul
- Check console: apakah ada error di `useEffect` fetchBots?
- Verifikasi `userBots.length > 0` di kondisional render
- Cek localStorage apakah ada `activeBotId`

### Modal buka tapi tidak bisa submit
- Check console: apakah ada error di `handleCreateBot`?
- Verifikasi API endpoint: `http://localhost:5000/api/dashboard/create-bot`
- Cek token di localStorage

### Page tidak reload setelah buat project
- Check backend logs: apakah response 201 terkirim?
- Verifikasi `window.location.reload()` di handleCreateBot
- Cek browser console: ada error apa?

### Knowledge Base tidak kosong untuk project baru
- Verifikasi di database: apakah bot baru punya botId yang berbeda?
- Check `activeBotId` di localStorage
- Query database: `SELECT * FROM "KnowledgeBase" WHERE botId = [new_bot_id]`

---

## 📝 CONSOLE LOG REFERENCE

Semua console log yang ditambahkan menggunakan emoji prefixes:

- 🔵 = Info/Starting
- 🟢 = Success
- 🟦 = Backend info
- 📤 = Sending request
- 📥 = Receiving response
- ❌ = Error
- 🔴 = Error (backend)
- ✅ = Verified/Done
- 💭 = Message content
- 🤖 = Bot related
- 🔑 = Key/ID
- 📋 = Data fetching
- 📚 = Knowledge base
- 💬 = Chat related
- 📂 = Files/Folders
- ⏱️  = Timing
- 💾 = Database operation

---

## 🎯 Next Steps After Successful Test

1. Bagus! Feature sudah berfungsi 100%
2. Verifikasi real-world usage:
   - Create 3 projects berbeda
   - Add knowledge base yang berbeda untuk setiap project
   - Ask questions di Playground untuk verify isolation
3. Performance check:
   - Monitor response time di browser DevTools
   - Check backend logs untuk query time

---

**INSTRUKSI PENTING:**
- Buka browser ke http://localhost:3000
- Buka DevTools (F12)
- Ikuti testing steps di atas
- Share screenshot console logs yang berhasil jika ada issue
