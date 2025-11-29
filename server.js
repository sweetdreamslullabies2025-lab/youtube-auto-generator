
// server.js - YouTube Auto Generator Backend
const express = require('express');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// ============================================
// КОНФИГУРАЦИЯ КАНАЛА "История у камина"
// ============================================

const channelConfig = {
  id: 'istoriyaukamina',
  name: 'История у камина',
  language: 'ru',
  upload_time: '19:00',
  video_length: { min: 60, max: 120 },
  voice_id: process.env.GENAIPRO_VOICE_ID || 'AeRdCCKzvd23BpJoofzx',
  voice_settings: { speed: 0.9, style: 'calm' },
  keywords: ['истории для сна', 'ASMR', 'историческое', 'рассказ']
};

// ============================================
// API ENDPOINTS
// ============================================

// 1. Главная страница (админ-панель)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. Получить конфиг канала
app.get('/api/channel-config', (req, res) => {
  res.json({
    success: true,
    config: channelConfig,
    timestamp: new Date().toISOString()
  });
});

// 3. Получить статус системы
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'running',
    uptime: process.uptime(),
    node_version: process.version,
    environment: process.env.NODE_ENV
  });
});

// 4. API для генерации видео (вызывается из n8n)
app.post('/api/generate-video', async (req, res) => {
  try {
    const { script, title, description, tags } = req.body;
    
    console.log('🎬 [' + new Date().toISOString() + '] Начинаем генерацию видео');
    console.log('📝 Заголовок:', title);

    // Создаём временную папку
    const tmpDir = path.join(__dirname, 'tmp', Date.now().toString());
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    console.log('✅ Временная папка создана:', tmpDir);
    console.log('✅ [' + new Date().toISOString() + '] Видео инициализировано');

    res.json({
      success: true,
      message: 'Видео начало генерироваться',
      videoId: Date.now(),
      tmpDir: tmpDir,
      estimatedTime: '15-30 минут'
    });

  } catch (error) {
    console.error('❌ Ошибка при генерации видео:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 5. API для проверки здоровья приложения
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 6. API для получения истории видео
app.get('/api/videos-history', (req, res) => {
  res.json({
    success: true,
    videos: [],
    total: 0
  });
});

// ============================================
// ОБРАБОТЧИКИ ОШИБОК
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint не найден',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Глобальная ошибка:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 YouTube Auto Generator Server запущен');
  console.log('='.repeat(60));
  console.log('📺 Канал:', channelConfig.name);
  console.log('⏰ Время публикации:', channelConfig.upload_time, 'GMT');
  console.log('📝 Язык:', channelConfig.language);
  console.log('🌐 URL:', `http://localhost:${PORT}`);
  console.log('📊 Статус:', `http://localhost:${PORT}/api/status`);
  console.log('='.repeat(60) + '\n');

  notifyTelegram('✅ YouTube Auto Generator запущен и готов!');
});

// ============================================
// ФУНКЦИИ
// ============================================

async function notifyTelegram(message) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не установлен');
    return;
  }

  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || '';

    if (!chatId) {
      console.log('⚠️ TELEGRAM_CHAT_ID не установлен');
      return;
    }

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }
    );

    console.log('📱 Telegram сообщение отправлено');
  } catch (error) {
    console.error('❌ Ошибка при отправке Telegram:', error.message);
  }
}

module.exports = app;
                