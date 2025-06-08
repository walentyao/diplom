# Система мониторинга и отслеживания ошибок

Полнофункциональная система мониторинга для отслеживания ошибок, производительности и аномалий в веб-приложениях. Проект состоит из нескольких компонентов, работающих вместе для обеспечения полного мониторинга приложений.

## 🏗️ Архитектура проекта

### Компоненты системы:

- **Server** - Основной сервер API для сбора и обработки данных мониторинга
- **Dashboard** - Веб-интерфейс для просмотра статистики, логов и управления системой
- **Client SDK** - JavaScript/TypeScript SDK для фронтенд приложений
- **Backend SDK** - Node.js SDK для серверных приложений

### Стек технологий:

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Sequelize
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Deployment**: Docker, Docker Compose
- **Database**: PostgreSQL 15
- **Monitoring**: Встроенная система алертов и уведомлений

## 🚀 Быстрый запуск

### Предварительные требования

Убедитесь, что у вас установлены:
- [Docker](https://docs.docker.com/get-docker/) (версия 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (версия 2.0+)

### Запуск через Docker Compose (Рекомендуется)

1. **Клонирование и переход в директорию проекта:**
   ```bash
   git clone <your-repo-url>
   cd diplom
   ```

2. **Настройка переменных окружения:**
   ```bash
   # Скопируйте и отредактируйте файл окружения
   cp .env.example .env
   # Отредактируйте .env файл с вашими настройками
   ```

3. **Запуск всех сервисов:**
   ```bash
   # Запуск в development режиме
   docker-compose up -d

   # Или для production
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Проверка статуса сервисов:**
   ```bash
   docker-compose ps
   ```

### Доступ к сервисам

После успешного запуска сервисы будут доступны по адресам:

- **Dashboard (Веб-интерфейс)**: http://localhost:80
- **API Server**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## 🛠️ Ручная установка и запуск

### 1. Установка зависимостей

```bash
# Backend Server
cd server
npm install

# Dashboard
cd ../dashboard
npm install

# Client SDK
cd ../client-sdk
npm install

# Backend SDK
cd ../backend-sdk
npm install
```

### 2. Настройка базы данных

```bash
# Запуск PostgreSQL (используйте Docker или локальную установку)
docker run --name postgres-monitoring \
  -e POSTGRES_DB=error_tracking \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=error_tracking
DB_USER=postgres
DB_PASSWORD=postgres

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# JWT
JWT_SECRET=your_jwt_secret_key_change_in_production

# Email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=example@example.com
SMTP_PASS=secret

# Telegram notifications
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Alert settings
ALERT_CHECK_INTERVAL=60000
ALERT_BATCH_SIZE=1000
```

### 4. Запуск сервисов

```bash
# Запуск сервера (в отдельном терминале)
cd server
npm run dev

# Запуск dashboard (в отдельном терминале)
cd dashboard
npm run dev

# Сборка SDK (если планируете использовать)
cd client-sdk
npm run build

cd ../backend-sdk
npm run build
```

## 📊 Использование

### Первоначальная настройка

1. Откройте веб-интерфейс по адресу http://localhost:80
2. Создайте административный аккаунт
3. Настройте правила алертов и уведомлений
4. Интегрируйте SDK в ваши приложения

### Интеграция SDK

#### Для фронтенд приложений:

```javascript
import { MonitoringSDK } from '@monitoring/sdk';

const monitoring = new MonitoringSDK({
  apiUrl: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
});

// Автоматическое отслеживание ошибок
monitoring.init();

// Ручная отправка ошибок
monitoring.captureError(new Error('Something went wrong'));
```

#### Для Node.js приложений:

```javascript
const { MonitoringClient } = require('@monitoring/sdk-backend');

const client = new MonitoringClient({
  apiUrl: 'http://localhost:3000/api',
  apiKey: 'your-api-key'
});

// Middleware для Express
app.use(client.middleware());
```

## 🔧 Разработка

### Структура проекта

```
diplom/
├── server/                 # Backend API сервер
│   ├── src/
│   │   ├── controllers/   # Контроллеры API
│   │   ├── models/        # Модели данных
│   │   ├── routes/        # Маршруты API
│   │   ├── services/      # Бизнес-логика
│   │   └── utils/         # Утилиты
│   └── package.json
├── dashboard/             # React веб-интерфейс
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   └── api.ts         # API клиент
│   └── package.json
├── client-sdk/            # JavaScript SDK
│   └── src/
├── backend-sdk/           # Node.js SDK
│   └── src/
└── docker-compose.yml     # Docker конфигурация
```

### Запуск в режиме разработки

```bash
# Запуск всех сервисов в режиме разработки
docker-compose up

# Или запуск отдельных сервисов:
cd server && npm run dev
cd dashboard && npm run dev
```

### Тестирование

```bash
# Тестирование серверного кода
cd server
npm test

# Линтинг dashboard
cd dashboard
npm run lint
```

## 📝 API Документация

### Основные эндпоинты:

- `POST /api/auth/login` - Авторизация
- `POST /api/logs` - Отправка логов
- `GET /api/logs` - Получение логов
- `POST /api/events` - Отправка событий
- `GET /api/stats` - Получение статистики
- `POST /api/alerts` - Создание правил алертов

### Аутентификация

API использует JWT токены для аутентификации. Для получения токена используйте эндпоинт `/api/auth/login`.

## 🔒 Безопасность

- Все пароли хэшируются с использованием Argon2
- JWT токены для аутентификации
- CORS настроен для безопасного взаимодействия
- Валидация входных данных на уровне API

## 📧 Уведомления

Система поддерживает уведомления через:
- Email (SMTP)
- Telegram Bot
- Webhook уведомления

## 🐛 Отладка

### Просмотр логов

```bash
# Логи всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs app
docker-compose logs dashboard
```

### Подключение к базе данных

```bash
# Подключение к PostgreSQL
docker-compose exec postgres psql -U postgres -d error_tracking
```

## 📈 Производительность

- Система обрабатывает до 1000 событий в пакете
- Автоматическая агрегация данных
- Индексирование критичных полей в БД
- Сжатие статических ресурсов

## 🔄 Обновления

Для обновления системы:

```bash
# Остановка сервисов
docker-compose down

# Обновление образов
docker-compose pull

# Запуск обновленных сервисов
docker-compose up -d
```

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи сервисов
2. Убедитесь, что все переменные окружения настроены
3. Проверьте доступность базы данных
4. Создайте issue в репозитории проекта

## 📄 Лицензия

Проект разработан в рамках дипломной работы.

---

**Важно**: Перед развертыванием в production обязательно измените все секретные ключи и пароли в переменных окружения!
