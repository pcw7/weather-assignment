export function formatKoAmPmHour(dtSec: number) {
    return new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        hour12: true,
    }).format(new Date(dtSec * 1000));
}