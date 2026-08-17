import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { deleteArticle as deleteArticleApi, getArticle } from '../../core/api/articles';
import { addComment, deleteComment as deleteCommentApi, getComments } from '../../core/api/comments';
import { ApiError, isAbortError } from '../../core/api/client';
import type { Article, Comment, Errors, Profile } from '../../core/models';
import { defaultImage } from '../../shared/defaultImage';
import { ListErrors } from '../../shared/ListErrors';
import { renderMarkdown } from '../../shared/markdown';
import { ArticleComment } from './ArticleComment';
import { ArticleMeta } from './ArticleMeta';
import { FavoriteButton } from './FavoriteButton';
import { FollowButton } from '../profile/FollowButton';

export function ArticlePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppSelector(state => state.auth.user);
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [errors, setErrors] = useState<Errors | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentFormErrors, setCommentFormErrors] = useState<Errors | null>(null);
  const [deleteCommentErrors, setDeleteCommentErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }

    const controller = new AbortController();
    setArticle(null);
    setErrors(null);

    void Promise.all([getArticle(slug, controller.signal), getComments(slug, controller.signal)])
      .then(([nextArticle, nextComments]) => {
        setArticle(nextArticle);
        setComments(nextComments);
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
        if (err instanceof ApiError) {
          setErrors(err);
        } else {
          setErrors({ errors: { error: ['Failed to load article'] } });
        }
      });

    return () => controller.abort();
  }, [slug]);

  const canModify = useMemo(
    () => !!currentUser && !!article && currentUser.username === article.author.username,
    [currentUser, article],
  );

  const bodyHtml = useMemo(() => (article ? renderMarkdown(article.body) : ''), [article]);

  function onToggleFavorite(favorited: boolean) {
    setArticle(current => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        favorited,
        favoritesCount: favorited ? current.favoritesCount + 1 : current.favoritesCount - 1,
      };
    });
  }

  function toggleFollowing(profile: Profile) {
    setArticle(current => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        author: { ...current.author, following: profile.following },
      };
    });
  }

  async function removeArticle() {
    if (!article) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteArticleApi(article.slug);
      void navigate('/');
    } catch {
      setIsDeleting(false);
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!article) {
      return;
    }
    setIsSubmitting(true);
    setCommentFormErrors(null);
    try {
      const comment = await addComment(article.slug, commentBody);
      setComments(current => [comment, ...current]);
      setCommentBody('');
    } catch (err) {
      setCommentFormErrors(err as Errors);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeComment(comment: Comment) {
    if (!article) {
      return;
    }
    setDeleteCommentErrors(null);
    try {
      await deleteCommentApi(article.slug, comment.id);
      setComments(current => current.filter(item => item.id !== comment.id));
    } catch (err) {
      setDeleteCommentErrors(err as Errors);
    }
  }

  const articleActions = article ? (
    canModify ? (
      <span>
        <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}>
          <i className="ion-edit"></i> Edit Article
        </Link>
        <button
          className={isDeleting ? 'btn btn-sm btn-outline-danger disabled' : 'btn btn-sm btn-outline-danger'}
          type="button"
          onClick={() => void removeArticle()}
        >
          <i className="ion-trash-a"></i> Delete Article
        </button>
      </span>
    ) : (
      <span>
        <FollowButton profile={article.author} onToggle={toggleFollowing} />
        <FavoriteButton article={article} onToggle={onToggleFavorite}>
          {article.favorited ? 'Unfavorite' : 'Favorite'} Article
          <span className="counter">({article.favoritesCount})</span>
        </FavoriteButton>
      </span>
    )
  ) : null;

  return (
    <div className="article-page">
      {errors && (
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ListErrors errors={errors} />
            </div>
          </div>
        </div>
      )}
      {article && (
        <>
          <div className="banner">
            <div className="container">
              <h1>{article.title}</h1>
              <ArticleMeta article={article}>{articleActions}</ArticleMeta>
            </div>
          </div>

          <div className="container page">
            <div className="row article-content">
              <div className="col-md-12">
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
                <ul className="tag-list">
                  {article.tagList.map(tag => (
                    <li key={tag} className="tag-default tag-pill tag-outline">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <hr />

            <div className="article-actions">
              <ArticleMeta article={article}>{articleActions}</ArticleMeta>
            </div>

            <div className="row">
              <div className="col-xs-12 col-md-8 offset-md-2">
                {currentUser ? (
                  <>
                    <ListErrors errors={commentFormErrors} />
                    <form className="card comment-form" onSubmit={e => void submitComment(e)}>
                      <fieldset disabled={isSubmitting}>
                        <div className="card-block">
                          <textarea
                            className="form-control"
                            placeholder="Write a comment..."
                            rows={3}
                            value={commentBody}
                            onChange={e => setCommentBody(e.target.value)}
                          />
                        </div>
                        <div className="card-footer">
                          <img src={defaultImage(currentUser.image)} className="comment-author-img" />
                          <button className="btn btn-sm btn-primary" type="submit">
                            Post Comment
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </>
                ) : (
                  <div>
                    <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments on this
                    article.
                  </div>
                )}

                <ListErrors errors={deleteCommentErrors} />

                {comments.map(comment => (
                  <ArticleComment
                    key={comment.id}
                    comment={comment}
                    onDelete={comment => void removeComment(comment)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
