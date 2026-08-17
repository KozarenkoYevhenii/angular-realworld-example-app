import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { createArticle, getArticle, updateArticle } from '../../core/api/articles';
import { getCurrentUser } from '../../core/api/user';
import type { Errors } from '../../core/models';
import { ListErrors } from '../../shared/ListErrors';
import { handleAuthFetchError, setAuth } from '../auth/authSlice';
import { isAbortError } from '../../core/api/client';

interface ArticleFormValues {
  title: string;
  description: string;
  body: string;
}

export function EditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagField, setTagField] = useState('');
  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, reset, getValues } = useForm<ArticleFormValues>({
    defaultValues: { title: '', description: '', body: '' },
  });

  useEffect(() => {
    if (!slug) {
      return;
    }

    const controller = new AbortController();

    const userPromise = getCurrentUser(controller.signal)
      .then(({ user }) => {
        dispatch(setAuth(user));
        return user;
      })
      .catch(err => {
        if (!isAbortError(err)) {
          handleAuthFetchError(dispatch, err);
        }
        throw err;
      });

    void Promise.all([getArticle(slug, controller.signal), userPromise])
      .then(([article, user]) => {
        if (user.username === article.author.username) {
          setTagList(article.tagList);
          reset({
            title: article.title,
            description: article.description,
            body: article.body,
          });
        } else {
          void navigate('/');
        }
      })
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
      });

    return () => controller.abort();
  }, [slug, dispatch, navigate, reset]);

  function consumeTagField(currentTags: string[]): string[] {
    const tag = tagField;
    let next = currentTags;
    if (tag != null && tag.trim() !== '' && currentTags.indexOf(tag) < 0) {
      next = [...currentTags, tag];
    }
    setTagList(next);
    setTagField('');
    return next;
  }

  function addTag() {
    consumeTagField(tagList);
  }

  function removeTag(tagName: string) {
    setTagList(tags => tags.filter(tag => tag !== tagName));
  }

  async function submitForm() {
    setIsSubmitting(true);
    const nextTags = consumeTagField(tagList);
    const values = getValues();
    const articleData = {
      ...values,
      tagList: nextTags,
    };

    try {
      const article = slug ? await updateArticle({ ...articleData, slug }) : await createArticle(articleData);
      void navigate(`/article/${article.slug}`);
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ListErrors errors={errors} />
            <form onSubmit={e => e.preventDefault()}>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    {...register('title')}
                    name="title"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    {...register('description')}
                    name="description"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    {...register('body')}
                    name="body"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags"
                    value={tagField}
                    onChange={e => setTagField(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <div className="tag-list">
                    {tagList.map(tag => (
                      <span key={tag} className="tag-default tag-pill">
                        <i className="ion-close-round" onClick={() => removeTag(tag)}></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>
                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="button"
                  onClick={() => void submitForm()}
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
