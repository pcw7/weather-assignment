import type { Place } from '@/entities/place/model/types';

export type FavoritePlace = Place & {
    lat: number;
    lon: number;
    alias?: string;
};