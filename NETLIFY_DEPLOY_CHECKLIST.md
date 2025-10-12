# ✅ Netlify Deployment Checklist

## 🔧 PayPal Environment Variables

Убедитесь что все 3 переменные добавлены в Netlify Dashboard:

### Проверьте в: Site configuration → Environment variables

```
✅ PAYPAL_CLIENT_ID
   Value: AcGq4K7pDqR6xZHMWDo5Q7wZJJN4jYzW2zLVxX7cGvGnOC8JYm4lXOy2gzgzJzQ5OzKnKzNzKzMzLzI

✅ PAYPAL_SECRET
   Value: ELtwjJWFUXLMHbKu9eFNXhtgrmmvzokC2Jh_vqUh453jBnseTCxiSkPFAAZsoAm66j2z-Io8y3Rz-Vcx

✅ PAYPAL_API_URL
   Value: https://api-m.sandbox.paypal.com
```

## 🚨 ВАЖНО: PAYPAL_API_URL

После последнего фикса код **больше не содержит** никаких hardcoded PayPal значений.

Это означает что **PAYPAL_API_URL ОБЯЗАТЕЛЬНО** должен быть установлен в переменных окружения Netlify!

Если эта переменная не установлена, PayPal не будет работать.

## 📋 Полный список всех переменных окружения

Убедитесь что установлены ВСЕ переменные:

```
1. OPENAI_API_KEY           - ваш OpenAI ключ
2. STRIPE_SECRET_KEY        - ваш Stripe secret key
3. STRIPE_PUBLISHABLE_KEY   - ваш Stripe publishable key
4. PAYPAL_CLIENT_ID         - PayPal sandbox client ID (см. выше)
5. PAYPAL_SECRET            - PayPal sandbox secret (см. выше)
6. PAYPAL_API_URL           - PayPal API URL (см. выше)
7. GIST_ID                  - ваш GitHub Gist ID
8. GITHUB_TOKEN             - ваш GitHub Personal Access Token
```

## 🔍 Как проверить переменные в Netlify

1. Откройте https://app.netlify.com/
2. Выберите ваш сайт
3. **Site configuration** → **Environment variables**
4. Проверьте что все 8 переменных присутствуют
5. Особенно проверьте **PAYPAL_API_URL** - она должна быть там!

## 🚀 После проверки

1. Если все переменные на месте - просто подождите автоматического деплоя
2. Или нажмите **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## ✅ Ожидаемый результат

После успешного деплоя:
- ✅ Build пройдет без ошибок secrets scanning
- ✅ Site будет успешно опубликован
- ✅ PayPal интеграция будет работать
- ✅ При клике на "Unlock full report" покажется выбор: Stripe или PayPal

## 🐛 Если все еще не работает

Проверьте лог деплоя на наличие:
- "Secrets scanning found secrets" - значит где-то еще остались hardcoded значения
- "PAYPAL_API_URL is not defined" - значит переменная не установлена в Netlify
- Build успешен, но PayPal не работает - проверьте Function logs в Netlify

---

**Последнее обновление:** Убраны все hardcoded PayPal значения из кода
**Commit:** Fix: Remove PAYPAL_API_URL default value to pass Netlify secrets scanning

