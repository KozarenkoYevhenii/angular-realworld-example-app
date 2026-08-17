# Angular → React mapping

This app was rebuilt from the Angular 21 Conduit frontend. Behavior, routes, selectors, and `window.__conduit_debug__` are preserved for RealWorld e2e conformance. RxJS was **not** ported as operator chains.

## Concept mapping

- **Guard → route wrapper.** Angular `canActivate` (`requireAuth`, guest-only) became [`RequireAuth`](src/core/auth/RequireAuth.tsx) and [`GuestOnly`](src/core/auth/GuestOnly.tsx). Wrappers wait while `authState === 'loading'` (the Angular guard could emit `false` from the initial `null` user). Unauthenticated access to `/settings` and `/editor` still redirects to `/login`. Authenticated visits to `/login` and `/register` redirect to `/`.
- **Resolver → none (load in `useEffect`).** The Angular app had no resolvers; data loaded in `ngOnInit`. React does the same in `useEffect` (no React Router loaders).
- **Interceptor → fetch middleware.** `apiInterceptor` + `tokenInterceptor` + `errorInterceptor` became the ordered pipeline in [`src/core/api/client.ts`](src/core/api/client.ts): prefix `https://api.realworld.show/api`, attach `Authorization: Token <jwt>`, skip 401 logout for `/user`, otherwise `purgeAuth()`, normalize `{ errors, status }` (network fallback included).
- **Injectable service / DI → API module + hooks.** HTTP lives in [`src/core/api/`](src/core/api/). Auth is a Redux slice consumed with `useAppSelector` / `useAppDispatch`. There is no service locator and no RxJS.
- **`BehaviorSubject` auth store → Redux `authSlice`.** `currentUser` and `authState` (`loading | authenticated | unauthenticated | unavailable`) plus token persistence in `localStorage.jwtToken`.
- **HTTP `Observable` + `async` pipe / `takeUntilDestroyed` → `useEffect` + `AbortController`.** Stream-like loads subscribe in an effect and abort on unmount or dependency change. Click/submit handlers may call async functions; they are not long-lived streams.
- **`*ifAuthenticated` → conditional render** from `user` / `authState`.
- **Reactive forms → `react-hook-form`** (login/register, settings, editor). The comment box is a controlled textarea.
- **Pipes → helpers.** `defaultImage`, `formatLongDate`, `renderMarkdown` (`marked` + DOMPurify instead of `DomSanitizer`).
- **OnPush + zoneless signals → React state.** UI updates only when `setState` / Redux runs. Objects are copied, not mutated in place.

## Places Angular change detection / observable lifecycle would be mis-modeled

These Angular patterns look like pipelines. Copying `switchMap` / `combineLatest` / `shareReplay` into React (or wrapping RxJS) would be the wrong model.

1. **Home `combineLatest(isAuthenticated, params, queryParams)`** — not an Rx graph. One `useEffect` on auth + `:tag` + `?feed` + `?page`. `feed=following` while logged out navigates to `/login`. Redirect waits until auth is not `loading`.
2. **Article list `ngOnChanges` + stacked subscriptions** — Angular did not cancel in-flight queries; last **response** won. React aborts the previous request so last **request** wins.
3. **Article page `combineLatest(get(slug), getAll(slug), currentUser)`** — parallel fetch in `useEffect`, then derive `canModify` from the Redux user. Re-fetch when `:slug` changes (Angular used `snapshot` and could skip reuse).
4. **Favorite/Follow `isAuthenticated.pipe(switchMap(...))`** — a leaky hot subscription, not a stream. Read auth synchronously from Redux, then one fetch. Unauthenticated favorite still goes to `/register`; follow still goes to `/login`.
5. **Optimistic favorite vs follow** — favorite toggle ignores the API article body and ± `favoritesCount` locally. Follow applies the **server Profile**.
6. **`shareReplay(1)` on `ProfileService.get` / `getCurrentUser`** — per Observable instance, not an app-wide cache. Profile header and My Posts / Favorited tabs each hit the network.
7. **`takeUntilDestroyed`** — unmount only, not param change. Lists and slug-scoped pages abort on dependency change.
8. **Editor edit load** — still calls HTTP `GET /user` (not the Redux cache) in parallel with `GET /articles/:slug`. Non-owners redirect to `/`.
9. **Comment delete** — Angular filtered by object identity. React deletes by `comment.id`.
10. **Four auth UI states** — header shows Sign in/up, the authenticated nav, **Connecting...**, or **Loading...**. `GET /user`: 4xx clears the token; 5xx/network keeps the token, sets `unavailable`, retries 2s → 4s → 8s → 16s cap.
11. **Zoneless + signals** — Angular only re-rendered when signals / async pipe updated. React will not show in-place mutations; favorite/follow copy the article or profile.
12. **Markdown `async` pipe** — a Promise + sanitizer, not an Observable. Rendered with `marked` and DOMPurify.

## Redux scope

Only auth is global (the old `UserService` subjects). Article lists, comments, tags, and profile remain component state. No RTK Query, no RxJS.
