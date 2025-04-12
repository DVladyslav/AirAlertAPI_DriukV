const express = require('express');
const path = require('path');
const { getAlertStatus } = require('./alerts');

const app = express();

// Налаштування Express для віддачі статичних файлів із папки html
app.use(express.static(path.join(__dirname, 'html')));
app.use('/css', express.static(path.join(__dirname, 'css')));

// Головна сторінка
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Сторінка перевірки тривог
app.get('/alerts', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'alerts.html'));
});

// Сторінка особистих даних
app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'user.html'));
});

// Ендпоінт для перевірки тривог
app.get('/alert', async (req, res) => {
    const region = req.query.region;
    if (!region) {
        return res.status(400).json({ error: 'Регіон не вказано' });
    }
    try {
        const data = await getAlertStatus(region);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ендпоінт для даних користувача (наприклад, /is-31fiot-23-070)
app.get('/:moodleLogin', (req, res) => {
    const moodleLogin = req.params.moodleLogin;
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

    res.json(response);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});