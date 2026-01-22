import { useEffect, useMemo, useState } from 'react';
import type { FavoritePlace } from './types';

const STORAGE_KEY = 'weather:favorites:v2';

function safeParse<T>(raw: string | null): T | null {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoritePlace[]>(() => {
        if (typeof window === 'undefined') return [];
        const parsed = safeParse<FavoritePlace[]>(window.localStorage.getItem(STORAGE_KEY));
        return Array.isArray(parsed) ? parsed : [];
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const ids = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

    function isFavorite(placeId: string) {
        return ids.has(placeId);
    }

    function removeFavorite(placeId: string) {
        setFavorites((prev) => prev.filter((f) => f.id !== placeId));
    }

    function addFavorite(item: FavoritePlace) {
        setError(null);
        setFavorites((prev) => {
            if (prev.some((f) => f.id === item.id)) return prev;
            if (prev.length >= 6) {
                setError('즐겨찾기는 최대 6개까지 추가할 수 있습니다.');
                return prev;
            }
            return [...prev, item];
        });
    }

    function renameFavorite(placeId: string, alias: string) {
        setFavorites((prev) =>
            prev.map((f) => (f.id === placeId ? { ...f, alias } : f))
        );
    }

    return {
        favorites,
        error,
        isFavorite,
        addFavorite,
        removeFavorite,
        renameFavorite,
    };
}