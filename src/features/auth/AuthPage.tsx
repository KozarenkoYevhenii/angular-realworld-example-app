import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import type { Errors } from '../../core/models';
import { ListErrors } from '../../shared/ListErrors';
import { login, register } from './authSlice';

interface AuthFormValues {
  username: string;
  email: string;
  password: string;
}

export function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isRegister = location.pathname.endsWith('/register');
  const title = isRegister ? 'Sign up' : 'Sign in';
  const [errors, setErrors] = useState<Errors>({ errors: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { isValid },
  } = useForm<AuthFormValues>({
    mode: 'onChange',
    defaultValues: { username: '', email: '', password: '' },
  });

  async function onSubmit(values: AuthFormValues) {
    setIsSubmitting(true);
    setErrors({ errors: {} });

    try {
      if (isRegister) {
        await dispatch(
          register({ username: values.username, email: values.email, password: values.password }),
        ).unwrap();
      } else {
        await dispatch(login({ email: values.email, password: values.password })).unwrap();
      }
      void navigate('/');
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">{title}</h1>
            <p className="text-xs-center">
              {isRegister ? <Link to="/login">Have an account?</Link> : <Link to="/register">Need an account?</Link>}
            </p>
            <ListErrors errors={errors} />
            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  {isRegister && (
                    <input
                      {...registerField('username', { required: true })}
                      name="username"
                      placeholder="Username"
                      className="form-control form-control-lg"
                      type="text"
                    />
                  )}
                </fieldset>
                <fieldset className="form-group">
                  <input
                    {...registerField('email', { required: true })}
                    name="email"
                    placeholder="Email"
                    className="form-control form-control-lg"
                    type="text"
                  />
                </fieldset>
                <fieldset className="form-group">
                  <input
                    {...registerField('password', { required: true })}
                    name="password"
                    placeholder="Password"
                    className="form-control form-control-lg"
                    type="password"
                  />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" disabled={!isValid} type="submit">
                  {title}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
