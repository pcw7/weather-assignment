'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFavorites } from '@/entities/favorite/model/FavoriteProvider';
import { useWeatherByLatLon } from '@/entities/weather/api/queries';
import { StarIcon } from '@/shared/ui/icon/StarIcon';

export default function PlaceDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = useMemo(() => decodeURIComponent(params.id), [params.id]);

    const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();

    const fav = useMemo(() => favorites.find((f) => f.id === id) ?? null, [favorites, id]);

    const lat = fav?.lat ?? null;
    const lon = fav?.lon ?? null;

    const weather = useWeatherByLatLon(lat ?? undefined, lon ?? undefined);

    if (!fav) {
        return (
            <main className="mx-auto max-w-3xl p-4">
                <button
                    className="mb-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => router.back()}
                >
                    ← 뒤로
                </button>

                <div className="rounded-xl border p-4 text-sm text-gray-600">
                    해당 장소를 즐겨찾기에서 찾을 수 없어요.
                    <div className="mt-2 text-gray-500">
                        홈에서 다시 즐겨찾기를 추가한 뒤 들어와 주세요.
                    </div>
                </div>
            </main>
        );
    }

    const title = fav.alias?.trim() ? fav.alias : fav.name;

    function onToggleFavorite() {
        if (!fav) return;

        if (isFavorite(fav.id)) {
            removeFavorite(fav.id);
            return;
        }

        addFavorite(fav);
    }

    return (
        <main className="mx-auto max-w-3xl p-4">
            <button
                className="mb-4 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                onClick={() => router.back()}
            >
                ← 뒤로
            </button>

            <section className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <div className="truncate text-base font-semibold">{title}</div>
                        {fav.alias?.trim() && <div className="truncate text-xs text-gray-500">{fav.name}</div>}
                    </div>

                    <button
                        type="button"
                        className="shrink-0 rounded p-1 hover:bg-gray-50"
                        aria-label={isFavorite(fav.id) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                        onClick={onToggleFavorite}
                    >
                        <StarIcon filled={isFavorite(fav.id)} />
                    </button>
                </div>

                <div className="mt-4">
                    {weather.isLoading ? (
                        <div className="text-sm text-gray-500">날씨 불러오는 중...</div>
                    ) : weather.isError ? (
                        <div className="text-sm text-gray-600">날씨를 불러오지 못했습니다.</div>
                    ) : weather.data ? (
                        <div>
                            <div className="flex items-end justify-between gap-3">
                                <div className="text-4xl font-bold">
                                    현재 기온 : {Math.round(weather.data.currentTemp)}°C
                                </div>
                                <div className="text-sm text-gray-700">
                                    최저 {weather.data.todayMin == null ? '-' : Math.round(weather.data.todayMin)}°C / 최고{' '}
                                    {weather.data.todayMax == null ? '-' : Math.round(weather.data.todayMax)}°C
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'nowrap',
                                    gap: 8,
                                    overflowX: 'auto',
                                    paddingBottom: 4,
                                }}
                            >
                                {weather.data.hourly.map((h: { dt: number; temp: number }) => (
                                    <div
                                        key={h.dt}
                                        style={{
                                            minWidth: 72,
                                            flex: '0 0 auto',
                                            border: '1px solid #ddd',
                                            borderRadius: 8,
                                            padding: 8,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {new Date(h.dt * 1000).getHours()}시
                                        </div>
                                        <div style={{ marginTop: 4, fontSize: 16, fontWeight: 600 }}>
                                            {Math.round(h.temp)}°C
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>
        </main>
    );
}