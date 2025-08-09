# 🚀 Инструкции по развертыванию

## 🔐 Безопасная публикация на GitHub Pages

### Вариант 1: Backend на отдельном сервере (Рекомендуемый)

#### 1. Настройка Backend на Vercel/Railway/Heroku

1. **Создайте аккаунт на Vercel** (бесплатно): https://vercel.com
2. **Подключите ваш GitHub репозиторий**
3. **Настройте переменные окружения в Vercel:**
   - `OPENAI_API_KEY` = ваш ключ OpenAI
   - `STRIPE_SECRET_KEY` = ваш ключ Stripe (если используете)
   - `STRIPE_PUBLISHABLE_KEY` = ваш публичный ключ Stripe

#### 2. Обновите frontend для использования нового backend URL

В файле `app.js` замените:
```javascript
const BACKEND_API_URL = 'http://localhost:3001';
```

На:
```javascript
const BACKEND_API_URL = 'https://your-backend-url.vercel.app';
```

#### 3. Публикация на GitHub Pages

1. **Сделайте репозиторий публичным**
2. **Перейдите в Settings → Pages**
3. **Выберите Source: Deploy from a branch**
4. **Выберите branch: main, folder: / (root)**
5. **Нажмите Save**

### Вариант 2: Использование Netlify Functions

#### 1. Создайте Netlify проект

1. **Создайте аккаунт на Netlify** (бесплатно): https://netlify.com
2. **Подключите ваш GitHub репозиторий**
3. **Создайте папку `netlify/functions/` в корне проекта**

#### 2. Создайте serverless функцию

Создайте файл `netlify/functions/analyze-token.js`:
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Ваш код анализа токена здесь
  // Используйте process.env.OPENAI_API_KEY
};
```

#### 3. Настройте переменные окружения в Netlify

В Netlify Dashboard → Site settings → Environment variables:
- `OPENAI_API_KEY` = ваш ключ OpenAI

### Вариант 3: Использование Cloudflare Workers

#### 1. Создайте Cloudflare Workers проект

1. **Создайте аккаунт на Cloudflare** (бесплатно)
2. **Создайте новый Worker**
3. **Настройте переменные окружения в Cloudflare**

#### 2. Разверните backend как Worker

Создайте файл `wrangler.toml`:
```toml
name = "crypto-analyzer-backend"
main = "src/index.js"

[vars]
OPENAI_API_KEY = "your-key-here"
```

## 🔒 Безопасность

### ✅ Что НЕ публиковать:
- `.env` файлы
- API ключи в коде
- `config.js` с секретами
- `secrets.js` файлы

### ✅ Что можно публиковать:
- Frontend код (HTML, CSS, JS)
- `env.example` файлы
- Документацию
- README.md

## 📝 Шаги для публикации

1. **Создайте файл `.env` локально** (не коммитьте его):
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. **Разверните backend** на Vercel/Netlify/Cloudflare

3. **Обновите URL backend** в frontend коде

4. **Сделайте репозиторий публичным**

5. **Настройте GitHub Pages**

## 🎯 Результат

- ✅ Frontend на GitHub Pages (бесплатно)
- ✅ Backend на отдельном сервере
- ✅ API ключи защищены
- ✅ Проект полностью функционален

## 🆘 Если что-то не работает

1. **Проверьте переменные окружения** на сервере
2. **Проверьте CORS настройки** в backend
3. **Проверьте URL backend** в frontend
4. **Проверьте консоль браузера** на ошибки 