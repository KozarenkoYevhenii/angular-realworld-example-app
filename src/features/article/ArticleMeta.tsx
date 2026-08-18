import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../../core/models';
import { defaultImage } from '../../shared/defaultImage';
import { formatLongDate } from '../../shared/formatDate';

export function ArticleMeta({ article, children }: { article: Article; children?: ReactNode }) {
  return (
    <div className="article-meta">
      <Link to={`/profile/${article.author.username}`}>
        <img src={defaultImage(article.author.image)} />
      </Link>

      <div className="info">
        <Link className="author" to={`/profile/${article.author.username}`}>
          {article.author.username}
        </Link>
        <span className="date">{formatLongDate(article.createdAt)}</span>
      </div>

      {children}
    </div>
  );
}
