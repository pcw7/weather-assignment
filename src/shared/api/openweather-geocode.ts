import { env } from '@/shared/env';

const GEO_BASE = 'https://api.openweathermap.org/geo/1.0/direct';

type GeocodeItem = {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
};

function normalizeQuery(query: string) {
    return query.trim().split(/\s+/).pop()!;
}

export async function geocodeKR(query: string, limit = 1) {
    if (!env.OPENWEATHER_KEY) throw new Error('OPENWEATHER API KEY is missing');

    const normalized = normalizeQuery(query);

    const url =
        `${GEO_BASE}?q=${encodeURIComponent(normalized)}` +
        `&limit=${limit}&appid=${env.OPENWEATHER_KEY}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);

    const data = (await res.json()) as GeocodeItem[];
    return data.filter((x) => x.country === 'KR');
}