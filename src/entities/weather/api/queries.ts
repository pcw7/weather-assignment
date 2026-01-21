import { useQuery } from '@tanstack/react-query';
import { fetchCurrentWeather, fetchForecast } from '@/shared/api/openweather';

export const weatherKeys = {
    byLatLon: (lat: number, lon: number) => ['weather', 'byLatLon', lat, lon] as const,
};

function toLocalDateKey(dtSec: number, tzShiftSec: number) {
    const ms = (dtSec + tzShiftSec) * 1000;
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function useWeatherByLatLon(lat?: number, lon?: number) {
    return useQuery({
        queryKey: lat != null && lon != null ? weatherKeys.byLatLon(lat, lon) : ['weather', 'disabled'],
        enabled: lat != null && lon != null,
        queryFn: async () => {
            const [current, forecast] = await Promise.all([
                fetchCurrentWeather(lat!, lon!),
                fetchForecast(lat!, lon!),
            ]);

            const tz = forecast.city?.timezone ?? 0;

            const firstDt = forecast.list?.[0]?.dt;
            const baseKey = firstDt != null ? toLocalDateKey(firstDt, tz) : null;

            const baseList = baseKey
                ? (forecast.list ?? []).filter((x) => toLocalDateKey(x.dt, tz) === baseKey)
                : [];

            const temps = baseList.map((x) => x.main.temp);
            const min = temps.length ? Math.min(...temps) : null;
            const max = temps.length ? Math.max(...temps) : null;

            const hourly = (forecast.list ?? []).slice(0, 8).map((x: any) => ({
                dt: x.dt,
                temp: x.main?.temp,
            })); // 3시간 간격 24시간치(8개)

            return {
                currentTemp: current.main?.temp,
                todayMin: min,
                todayMax: max,
                hourly,
            };
        },
    });
}