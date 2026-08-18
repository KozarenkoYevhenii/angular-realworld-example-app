import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import type { Errors } from '../../core/models';
import { ListErrors } from '../../shared/ListErrors';
import { purgeAuth, updateCurrentUser } from '../auth/authSlice';

interface SettingsFormValues {
  image: string;
  username: string;
  bio: string;
  email: string;
  password: string;
}

export function SettingsPage() {
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm<SettingsFormValues>({
    defaultValues: {
      image: '',
      username: '',
      bio: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        image: user.image ?? '',
        username: user.username,
        bio: user.bio ?? '',
        email: user.email,
        password: '',
      });
    }
  }, [user, reset]);

  function logout() {
    dispatch(purgeAuth());
    void navigate('/');
  }

  async function onSubmit(values: SettingsFormValues) {
    setIsSubmitting(true);
    const payload: Partial<SettingsFormValues> = { ...values };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      const updated = await dispatch(updateCurrentUser(payload)).unwrap();
      void navigate(`/profile/${updated.username}`);
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            <ListErrors errors={errors} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="URL of profile picture"
                    {...register('image')}
                    name="image"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Username"
                    {...register('username')}
                    name="username"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <textarea
                    className="form-control form-control-lg"
                    rows={8}
                    placeholder="Short bio about you"
                    {...register('bio')}
                    name="bio"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    name="email"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="password"
                    placeholder="New Password"
                    {...register('password')}
                    name="password"
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">
                  Update Settings
                </button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger" type="button" onClick={logout}>
              Or click here to logout.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
