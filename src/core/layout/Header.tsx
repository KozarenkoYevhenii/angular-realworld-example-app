import { Link, NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { defaultImage } from '../../shared/defaultImage';

export function Header() {
  const authState = useAppSelector(state => state.auth.authState);
  const currentUser = useAppSelector(state => state.auth.user);

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src="/assets/conduit-logo.svg" alt="Conduit" className="navbar-logo" />
        </Link>

        {authState === 'unauthenticated' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/login">
                Sign in
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link active nav-signup' : 'nav-link nav-signup')}
                to="/register"
              >
                Sign up
              </NavLink>
            </li>
          </ul>
        )}

        {authState === 'authenticated' && currentUser && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                to={`/profile/${currentUser.username}`}
              >
                <img src={defaultImage(currentUser.image)} className="user-pic" />
                {currentUser.username}
              </NavLink>
            </li>
          </ul>
        )}

        {authState === 'unavailable' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </NavLink>
            </li>
            <li className="nav-item">
              <span className="nav-link" title="Auth unavailable - retrying automatically">
                <i className="ion-load-c"></i>&nbsp;Connecting...
              </span>
            </li>
          </ul>
        )}

        {authState === 'loading' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link">Loading...</span>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
