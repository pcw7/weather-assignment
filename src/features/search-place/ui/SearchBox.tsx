'use client';

import { useEffect, useMemo, useState } from 'react';
import { normalizeDistricts } from '@/entities/place/lib/normalizeDistricts';
import { searchPlaces } from '@/entities/place/lib/searchPlaces';
import { Place } from '@/entities/place/model/types';
import { geocodeKR, reverseGeocodeKR } from '@/shared/api/openweather-geocode';
import { useWeatherByLatLon } from '@/entities/weather/api/queries';
import { useFavorites } from '@/entities/favorite/model/FavoriteProvider';
import type { FavoritePlace } from '@/entities/favorite/model/types';
import { StarIcon } from '@/shared/ui/icon/StarIcon';
import { formatKoAmPmHour } from '@/shared/lib/formatTime';

export default function SearchBox() {
    const places = useMemo(() => normalizeDistricts(), []);

    const [keyword, setKeyword] = useState('');
    const [selected, setSelected] = useState<Place | null>(null);

    const [latlon, setLatlon] = useState<{ lat: number; lon: number } | null>(null);
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoNoData, setGeoNoData] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [initialLocLoading, setInitialLocLoading] = useState(true);
    const [initialLocError, setInitialLocError] = useState<string | null>(null);
    const [didInitLocation, setDidInitLocation] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { favorites, isFavorite, addFavorite, removeFavorite, error: favError } = useFavorites();

    const weather = useWeatherByLatLon(latlon?.lat, latlon?.lon);

    const searchPool = useMemo(() => {
        return [...favorites, ...places];
    }, [favorites, places]);
    const results = useMemo(() => searchPlaces(searchPool, keyword, 20), [searchPool, keyword]);

    useEffect(() => {
        if (didInitLocation) return;
        setDidInitLocation(true);

        if (!navigator.geolocation) {
            setInitialLocError('이 브라우저는 위치 기능을 지원하지 않습니다.');
            setInitialLocLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;

                setLatlon({ lat: latitude, lon: longitude });

                try {
                    const rev = await reverseGeocodeKR(latitude, longitude, 1);

                    if (rev.length > 0) {
                        const item = rev[0];
                        const koName = item.local_names?.ko ?? item.name;
                        const name = `${koName}${item.state ? `, ${item.state}` : ''}`;
                        setSelected({ id: 'me', name } as Place);
                    } else {
                        setSelected({ id: 'me', name: '현재 위치' } as Place);
                    }
                } catch {
                    setSelected({ id: 'me', name: '현재 위치' } as Place);
                } finally {
                    setInitialLocLoading(false);
                }
            },
            (err) => {
                setInitialLocError(err.message || '위치 정보를 가져오지 못했습니다.');
                setInitialLocLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 60_000,
            }
        );
    }, [didInitLocation]);

    async function onSelect(place: Place) {
        setIsOpen(false);
        setSelected(place);
        setLatlon(null);
        setGeoNoData(false);
        setGeoError(null);

        setGeoLoading(true);
        try {
            const geo = await geocodeKR(place.name, 1);
            if (geo.length === 0) {
                setGeoNoData(true);
                return;
            }
            setLatlon({ lat: geo[0].lat, lon: geo[0].lon });
        } catch (e: unknown) {
            if (e instanceof Error) {
                setGeoError(e.message);
            } else {
                setGeoError('지오코딩 실패');
            }
        } finally {
            setGeoLoading(false);
        }
    }

    async function onToggleFavorite(place: Place) {
        if (isFavorite(place.id)) {
            removeFavorite(place.id);
            return;
        }

        try {
            const geo = await geocodeKR(place.name, 1);
            if (geo.length === 0) {
                setGeoNoData(true);
                return;
            }

            const item: FavoritePlace = {
                ...place,
                lat: geo[0].lat,
                lon: geo[0].lon,
                alias: undefined,
            };

            addFavorite(item);
        } catch (e) {
            setGeoError(e instanceof Error ? e.message : '즐겨찾기 추가 실패');
        }
    }

    return (
        <div>
            <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="예: 서울특별시, 종로구, 청운동"
                value={keyword}
                onChange={(e) => {
                    setKeyword(e.target.value);
                    setIsOpen(true);
                    setLatlon(null);
                    setGeoNoData(false);
                    setGeoError(null);
                }}
            />

            {initialLocLoading && (
                <div className="mb-2 text-sm text-gray-500">현재 위치 확인 중...</div>
            )}
            {initialLocError && (
                <div className="mb-2 text-sm text-gray-600">
                    현재 위치를 사용할 수 없습니다. ({initialLocError})
                </div>
            )}

            {!!keyword && isOpen && (
                <div className="mt-2 max-h-72 overflow-auto rounded-lg border bg-white shadow-sm">
                    {results.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">검색 결과가 없습니다.</div>
                    ) : (
                        <div className="flex flex-col">
                            {results.map((p) => {
                                const fav = isFavorite(p.id);

                                return (
                                    <li key={p.id} className="border-b last:border-b-0">
                                        <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                                            <button
                                                type="button"
                                                className="flex-1 text-left"
                                                onClick={() => onSelect(p)}
                                            >
                                                {String(p.name)}
                                            </button>

                                            <button
                                                type="button"
                                                className="shrink-0 rounded p-1 hover:bg-white"
                                                aria-label={fav ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleFavorite(p);
                                                }}
                                            >
                                                <StarIcon filled={fav} />
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {favError && <div className="mt-2 text-sm text-red-500">{favError}</div>}
            {selected && (
                <div className="mt-3 rounded-xl border p-4">
                    <div className="text-base font-semibold">{selected.name}</div>

                    {geoLoading && <div className="mt-2 text-sm text-gray-500">위치 확인 중...</div>}

                    {geoNoData && (
                        <div className="mt-2 text-sm text-gray-600">
                            해당 장소의 정보가 제공되지 않습니다.
                        </div>
                    )}

                    {geoError && <div className="mt-2 text-sm text-gray-600">{geoError}</div>}

                    {/* {!!latlon && (
                        <div className="mt-2 text-xs text-gray-500">
                            좌표: {latlon.lat.toFixed(4)}, {latlon.lon.toFixed(4)}
                        </div>
                    )} */}

                    {!!latlon && (
                        <div className="mt-4">
                            {weather.isLoading ? (
                                <div className="text-sm text-gray-500">날씨 불러오는 중...</div>
                            ) : weather.isError ? (
                                <div className="text-sm text-gray-600">날씨를 불러오지 못했습니다.</div>
                            ) : weather.data ? (
                                <div>
                                    <div className="flex items-end justify-between">
                                        <div className="text-4xl font-bold">
                                            현재 기온 : {Math.round(weather.data.currentTemp)}°C
                                        </div>
                                        <div className="text-sm text-gray-700">
                                            최저 {weather.data.todayMin == null ? '-' : Math.round(weather.data.todayMin)}°C / 최고{' '}
                                            {weather.data.todayMax == null ? '-' : Math.round(weather.data.todayMax)}°C
                                        </div>
                                    </div>

                                    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
                                        {weather.data.hourly.map((h: { dt: number; temp: number }) => (
                                            <div
                                                key={h.dt}
                                                className="min-w-[72px] flex-none rounded-lg border p-2 text-center"
                                            >
                                                <div className="text-xs text-gray-500">
                                                    {formatKoAmPmHour(h.dt)}
                                                </div>
                                                <div className="mt-1 text-base font-semibold">
                                                    {Math.round(h.temp)}°C
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}