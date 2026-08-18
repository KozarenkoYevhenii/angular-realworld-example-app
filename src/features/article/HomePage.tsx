import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getTags } from '../../core/api/tags';
import { isAbortError } from '../../core/api/client';
import type { ArticleListConfig } from '../../core/models';
import { ArticleList } from './ArticleList';

export function HomePage() {
  const isAuthenticated = useAppSelector(state => !!state.auth.user);
  const authState = useAppSelector(state => state.auth.authState);
  const { tag } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  const feed = searchParams.get('feed');
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;

  useEffect(() => {
    if (authState === 'loading') {
      return;
    }
    if (feed === 'following' && !isAuthenticated) {
      void navigate('/login');
    }
  }, [authState, feed, isAuthenticated, navigate]);

  const listConfig: ArticleListConfig = useMemo(() => {
    if (tag) {
      return { type: 'all', filters: { tag } };
    }
    if (feed === 'following') {
      return { type: 'feed', filters: {} };
    }
    return { type: 'all', filters: {} };
  }, [tag, feed]);

  const isFollowingFeed = listConfig.type === 'feed';

  useEffect(() => {
    const controller = new AbortController();
    void getTags(controller.signal)
      .then(nextTags => {
        setTags(nextTags);
        setTagsLoaded(true);
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
        setTagsLoaded(true);
      });
    return () => controller.abort();
  }, []);

  function onPageChange(nextPage: number) {
    const params = new URLSearchParams();
    if (feed) {
      params.set('feed', feed);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const search = params.toString();
    void navigate({ pathname: tag ? `/tag/${tag}` : '/', search: search ? `?${search}` : '' });
  }

  return (
    <div className="home-page">
      {!isAuthenticated && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">
              <img src="/assets/conduit-logo.svg" alt="Conduit" className="banner-logo" />
            </h1>
            <p>
              This is the <a href="https://github.com/realworld-apps/react-realworld-example-app">React frontend</a>{' '}
              demo from the <a href="https://github.com/realworld-apps/realworld">Realworld</a> project.
              <br />
              This demo is connected to a demo backend that enforces session isolation.
            </p>
          </div>
        </div>
      )}

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isAuthenticated && (
                  <li className="nav-item">
                    <Link className={listConfig.type === 'feed' ? 'nav-link active' : 'nav-link'} to="/?feed=following">
                      Your Feed
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={listConfig.type === 'all' && !listConfig.filters.tag ? 'nav-link active' : 'nav-link'}
                    to="/"
                  >
                    Global Feed
                  </Link>
                </li>
                <li className="nav-item" hidden={!listConfig.filters.tag}>
                  <a className="nav-link active">
                    <i className="ion-pound"></i> {listConfig.filters.tag}
                  </a>
                </li>
              </ul>
            </div>

            {!(feed === 'following' && !isAuthenticated) && (
              <ArticleList
                limit={10}
                config={listConfig}
                currentPage={page}
                isFollowingFeed={isFollowingFeed}
                onPageChange={onPageChange}
              />
            )}
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>

              <div className="tag-list">
                {tags.map(item => (
                  <Link key={item} className="tag-default tag-pill" to={`/tag/${item}`}>
                    {item}
                  </Link>
                ))}
              </div>

              <div hidden={tagsLoaded}>Loading tags...</div>
              <div hidden={!tagsLoaded || tags.length > 0}>No tags are here... yet.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
