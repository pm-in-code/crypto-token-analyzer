# ⚡ Быстрый деплой на Vercel

## 🚀 Автоматизированный деплой

### Шаг 1: Запустите автоматический скрипт
```bash
./deploy-to-vercel.sh
```

### Шаг 2: Создайте файл .env (если еще не создан)
```bash
cp env.example .env
# Отредактируйте .env с вашими API ключами
```

### Шаг 3: Деплой через Vercel CLI
```bash
cd vercel-backend
vercel login
vercel
```

## 🌐 Альтернативный способ через веб-интерфейс

### Шаг 1: Подготовка
1. **Создайте файл .env** с вашими API ключами
2. **Запустите скрипт подготовки:**
   ```bash
   ./deploy-to-vercel.sh
   ```

### Шаг 2: Деплой на Vercel.com
1. **Перейдите на [vercel.com](https://vercel.com)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите ваш репозиторий** `crypto-token-analyzer`

### Шаг 3: Настройки проекта
- **Framework Preset**: `Node.js`
- **Root Directory**: `vercel-backend`
- **Build Command**: `npm install`
- **Output Directory**: оставьте **пустым**
- **Install Command**: `npm install`

### Шаг 4: Переменные окружения
Добавьте в Environment Variables:
```
OPENAI_API_KEY=sk-your-openai-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

### Шаг 5: Deploy
Нажмите **"Deploy"** и ждите завершения

## 🔧 После деплоя

### Получите URL backend
После успешного деплоя Vercel даст вам URL вида:
```
https://crypto-token-analyzer-backend.vercel.app
```

### Обновите frontend
В файлах `app.js` и `public/app.js` замените:
```javascript
const BACKEND_API_URL = 'http://localhost:3001/api';
```
На:
```javascript
const BACKEND_API_URL = 'https://your-backend-url.vercel.app/api';
```

### Настройте GitHub Pages
1. **Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: main
4. **Folder**: / (root)
5. **Save**

## ✅ Проверка работоспособности

### Тест backend
```bash
curl https://your-backend-url.vercel.app/api/health
```

### Тест frontend
Откройте GitHub Pages URL и протестируйте анализ токена

## 🆘 Если что-то не работает

### Ошибка деплоя
1. **Проверьте переменные окружения** в Vercel
2. **Убедитесь, что Root Directory**: `vercel-backend`
3. **Проверьте логи** в Vercel Dashboard

### Ошибка CORS
1. **Проверьте URL backend** в frontend
2. **Убедитесь, что backend отвечает** на `/api/health`

### Ошибка API
1. **Проверьте OPENAI_API_KEY** в Vercel
2. **Проверьте лимиты** OpenAI API

## 🎯 Результат

После успешного деплоя у вас будет:
- ✅ **Backend**: `https://your-backend.vercel.app`
- ✅ **Frontend**: `https://your-username.github.io/crypto-token-analyzer`
- ✅ **Полностью рабочий проект** с защищенными API ключами 