import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { queryArticles } from '../../core/api/articles';
import { isAbortError } from '../../core/api/client';
import type { Article, ArticleListConfig } from '../../core/models';
import { LoadingState } from '../../core/models';
import { ArticlePreview } from './ArticlePreview';

export function ArticleList({
  limit,
  config,
  currentPage,
  isFollowingFeed = false,
  onPageChange,
}: {
  limit: number;
  config: ArticleListConfig;
  currentPage?: number;
  isFollowingFeed?: boolean;
  onPageChange?: (page: number) => void;
}) {
  const [internalPage, setInternalPage] = useState(1);
  const page = currentPage ?? internalPage;
  const [results, setResults] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.NOT_LOADED);

  const configKey = JSON.stringify({
    type: config.type,
    filters: { ...config.filters, limit: undefined, offset: undefined },
  });

  useEffect(() => {
    if (currentPage == null) {
      setInternalPage(1);
    }
  }, [configKey, currentPage]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(LoadingState.LOADING);
    setResults([]);

    const filters = {
      ...config.filters,
      limit,
      offset: limit * (page - 1),
    };

    void queryArticles({ type: config.type, filters }, controller.signal)
      .then(data => {
        setLoading(LoadingState.LOADED);
        setResults(data.articles);
        setTotalPages(Array.from(new Array(Math.ceil(data.articlesCount / limit)), (_val, index) => index + 1));
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
        setLoading(LoadingState.LOADED);
        setResults([]);
        setTotalPages([]);
      });

    return () => controller.abort();
  }, [configKey, limit, page]);

  function setPageTo(pageNumber: number) {
    if (pageNumber === page) {
      return;
    }
    if (onPageChange) {
      onPageChange(pageNumber);
    } else {
      setInternalPage(pageNumber);
    }
  }

  return (
    <>
      {loading === LoadingState.LOADING && <div className="article-preview">Loading articles...</div>}

      {loading === LoadingState.LOADED && (
        <>
          {results.length === 0 ? (
            <div className="article-preview empty-feed-message">
              {isFollowingFeed ? (
                <>
                  Your feed is empty. Follow some users to see their articles here, or check out the{' '}
                  <Link to="/">Global Feed</Link>!
                </>
              ) : (
                'No articles are here... yet.'
              )}
            </div>
          ) : (
            results.map(article => <ArticlePreview key={article.slug} article={article} />)
          )}

          <nav>
            <ul className="pagination">
              {totalPages.map(pageNumber => (
                <li key={pageNumber} className={pageNumber === page ? 'page-item active' : 'page-item'}>
                  <button className="page-link" type="button" onClick={() => setPageTo(pageNumber)}>
                    {pageNumber}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
