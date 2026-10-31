import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * How each URL is rendered (Angular hybrid rendering).
 * - Public auth pages: prerendered at build time to static HTML, then hydrated in the browser, so
 *   the login form is painted before any JavaScript has run.
 * - Everything else (/business/**): client-side only. These pages need the signed-in user's
 *   session (kept in sessionStorage, which the server cannot see), per-user data and jQuery
 *   plugins (AdminLTE, DataTables) that edit the DOM directly, so server rendering them would add
 *   no value and would break hydration.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: 'auth/register', renderMode: RenderMode.Prerender },
  { path: 'auth/resetpassword', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
