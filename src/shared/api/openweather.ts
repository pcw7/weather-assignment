import { env } from '@/shared/env';

const BASE = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(lat: number, lon: number) {
    if (!env.OPENWEATHER_KEY) throw new Error('OPENWEATHER API KEY is missing');

    const url =
        `${BASE}/weather?lat=${lat}&lon=${lon}` +
        `&appid=${env.OPENWEATHER_KEY}&units=metric&lang=kr`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`CurrentWeather error: ${res.status}`);
    return res.json();
}

export async function fetchForecast(lat: number, lon: number) {
    if (!env.OPENWEATHER_KEY) throw new Error('OPENWEATHER API KEY is missing');

    const url =
        `${BASE}/forecast?lat=${lat}&lon=${lon}` +
        `&appid=${env.OPENWEATHER_KEY}&units=metric&lang=kr`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
    return res.json();
}