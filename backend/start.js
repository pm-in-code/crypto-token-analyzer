#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск Crypto Analyzer Backend...');

// Проверяем наличие .env файла
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ Файл .env не найден!');
  console.log('📝 Создайте файл .env с вашим OpenAI API ключом');
  process.exit(1);
}

// Запускаем сервер
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`\n🔚 Сервер остановлен с кодом: ${code}`);
  process.exit(code);
});

// Обработка сигналов для корректного завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, останавливаем сервер...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, останавливаем сервер...');
  server.kill('SIGTERM');
});
