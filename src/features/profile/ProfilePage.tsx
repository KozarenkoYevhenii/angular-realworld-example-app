import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { ApiError, isAbortError } from '../../core/api/client';
import { getProfile } from '../../core/api/profile';
import type { Errors, Profile } from '../../core/models';
import { defaultImage } from '../../shared/defaultImage';
import { ListErrors } from '../../shared/ListErrors';
import { FollowButton } from './FollowButton';

export function ProfilePage() {
  const { username } = useParams();
  const currentUser = useAppSelector(state => state.auth.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errors, setErrors] = useState<Errors | null>(null);

  useEffect(() => {
    if (!username) {
      return;
    }

    const controller = new AbortController();
    setProfile(null);
    setErrors(null);

    void getProfile(username, controller.signal)
      .then(setProfile)
      .catch(err => {
        if (isAbortError(err)) {
          return;
        }
        if (err instanceof ApiError) {
          setErrors(err);
        } else {
          setErrors({ errors: { error: ['Failed to load profile'] } });
        }
      });

    return () => controller.abort();
  }, [username]);

  const isUser = useMemo(
    () => !!profile && profile.username === currentUser?.username,
    [profile, currentUser?.username],
  );

  return (
    <div className="profile-page">
      {errors && (
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <ListErrors errors={errors} />
            </div>
          </div>
        </div>
      )}
      {profile && (
        <>
          <div className="user-info">
            <div className="container">
              <div className="row">
                <div className="col-xs-12 col-md-10 offset-md-1">
                  <img src={defaultImage(profile.image)} className="user-img" />
                  <h4>{profile.username}</h4>
                  <p>{profile.bio ?? ''}</p>
                  {!isUser && <FollowButton profile={profile} onToggle={setProfile} />}
                  {isUser && (
                    <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
                      <i className="ion-gear-a"></i> Edit Profile Settings
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <div className="articles-toggle">
                  <ul className="nav nav-pills outline-active">
                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                        to={`/profile/${profile.username}`}
                        end
                      >
                        My Posts
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                        to={`/profile/${profile.username}/favorites`}
                        end
                      >
                        Favorited Posts
                      </NavLink>
                    </li>
                  </ul>
                </div>
                <Outlet />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
