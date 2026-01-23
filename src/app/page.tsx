import SearchBox from '@/features/search-place/ui/SearchBox';
import FavoritesList from '@/features/favorites/ui/FavoritesList';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-4 mt-5">
      <div className="flex items-center justify-center gap-2">
        <Image
          src="/sun&clouds.png"
          alt="날씨 아이콘"
          width={32}
          height={32}
          priority
        />
        <h1 className="text-2xl font-bold">오늘의 날씨</h1>
      </div>

      <section className="mt-6">
        <SearchBox />
      </section>

      <FavoritesList />
    </main>
  );
}