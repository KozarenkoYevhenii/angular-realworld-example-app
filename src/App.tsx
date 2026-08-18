import { Outlet, Route, Routes } from 'react-router-dom';
import { GuestOnly } from './core/auth/GuestOnly';
import { RequireAuth } from './core/auth/RequireAuth';
import { Footer } from './core/layout/Footer';
import { Header } from './core/layout/Header';
import { ArticlePage } from './features/article/ArticlePage';
import { EditorPage } from './features/article/EditorPage';
import { HomePage } from './features/article/HomePage';
import { AuthPage } from './features/auth/AuthPage';
import { ProfileArticles } from './features/profile/ProfileArticles';
import { ProfileFavorites } from './features/profile/ProfileFavorites';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="tag/:tag" element={<HomePage />} />
        <Route element={<GuestOnly />}>
          <Route path="login" element={<AuthPage />} />
          <Route path="register" element={<AuthPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="settings" element={<SettingsPage />} />
          <Route path="editor" element={<EditorPage />} />
          <Route path="editor/:slug" element={<EditorPage />} />
        </Route>
        <Route path="profile/:username" element={<ProfilePage />}>
          <Route index element={<ProfileArticles />} />
          <Route path="favorites" element={<ProfileFavorites />} />
        </Route>
        <Route path="article/:slug" element={<ArticlePage />} />
      </Route>
    </Routes>
  );
}
