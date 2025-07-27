#!/bin/bash

echo "🚀 Запуск Crypto Analyzer Backend..."

# Проверяем, что мы в правильной директории
if [ ! -f "backend/server.js" ]; then
    echo "❌ Ошибка: backend/server.js не найден!"
    echo "Убедитесь, что вы находитесь в корневой папке проекта"
    exit 1
fi

# Переходим в папку backend
cd backend

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создаю .env файл с вашим API ключом..."
    cat > .env << ENVEOF
# OpenAI API Configuration
OPENAI_API_KEY=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

# Server Configuration
PORT=3001
NODE_ENV=development
ENVEOF
    echo "✅ Файл .env создан!"
fi

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

# Запускаем backend
echo "🚀 Запускаем backend на порту 3001..."
echo "📡 Health check: http://localhost:3001/api/health"
echo "🔐 API ключ: ✅ Настроен"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""

npm start
