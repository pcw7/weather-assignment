'use client';

import type { FavoritePlace } from '@/entities/favorite/model/types';
import { useFavorites } from '@/entities/favorite/model/FavoriteProvider';
import { useWeatherByLatLon } from '@/entities/weather/api/queries';
import Link from 'next/link';

function FavoriteCard({ fav }: { fav: FavoritePlace }) {
    const weather = useWeatherByLatLon(fav.lat, fav.lon);
    const title = fav.alias?.trim() ? fav.alias : fav.name;

    return (
        <Link
            href={`/place/${encodeURIComponent(fav.id)}`}
            className="block rounded-xl border p-4 hover:bg-gray-50"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="truncate text-base font-semibold">{title}</div>
                    {fav.alias?.trim() && (
                        <div className="truncate text-xs text-gray-500">{fav.name}</div>
                    )}
                </div>

                {weather.isLoading ? (
                    <div className="text-sm text-gray-500">불러오는 중…</div>
                ) : weather.isError ? (
                    <div className="text-sm text-gray-500">실패</div>
                ) : weather.data ? (
                    <div className="text-right">
                        <div className="text-2xl font-bold">
                            {Math.round(weather.data.currentTemp)}°C
                        </div>
                        <div className="text-xs text-gray-600">
                            최저 {weather.data.todayMin == null ? '-' : Math.round(weather.data.todayMin)}°C /
                            최고 {weather.data.todayMax == null ? '-' : Math.round(weather.data.todayMax)}°C
                        </div>
                    </div>
                ) : null}
            </div>
        </Link>
    );
}

export default function FavoritesList() {
    const { favorites } = useFavorites();

    if (favorites.length === 0) {
        return (
            <div className="rounded-xl border p-4 text-sm text-gray-500">
                즐겨찾기가 비어있어요. 검색 결과에서 ⭐를 눌러 추가해보세요.
            </div>
        );
    }

    return (
        <section className="mt-6">
            <div className="mb-2 text-lg font-semibold">즐겨찾기</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {favorites.map((fav) => (
                    <FavoriteCard key={fav.id} fav={fav} />
                ))}
            </div>
        </section>
    );
}