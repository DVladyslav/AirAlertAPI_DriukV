const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');
const { getAlertStatus } = require('./alerts');

const port = 3000;

// Функція для відправлення JSON-відповіді
const sendJsonResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

// Функція для відправлення файлу
const sendFile = async (res, filePath, contentType) => {
    try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
};

// Створюємо HTTP-сервер
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Обробка маршрутів
    if (req.method === 'GET') {
        // Головна сторінка
        if (pathname === '/') {
            await sendFile(res, path.join(__dirname, 'html', 'index.html'), 'text/html');
        }
        // Сторінка перевірки тривог
        else if (pathname === '/alerts') {
            await sendFile(res, path.join(__dirname, 'html', 'alerts.html'), 'text/html');
        }
        // Сторінка особистих даних
        else if (pathname === '/user') {
            await sendFile(res, path.join(__dirname, 'html', 'user.html'), 'text/html');
        }
        // Ендпоінт для перевірки тривог
        else if (pathname === '/alert') {
            const region = query.region;
            if (!region) {
                sendJsonResponse(res, 400, { error: 'Регіон не вказано' });
                return;
            }
            try {
                const data = await getAlertStatus(region);
                sendJsonResponse(res, 200, data);
            } catch (error) {
                sendJsonResponse(res, 500, { error: error.message });
            }
        }
        // Ендпоінт для даних користувача (наприклад, /is-31-fiot)
        else if (pathname.match(/^\/[a-zA-Z0-9_-]+$/)) {
            const moodleLogin = pathname.substring(1);
            let response;

            if (moodleLogin === 'is-31fiot-23-070') {
                response = {
                    login: moodleLogin,
                    surname: 'Дрюк',
                    name: 'Владислав',
                    course: '2-й курс',
                    group: 'ІС-31',
                    isValid: true
                };
            } else {
                response = {
                    login: moodleLogin,
                    surname: 'unknown',
                    name: 'unknown',
                    course: 'unknown',
                    group: 'unknown',
                    isValid: false
                };
            }

            sendJsonResponse(res, 200, response);
        }
        // Обробка статичних файлів
        else {
            let filePath;
            let contentType = 'text/plain';
            if (pathname.startsWith('/css/')) {
                filePath = path.join(__dirname, pathname); 
                contentType = 'text/css';
            }
            else {
                filePath = path.join(__dirname, 'html', pathname);
                const extname = path.extname(filePath);
                switch (extname) {
                    case '.html':
                        contentType = 'text/html';
                        break;
                    case '.js':
                        contentType = 'application/javascript';
                        break;
                }
            }

            await sendFile(res, filePath, contentType);
        }
    } else {
        // Якщо метод не GET
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('405 Method Not Allowed');
    }
});

server.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});