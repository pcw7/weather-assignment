import Providers from './providers';
import { FavoritesProvider } from '@/entities/favorite/model/FavoriteProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <FavoritesProvider>{children}</FavoritesProvider>
        </Providers>
      </body>
    </html>
  );
}