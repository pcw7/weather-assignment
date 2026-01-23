'use client';

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
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

function loadFavoritesFromStorage(): FavoritePlace[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = JSON.parse(raw ?? '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFavorites(loadFavoritesFromStorage());
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        } catch {
            // ignore
        }
    }, [favorites]);

    const value = useMemo<FavoritesContextValue>(() => {
        const isFavorite = (id: string) => favorites.some((f) => f.id === id);

        const addFavorite = (item: FavoritePlace) => {
            setFavorites((prev) => (prev.some((f) => f.id === item.id) ? prev : [item, ...prev]));
        };

        const removeFavorite = (id: string) => {
            setFavorites((prev) => prev.filter((f) => f.id !== id));
        };

        const renameFavorite = (id: string, alias: string) => {
            setFavorites((prev) =>
                prev.map((f) => (f.id === id ? { ...f, alias } : f))
            );
        };

        return { favorites, error, isFavorite, addFavorite, removeFavorite, renameFavorite };
    }, [favorites, error]);

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
    return ctx;
}