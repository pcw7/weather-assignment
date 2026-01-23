import { Place } from '../model/types';

type PlaceWithAlias = Place & { alias?: string };

function normalize(s: string) {
    return s.trim().replaceAll('-', ' ').replace(/\s+/g, ' ');
}

export function searchPlaces(
    places: PlaceWithAlias[],
    keyword: string,
    limit = 20
): PlaceWithAlias[] {
    const q = normalize(keyword);
    if (!q) return [];

    const matched = places.filter((p) => {
        const name = normalize(p.name);
        const alias = p.alias ? normalize(p.alias) : '';
        return name.includes(q) || (alias && alias.includes(q));
    });

    const seen = new Set<string>();
    const unique = matched.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
    });

    return unique.slice(0, limit);
}