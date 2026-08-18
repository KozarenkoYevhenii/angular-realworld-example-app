import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { followUser, unfollowUser } from '../../core/api/profile';
import type { Profile } from '../../core/models';

export function FollowButton({ profile, onToggle }: { profile: Profile; onToggle: (profile: Profile) => void }) {
  const user = useAppSelector(state => state.auth.user);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function toggleFollowing() {
    if (isSubmitting) {
      return;
    }

    if (!user) {
      void navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const next = profile.following ? await unfollowUser(profile.username) : await followUser(profile.username);
      onToggle(next);
    } catch {
      // Match Angular: clear submitting, no error UI
    } finally {
      setIsSubmitting(false);
    }
  }

  const classes = [
    'btn',
    'btn-sm',
    'action-btn',
    isSubmitting ? 'disabled' : '',
    profile.following ? 'btn-secondary' : 'btn-outline-secondary',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} type="button" onClick={() => void toggleFollowing()}>
      <i className="ion-plus-round"></i>
      &nbsp;
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </button>
  );
}
