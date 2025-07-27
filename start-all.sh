#!/bin/bash

echo "🚀 Запуск Crypto Token Analyzer..."
echo ""

# Проверяем, что мы в правильной папке
if [ ! -f "server.py" ] || [ ! -d "backend" ]; then
    echo "❌ Ошибка: Убедитесь, что вы находитесь в папке crypto-token-analyzer"
    exit 1
fi

echo "📦 Проверяем зависимости backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Устанавливаем зависимости..."
    npm install
fi
cd ..

echo ""
echo "🔧 Запускаем backend на порту 3001..."
echo "   (Нажмите Ctrl+C для остановки)"
echo ""

# Запускаем backend в фоне
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Ждем немного, чтобы backend запустился
sleep 2

echo "🌐 Запускаем frontend на порту 8000..."
echo "   Откройте: http://localhost:8000/public/"
echo ""

# Запускаем frontend
python3 server.py &
FRONTEND_PID=$!

echo "✅ Оба сервера запущены!"
echo "   Backend: http://localhost:3001/api/health"
echo "   Frontend: http://localhost:8000/public/"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"

# Ждем сигнала для остановки
trap "echo ''; echo '🛑 Останавливаем серверы...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Ждем завершения
wait
