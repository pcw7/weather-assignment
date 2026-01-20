import SearchBox from '@/features/search-place/ui/SearchBox';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold">Weather App</h1>

      <section className="mt-6">
        <SearchBox />
      </section>
    </main>
  );
}