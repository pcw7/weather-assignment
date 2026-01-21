import { env } from '@/shared/env';

const GEO_BASE = 'https://api.openweathermap.org/geo/1.0/direct';
const GEO_REVERSE = 'https://api.openweathermap.org/geo/1.0/reverse';

type GeocodeItem = {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
};

type ReverseGeocodeItem = {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
    local_names?: Record<string, string>;
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

export async function reverseGeocodeKR(lat: number, lon: number, limit = 1) {
    if (!env.OPENWEATHER_KEY) throw new Error('OPENWEATHER API KEY is missing');

    const url =
        `${GEO_REVERSE}?lat=${lat}&lon=${lon}&limit=${limit}` +
        `&appid=${env.OPENWEATHER_KEY}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Reverse geocoding error: ${res.status}`);

    const data = (await res.json()) as ReverseGeocodeItem[];
    return data.filter((x) => x.country === 'KR');
}