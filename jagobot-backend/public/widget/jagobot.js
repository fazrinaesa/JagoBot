(function () {
  // 1. AMBIL DATA ATTRIBUT DARI SCRIPT YANG DI-INJECT KLIEN
  const scriptTag = document.currentScript;
  const botId = scriptTag.getAttribute('data-bot-id');

  if (!botId) {
    console.error('JagoBot Widget Error: Atribut data-bot-id tidak ditemukan!');
    return;
  }

  // CONFIGURATION URL BACKEND
  const BACKEND_URL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? 'https://jago-bot-upla.vercel.app'
    : 'http://localhost:5000';

  // 2. INJECT CSS LANGSUNG LEWAT JAVASCRIPT
  const style = document.createElement('style');
  style.innerHTML = `
    #jagobot-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #jagobot-floating-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #1800ad;
      box-shadow: 0 4px 12px rgba(24, 0, 173, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }
    #jagobot-floating-button:hover {
      transform: scale(1.05);
    }
    #jagobot-floating-button svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: white;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    #jagobot-chatbox {
      display: none;
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 360px;
      height: 500px;
      background-color: #0d0e12;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      flex-direction: column;
      overflow: hidden;
      animation: jagoFadeIn 0.2s ease-out;
    }
    @keyframes jagoFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .jagobot-header {
      background-color: #1800ad;
      color: white;
      padding: 16px;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .jagobot-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .jago-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.4;
    }
    .jago-msg.user {
      background-color: #1800ad;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 2px;
    }
    .jago-msg.bot {
      background-color: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      align-self: flex-start;
      border-bottom-left-radius: 2px;
    }
    .jagobot-input-area {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      gap: 8px;
      background-color: #07080a;
    }
    .jagobot-input-area input {
      flex: 1;
      background-color: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 12px;
      color: white;
      font-size: 13px;
      outline: none;
    }
    .jagobot-input-area input:focus {
      border-color: #1800ad;
    }
    .jagobot-input-area button {
      background-color: #1800ad;
      border: none;
      color: white;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      font-size: 12px;
    }
    .jagobot-input-area button:hover {
      background-color: #13008a;
    }
  `;
  document.head.appendChild(style);

  // 3. BUAT STRUKTUR DOM KOTAK CHAT DAN FLOATING BUTTON
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'jagobot-widget-container';

  widgetContainer.innerHTML = `
    <div id="jagobot-floating-button">
      <svg viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>

    <div id="jagobot-chatbox">
      <div class="jagobot-header">
        <span>JagoAI Chat Assistant</span>
        <span id="jagobot-close" style="cursor:pointer; font-size: 18px;">&times;</span>
      </div>
      <div class="jagobot-messages" id="jagobot-messages-container">
        <div class="jago-msg bot">Halo! Ada yang bisa saya bantu hari ini?</div>
      </div>
      <div class="jagobot-input-area">
        <input type="text" id="jagobot-input-field" placeholder="Ketik pesan Anda..." autocomplete="off" />
        <button id="jagobot-send-btn">Kirim</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 4. LOGIKA INTERAKSI TOMBOL (BUKA/TUTUP)
  const floatingButton = document.getElementById('jagobot-floating-button');
  const chatbox = document.getElementById('jagobot-chatbox');
  const closeButton = document.getElementById('jagobot-close');
  const sendButton = document.getElementById('jagobot-send-btn');
  const inputField = document.getElementById('jagobot-input-field');
  const messagesContainer = document.getElementById('jagobot-messages-container');

  floatingButton.addEventListener('click', () => {
    chatbox.style.display = chatbox.style.display === 'flex' ? 'none' : 'flex';
  });

  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    chatbox.style.display = 'none';
  });

  // 5. LOGIKA FUNGSI KIRIM PESAN KE API PUBLIC BACKEND
  async function sendMessage() {
    const messageText = inputField.value.trim();
    if (!messageText) return;

    // Tampilkan pesan User di chatbox
    appendMessage(messageText, 'user');
    inputField.value = '';

    // Tampilkan placeholder loading untuk Bot
    const loadingId = 'jago-loading-' + Date.now();
    appendMessage('Sedang mengetik...', 'bot', loadingId);

    try {
      // Fetch data ke API Public 
      const response = await fetch(`${BACKEND_URL}/api/public/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          botId: botId,
          message: messageText
        })
      });

      const data = await response.json();

      // Hapus loading text
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();

      // Tampilkan balasan AI resmi dari backend
      if (data && data.reply) {
        appendMessage(data.reply, 'bot');
      } else {
        appendMessage('Maaf, sistem sedang mengalami kendala. Coba lagi nanti.', 'bot');
      }

    } catch (error) {
      console.error('Widget Chat Error:', error);
      const loadingEl = document.getElementById(loadingId);
      if (loadingEl) loadingEl.remove();
      appendMessage('Gagal terhubung ke server JagoBot.', 'bot');
    }
  }

  function appendMessage(text, sender, id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('jago-msg', sender);
    if (id) msgDiv.id = id;
    msgDiv.innerText = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Trigger klik button kirim atau tekan Enter
  sendButton.addEventListener('click', sendMessage);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

})();