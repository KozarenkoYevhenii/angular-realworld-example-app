import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { favoriteArticle, unfavoriteArticle } from '../../core/api/articles';
import type { Article } from '../../core/models';

export function FavoriteButton({
  article,
  children,
  onToggle,
}: {
  article: Article;
  children?: ReactNode;
  onToggle: (favorited: boolean) => void;
}) {
  const user = useAppSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggleFavorite() {
    if (isSubmitting) {
      return;
    }

    if (!user) {
      void navigate('/register');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!article.favorited) {
        await favoriteArticle(article.slug);
      } else {
        await unfavoriteArticle(article.slug);
      }
      onToggle(!article.favorited);
    } catch {
      // Match Angular: clear submitting, no error UI
    } finally {
      setIsSubmitting(false);
    }
  }

  const classes = [
    'btn',
    'btn-sm',
    isSubmitting ? 'disabled' : '',
    article.favorited ? 'btn-primary' : 'btn-outline-primary',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type="button" onClick={() => void toggleFavorite()}>
      <i className="ion-heart"></i> {children}
    </button>
  );
}
