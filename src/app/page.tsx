import SearchBox from '@/features/search-place/ui/SearchBox';
import FavoritesList from '@/features/favorites/ui/FavoritesList';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold">오늘의 날씨 정보</h1>

      <section className="mt-6">
        <SearchBox />
      </section>

      <FavoritesList />
    </main>
  );
}