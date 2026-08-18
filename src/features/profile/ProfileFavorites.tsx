import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../core/api/profile';
import { isAbortError } from '../../core/api/client';
import type { ArticleListConfig } from '../../core/models';
import { ArticleList } from '../article/ArticleList';

export function ProfileFavorites() {
  const { username } = useParams();
  const [favoritesConfig, setFavoritesConfig] = useState<ArticleListConfig | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const controller = new AbortController();
    setFavoritesConfig(null);

    void getProfile(username, controller.signal)
      .then(profile => {
        setFavoritesConfig({
          type: 'all',
          filters: { favorited: profile.username },
        });
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
      });

    return () => controller.abort();
  }, [username]);

  if (!favoritesConfig) {
    return null;
  }

  return <ArticleList limit={10} config={favoritesConfig} />;
}
