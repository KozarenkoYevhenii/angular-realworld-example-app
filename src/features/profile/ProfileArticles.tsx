import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../core/api/profile';
import { isAbortError } from '../../core/api/client';
import type { ArticleListConfig } from '../../core/models';
import { ArticleList } from '../article/ArticleList';

export function ProfileArticles() {
  const { username } = useParams();
  const [articlesConfig, setArticlesConfig] = useState<ArticleListConfig | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const controller = new AbortController();
    setArticlesConfig(null);

    void getProfile(username, controller.signal)
      .then(profile => {
        setArticlesConfig({
          type: 'all',
          filters: { author: profile.username },
        });
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
      });

    return () => controller.abort();
  }, [username]);

  if (!articlesConfig) {
    return null;
  }

  return <ArticleList limit={10} config={articlesConfig} />;
}
