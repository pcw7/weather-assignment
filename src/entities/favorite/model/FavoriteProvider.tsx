'use client';

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import type { FavoritePlace } from './types';

const STORAGE_KEY = 'weather:favorites:v2';

type FavoritesContextValue = {
    favorites: FavoritePlace[];
    error: string | null;
    isFavorite: (id: string) => boolean;
    addFavorite: (item: FavoritePlace) => void;
    removeFavorite: (id: string) => void;
    renameFavorite: (id: string, alias: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function loadFavorites(): FavoritePlace[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(raw ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoritePlace[]>(() => loadFavorites());
    const [error, setError] = useState<string | null>(null);

    const didMountRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const ids = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

    const isFavorite = (id: string) => ids.has(id);

    const addFavorite = (item: FavoritePlace) => {
        setError(null);
        setFavorites((prev) => {
            if (prev.some((f) => f.id === item.id)) return prev;
            if (prev.length >= 6) {
                setError('즐겨찾기는 최대 6개까지 추가할 수 있습니다.');
                return prev;
            }
            return [...prev, item];
        });
    };

    const removeFavorite = (id: string) => {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    };

    const renameFavorite = (id: string, alias: string) => {
        setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, alias } : f)));
    };

    const value: FavoritesContextValue = {
        favorites,
        error,
        isFavorite,
        addFavorite,
        removeFavorite,
        renameFavorite,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
    return ctx;
}