#!/bin/bash

echo "🚀 Подготовка к деплою на Vercel..."

# Проверяем наличие Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 Устанавливаем Vercel CLI..."
    npm install -g vercel
fi

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создайте файл .env с вашими API ключами:"
    echo "OPENAI_API_KEY=sk-your-key-here"
    echo "STRIPE_SECRET_KEY=sk_test_your-stripe-key"
    echo "STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key"
    exit 1
fi

# Проверяем, что мы в правильной директории
if [ ! -d "vercel-backend" ]; then
    echo "❌ Папка vercel-backend не найдена!"
    echo "Убедитесь, что вы находитесь в корне проекта"
    exit 1
fi

echo "✅ Все проверки пройдены!"

# Переходим в папку backend
cd vercel-backend

echo "🔧 Настройка backend для Vercel..."

# Проверяем зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi

echo "🚀 Готово к деплою!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Выполните: vercel login"
echo "2. Выполните: vercel"
echo "3. Следуйте инструкциям в терминале"
echo "4. После деплоя получите URL backend"
echo "5. Обновите BACKEND_API_URL в app.js"
echo ""
echo "🔗 Или используйте веб-интерфейс Vercel:"
echo "1. Перейдите на https://vercel.com"
echo "2. Подключите GitHub репозиторий"
echo "3. Root Directory: vercel-backend"
echo "4. Добавьте переменные окружения"
echo "5. Deploy" 