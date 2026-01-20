import rawDistricts from '@/shared/korea_districts.json';
import { Place } from '../model/types';

export function normalizeDistricts(): Place[] {
    const arr = rawDistricts as unknown as string[];

    return arr
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .map((raw) => {
            const parts = raw.split('-').map((p) => p.trim()).filter(Boolean);
            const [depth1, depth2, depth3] = parts;

            return {
                id: raw,
                raw,
                name: raw.replaceAll('-', ' '),
                depth1,
                depth2,
                depth3,
            };
        });
}