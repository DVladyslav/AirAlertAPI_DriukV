const axios = require('axios');

let cachedAlerts = null;
let lastCacheTime = 0;
const cacheDuration = 60 * 1000;

async function fetchAlerts() {
    try {
        const response = await axios.get('https://ubilling.net.ua/aerialalerts/?json=true');
        const alerts = response.data.states;
        if (!alerts) {
            throw new Error("Поле 'states' відсутнє у відповіді API");
        }
        cachedAlerts = alerts;
        lastCacheTime = Date.now();
        console.log('Дані оновлено:', cachedAlerts);
        return cachedAlerts;
    } catch (error) {
        console.error('Помилка при отриманні даних:', error.message);
        throw error;
    }
}

async function getAlertStatus(region) {
    try {
        if (!cachedAlerts || (Date.now() - lastCacheTime) > cacheDuration) {
            await fetchAlerts();
        }

        const alerts = cachedAlerts;
        const regionName = region;
        const regionData = alerts[regionName];

        if (!regionData) {
            return {
                region: regionName,
                status: 'error',
                error: `Дані для регіону ${regionName} відсутні`,
                lastChange: "Невідомо"
            };
        }

        console.log(`Дані для регіону ${regionName}:`, regionData);

        let lastChange = "Невідомо";
        if (regionData.changed && regionData.changed !== "1970-01-01 03:00:00") {
            lastChange = new Date(regionData.changed).toLocaleString('uk-UA');
        }

        return {
            region: regionName,
            status: regionData.alertnow ? 'active' : 'inactive',
            lastChange: lastChange
        };
    } catch (error) {
        console.error('Помилка при отриманні даних:', error.message);
        if (error.response && error.response.status === 429) {
            return {
                region,
                status: 'error',
                error: 'Забагато запитів до API. Спробуйте пізніше.',
                lastChange: "Невідомо"
            };
        }
        return {
            region,
            status: 'error',
            error: error.message,
            lastChange: "Невідомо"
        };
    }
}

module.exports = { getAlertStatus };