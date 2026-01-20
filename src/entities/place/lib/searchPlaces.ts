import { Place } from '../model/types';

function normalize(s: string) {
    return s.trim().replaceAll('-', ' ').replace(/\s+/g, ' ');
}

export function searchPlaces(places: Place[], keyword: string, limit = 20): Place[] {
    const q = normalize(keyword);
    if (!q) return [];

    return places
        .filter((p) => normalize(p.name).includes(q))
        .slice(0, limit);
}