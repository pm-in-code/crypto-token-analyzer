# 💳 Stripe Integration Setup

## 🚀 **Что добавлено:**

### **Backend:**
- ✅ **Stripe SDK** установлен
- ✅ **Payment Intent API** для создания платежей
- ✅ **Endpoints** для обработки платежей
- ✅ **Webhook support** для подтверждения платежей

### **Frontend:**
- ✅ **Stripe.js** подключен
- ✅ **Кнопка "Premium Report"** с анимацией
- ✅ **Модальное окно** для оплаты
- ✅ **Форма оплаты** с Stripe Elements
- ✅ **Обработка платежей** и статусов

## 🔧 **Настройка Stripe:**

### **1. Получите API ключи:**
1. Войдите в [Stripe Dashboard](https://dashboard.stripe.com/)
2. Перейдите в **Developers → API keys**
3. Скопируйте:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...)

### **2. Обновите .env файл:**
```bash
cd backend
```

Добавьте в файл `.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### **3. Перезапустите backend:**
```bash
cd backend
node server.js
```

## 🧪 **Тестирование:**

### **1. Запустите приложение:**
```bash
python3 server.py
```

### **2. Протестируйте анализ:**
1. Откройте: `http://localhost:8000/public/`
2. Введите токен (например: "Bitcoin")
3. Нажмите "Scan"
4. Дождитесь результата

### **3. Протестируйте премиум отчет:**
1. Нажмите **"Premium Report - $9.99"**
2. Должно открыться модальное окно оплаты
3. Введите тестовые данные карты:
   - **Номер:** 4242 4242 4242 4242
   - **Дата:** Любая будущая дата
   - **CVC:** Любые 3 цифры
   - **ZIP:** Любые 5 цифр

### **4. Проверьте результат:**
- ✅ Платеж должен пройти успешно
- ✅ PDF должен скачаться с именем `premium-crypto-analysis-...`
- ✅ В заголовке PDF должно быть "Premium Crypto Token Analysis Report"

## 🎯 **Функциональность:**

### **Кнопки:**
- **"Download Free Report"** - бесплатный PDF
- **"Premium Report - $9.99"** - платный PDF с оплатой
- **"Check another token"** - новый анализ

### **Цена:**
- 💰 **$9.99** за премиум отчет
- 💳 **Stripe** обработка платежей
- 🔒 **Безопасная** оплата

### **Премиум функции:**
- 📊 **Enhanced analysis** с дополнительными метриками
- 💡 **Detailed investment recommendations**
- ⚠️ **Risk assessment breakdown**
- 📈 **Market trend analysis**

## 🔍 **Отладка:**

### **Проверьте backend:**
```bash
curl http://localhost:3001/api/health
```

Должно показать:
```json
{
  "status": "OK",
  "openai_configured": true,
  "stripe_configured": true
}
```

### **Проверьте Stripe:**
```bash
curl -X POST http://localhost:3001/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 999}'
```

### **Логи backend:**
Следите за логами в терминале backend для ошибок Stripe.

## 🚨 **Возможные проблемы:**

### **1. "Stripe не настроен":**
- Проверьте `.env` файл
- Убедитесь, что ключи правильные
- Перезапустите backend

### **2. "Ошибка создания платежа":**
- Проверьте Stripe ключи
- Убедитесь, что аккаунт активен
- Проверьте логи backend

### **3. "Ошибка платежа":**
- Используйте тестовые карты
- Проверьте данные карты
- Убедитесь, что Stripe.js загружен

## 📝 **Тестовые карты Stripe:**

### **Успешные платежи:**
- **4242 4242 4242 4242** - Visa
- **4000 0000 0000 0002** - Visa (declined)
- **4000 0000 0000 9995** - Visa (declined)

### **3D Secure:**
- **4000 0000 0000 3220** - 3D Secure 2 authentication

### **Другие карты:**
- **5555 5555 5555 4444** - Mastercard
- **3782 822463 10005** - American Express

## 🎉 **Готово!**

После настройки Stripe у вас будет полноценная система оплаты для премиум отчетов!

---

**Нужна помощь с настройкой?** 💳✨ 