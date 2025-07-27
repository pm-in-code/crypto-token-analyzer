const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const stripe = require('stripe');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API ключи из переменных окружения
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Инициализация Stripe
const stripeClient = stripe(STRIPE_SECRET_KEY);

// Проверка наличия API ключей
if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY не найден в переменных окружения!');
  console.log('📝 Создайте файл .env в папке backend/ и добавьте:');
  console.log('OPENAI_API_KEY=ваш_ключ_здесь');
  process.exit(1);
}

if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY не найден. Платежи будут недоступны.');
}

// Маршрут для анализа токенов
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenName, prompt } = req.body;

    if (!tokenName || !prompt) {
      return res.status(400).json({
        error: 'Необходимо указать tokenName и prompt'
      });
    }

    console.log(`🔍 Анализируем токен: ${tokenName}`);

    // Запрос к OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
              body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Analyze the cryptocurrency token: ${tokenName}\n\n${prompt}`
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Ошибка OpenAI API:', data);
      return res.status(response.status).json({
        error: 'Ошибка при обращении к OpenAI API',
        details: data.error?.message || 'Неизвестная ошибка'
      });
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log(`✅ Анализ завершен для токена: ${tokenName}`);
      res.json({
        success: true,
        token: tokenName,
        analysis: data.choices[0].message.content,
        usage: data.usage
      });
    } else {
      throw new Error('Неожиданный формат ответа от OpenAI');
    }

  } catch (error) {
    console.error('❌ Ошибка сервера:', error.message);
    res.status(500).json({
      error: 'Внутренняя ошибка сервера',
      details: error.message
    });
  }
});

// Маршрут для проверки здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    openai_configured: !!OPENAI_API_KEY,
    stripe_configured: !!STRIPE_SECRET_KEY
  });
});

// Stripe endpoints
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: 'Stripe не настроен'
      });
    }

    const { amount = 999 } = req.body; // $9.99 в центах

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        report_type: 'premium_crypto_analysis'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });

  } catch (error) {
    console.error('❌ Ошибка создания Payment Intent:', error);
    res.status(500).json({
      error: 'Ошибка при создании платежа',
      details: error.message
    });
  }
});

app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: 'Необходимо указать paymentIntentId'
      });
    }

    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        message: 'Платеж успешно завершен'
      });
    } else {
      res.status(400).json({
        error: 'Платеж не завершен',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('❌ Ошибка подтверждения платежа:', error);
    res.status(500).json({
      error: 'Ошибка при подтверждении платежа',
      details: error.message
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Backend-прокси запущен на порту ${PORT}`);
  console.log(`🔐 OpenAI API ключ: ${OPENAI_API_KEY ? '✅ Настроен' : '❌ Не найден'}`);
  console.log(`💳 Stripe API ключ: ${STRIPE_SECRET_KEY ? '✅ Настроен' : '❌ Не найден'}`);
  console.log(`📡 CORS включен для фронтенда`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
