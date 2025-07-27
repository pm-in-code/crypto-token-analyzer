# 🚀 GitHub Repository Setup

## 📋 **Шаги для создания приватного репозитория:**

### **1. Создание репозитория на GitHub**

1. **Перейдите на GitHub**: https://github.com
2. **Войдите в аккаунт** (или создайте новый)
3. **Нажмите "+"** в правом верхнем углу
4. **Выберите "New repository"**

### **2. Настройка репозитория**

**Заполните форму:**
- **Repository name**: `crypto-token-analyzer`
- **Description**: `AI-Powered Cryptocurrency Analysis Platform with Premium Reports`
- **Visibility**: ✅ **Private** (важно!)
- **Initialize**: ❌ НЕ ставьте галочки (у нас уже есть код)

### **3. Создание репозитория**

Нажмите **"Create repository"**

### **4. Копирование URL**

После создания репозитория скопируйте URL. Он будет выглядеть так:
```
https://github.com/YOUR_USERNAME/crypto-token-analyzer.git
```

### **5. Добавление remote и push**

Вернитесь в терминал и выполните команды:

```bash
# Добавить remote (замените YOUR_USERNAME на ваше имя пользователя)
git remote add origin https://github.com/YOUR_USERNAME/crypto-token-analyzer.git

# Переименовать ветку в main (если нужно)
git branch -M main

# Запушить код
git push -u origin main
```

### **6. Проверка**

Перейдите на страницу репозитория и убедитесь, что:
- ✅ Все файлы загружены
- ✅ Репозиторий приватный
- ✅ README.md отображается корректно

## 🔐 **Безопасность**

### **Важные моменты:**

1. **Приватный репозиторий** - API ключи не будут видны публично
2. **Файл .env НЕ загружен** - содержит секретные ключи
3. **.gitignore настроен** - исключает ненужные файлы

### **Что НЕ загружается в Git:**
- `backend/.env` - содержит API ключи
- `node_modules/` - зависимости
- `__pycache__/` - кэш Python
- `.DS_Store` - системные файлы

## 📁 **Структура репозитория**

После загрузки в репозитории будет:

```
crypto-token-analyzer/
├── 📄 README.md              # Подробное описание проекта
├── 📄 .gitignore             # Исключения для Git
├── 📁 public/                # Фронтенд файлы
│   ├── 📄 index.html        # Главная страница
│   ├── 📄 app.js           # React приложение
│   └── 📄 favicon.ico      # Иконка
├── 📁 backend/               # Node.js бэкенд
│   ├── 📄 server.js         # Express сервер
│   ├── 📄 package.json      # Зависимости
│   └── 📄 package-lock.json # Версии зависимостей
├── 📄 server.py             # Python HTTP сервер
├── 📄 start-all.sh          # Скрипт запуска
├── 📄 start-backend.sh      # Скрипт бэкенда
├── 📄 start.sh              # Скрипт фронтенда
└── 📁 docs/                  # Документация
    ├── 📄 STRIPE_FIX.md     # Исправления Stripe
    ├── 📄 CATEGORIES_FIX.md # Исправления категорий
    └── 📄 PDF_IMPROVEMENTS.md # Улучшения PDF
```

## 🚀 **Следующие шаги**

### **После создания репозитория:**

1. **Клонирование на других устройствах:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/crypto-token-analyzer.git
   ```

2. **Настройка окружения:**
   ```bash
   cd crypto-token-analyzer
   cd backend
   npm install
   # Создать .env файл с API ключами
   ```

3. **Запуск приложения:**
   ```bash
   ./start-all.sh
   ```

## 🔧 **Полезные команды Git**

```bash
# Проверить статус
git status

# Посмотреть изменения
git diff

# Добавить изменения
git add .

# Создать коммит
git commit -m "Описание изменений"

# Запушить изменения
git push

# Получить изменения с GitHub
git pull

# Посмотреть историю коммитов
git log --oneline
```

## 📞 **Поддержка**

Если возникли проблемы:

1. **Проверьте права доступа** к репозиторию
2. **Убедитесь, что репозиторий приватный**
3. **Проверьте, что .env файл НЕ загружен**
4. **Создайте issue** в репозитории для вопросов

---

**🎉 Поздравляем! Ваш проект теперь в безопасном приватном репозитории!** 