import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../core/models';
import { ArticleMeta } from './ArticleMeta';
import { FavoriteButton } from './FavoriteButton';

export function ArticlePreview({ article: articleInput }: { article: Article }) {
  const [article, setArticle] = useState(articleInput);

  function toggleFavorite(favorited: boolean) {
    setArticle(current => ({
      ...current,
      favorited,
      favoritesCount: favorited ? current.favoritesCount + 1 : current.favoritesCount - 1,
    }));
  }

  return (
    <div className="article-preview">
      <ArticleMeta article={article}>
        <span className="pull-xs-right">
          <FavoriteButton article={article} onToggle={toggleFavorite}>
            {article.favoritesCount}
          </FavoriteButton>
        </span>
      </ArticleMeta>

      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map(tag => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>
      </Link>
    </div>
  );
}
