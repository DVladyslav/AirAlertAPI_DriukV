# Проєкт для перевірки повітряних тривог в Україні
### Загальна інформація
- Посилання: https://airalertapi-driukv.onrender.com/ (Завантаження сторінки може тривати деякий час, оскільки розміщено на безкоштовному веб-сервісі).
- Цей проєкт реалізує виклик API зовнішнього сервісу `https://ubilling.net.ua/aerialalerts` для перевірки статусу повітряних тривог в Україні та візуалізації відповіді.
- Автор: студент групи ІС-31 Дрюк Владислав
### Зовнішній сервіс
- **Сервіс**: `https://ubilling.net.ua/aerialalerts`
- **API**: Використовується для отримання статусу повітряних тривог по регіонах України.
- **Ендпоінт**: `https://ubilling.net.ua/aerialalerts/?json=true` (повертає статус тривог у форматі JSON).
- **Карта**: Відображається через `<iframe>` за адресою `https://ubilling.net.ua/aerialalerts/?map=true`.
### Сценарій використання API зовнішнього застосування
#### Назва сценарію
Отримання статусу повітряної тривоги для певного регіону України через API `ubilling.net.ua`.

#### Учасники
- **Клієнт**: Вебсайт, який розроблений для інформування користувачів про повітряні тривоги в Україні.
- **API**: Зовнішній сервіс `ubilling.net.ua`, який надає дані про статус тривог.

#### Передумови
- Користувач має доступ до інтернету.
- API `ubilling.net.ua` доступний і працює коректно.
- На вебсайті є список регіонів України, з якого користувач може обрати потрібний (наприклад, "Дніпропетровська область").

#### Основний потік
1. Користувач відкриває сторінку `/alerts` у веб-додатку і обирає регіон (наприклад, "Дніпропетровська область") зі списку.
2. Вебсайт надсилає GET-запит через сервер до API `ubilling.net.ua` для отримання актуальних даних про тривоги: GET https://ubilling.net.ua/aerialalerts/?json=true
3. API повертає JSON-відповідь із інформацією про статус тривог для всіх регіонів України:
    ```json
    {
      "source": "Mørk Skogen API (default)",
      "cachedat": "2025-04-12 12:00:55",
      "states": {
        "Вінницька область": {
          "alertnow": false,
          "changed": "2025-04-12 04:03:18"
        },
        "Волинська область": {
          "alertnow": false,
          "changed": "2025-04-09 17:49:04"
        },
        "Дніпропетровська область": {
          "alertnow": true,
          "changed": "2025-04-12 11:25:35"
        },
        "Донецька область": {
          "alertnow": true,
          "changed": "2025-04-12 09:33:16"
        }
        // ... інші регіони ...
      }
    }
4. Вебсайт обробляє відповідь, витягує дані для обраного регіону (наприклад, "Дніпропетровська область") із поля states["Назва регіону"] (наприклад, states["Дніпропетровська область"]).
5. Вебсайт перевіряє значення alertnow:
    Наприклад:
    - Оскільки alertnow: true, визначає, що тривога активна.
    - Час останньої зміни статусу (changed) — "2025-04-12 11:25:35".
6. Вебсайт відображає повідомлення про статус тривоги та дату/час останньої зміни статусу користувачу:
    Наприклад:
    - Статус тривоги в регіоні - Дніпропетровська область: Тривога активна
    - Остання зміна cтатусу тривоги: 12.04.2025, 11:25:35.
7. Додаток також може відобразити інтерактивну карту тривог, використовуючи <iframe> із URL https://ubilling.net.ua/aerialalerts/?map=true.
#### Альтернативні потоки
1. Помилка з’єднання з API
    - На кроці 2, якщо API ubilling.net.ua недоступний (наприклад, сервер не відповідає), додаток отримує помилку мережі.
    - Додаток показує користувачу відповідне повідомлення про помилку.
2. Регіон не знайдено
    - На кроці 4, якщо обраний регіон відсутній у відповіді (наприклад, через помилку в назві регіону), додаток не знаходить даних у states.
    - Додаток показує користувачу відповідне повідомлення про помилку.
#### Особливості безпеки
- API ubilling.net.ua є публічним і не потребує авторизації, тому додаток не використовує токени чи ключі API.
- Для захисту від частих запитів розробнику варто обмежити частоту звернень до API (наприклад, не частіше, ніж раз на 3 секунди), щоб уникнути блокування з боку сервера.

### Приклад застосування API
#### Як працює:
1. Користувач відкриває сторінку веб-додатку, обирає регіон (наприклад, "Дніпропетровська область") зі списку і натискає кнопку "Перевірити".
2. Функція `checkAlert()` у файлі `alerts.html` надсилає GET-запит до сервера додатку (`/alert?region=Дніпропетровська область`).
3. Сервер (server.js) обробляє запит і викликає функцію getAlertStatus з файлу alerts.js.
4. Функція getAlertStatus викликає API ubilling.net.ua і витягує статус тривоги для заданого регіону.
5. Сервер повертає клієнту спрощену відповідь із статусом тривоги і часом останньої зміни.
6. Функція checkAlert() обробляє відповідь і відображає результат користувачу.
#### Як запустити:
1. Встановіть Node.js.
2. Встановіть залежності:
    ```bash
    npm install node-fetch
3. Клонуйте репозиторій:
    ```bash
    git clone <URL_репозиторію>
    cd AirAlertAPI
4. Запустіть сервер:
    ```bash
    node server.js
5. Відкрийте http://localhost:3000/alerts у браузері.
6. Оберіть регіон (наприклад, "Дніпропетровська область") і натисніть "Перевірити".
#### Приклад відповіді API:
- Запит до API: `GET https://ubilling.net.ua/aerialalerts/?json=true`
- Відповідь API (фрагмент для "Дніпропетровська область"):
  ```json
  {
    "source": "Mørk Skogen API (default)",
    "cachedat": "2025-04-12 12:00:55",
    "states": {
      "Дніпропетровська область": {
        "alertnow": true,
        "changed": "2025-04-12 11:25:35"
      }
      // ... інші регіони ...
    }
  }
- Відповідь сервера клієнту:
  ```json
  {
    "status": "active",
    "lastChange": "2025-04-12 11:25:35"
  }

