/**
 * Recovery from a dead login.
 *
 * supabase-js attaches a persisted session's access token to every request,
 * including ones that need no login at all. When that token has expired and
 * cannot be refreshed — the refresh token was revoked, say, by rotating the
 * project's keys — PostgREST rejects the whole request with PGRST303 rather
 * than falling back to the anonymous key. The visible result is a 401 on every
 * table at once and a site that looks empty, for anyone who was ever signed in
 * in that browser.
 *
 * Public pages should never depend on a login, so a rejected token is cleared
 * and the page reloaded as an anonymous visitor.
 */

/** PostgREST's code for a token the server will not accept any more. */
const EXPIRED = "PGRST303";
const FLAG = "supabase-expired-session-cleared";

export interface QueryErrorLike {
  code?: string | null;
  message?: string | null;
}

export const isExpiredSessionError = (error?: QueryErrorLike | null): boolean => {
  if (!error) return false;
  if (error.code === EXPIRED) return true;
  return /jwt expired/i.test(error.message ?? "");
};

/** sessionStorage can throw in a private window, and this must not break then. */
const readFlag = (): boolean => {
  try {
    return window.sessionStorage.getItem(FLAG) === "1";
  } catch {
    return true; // assume already tried, so we never loop
  }
};

const writeFlag = () => {
  try {
    window.sessionStorage.setItem(FLAG, "1");
  } catch {
    /* nothing to do: the guard below still prevents a second attempt */
  }
};

/**
 * Clears the dead session and reloads once. Returns whether it acted, so a
 * caller can skip rendering an error for a page that is about to reload.
 *
 * Guarded by a per-tab flag: if clearing the session does not fix the request,
 * the cause is something else and reloading again would spin forever.
 */
export const recoverFromExpiredSession = async (
  signOut: () => Promise<unknown>,
  reload: () => void = () => window.location.reload(),
): Promise<boolean> => {
  if (readFlag()) return false;
  writeFlag();
  try {
    await signOut();
  } catch {
    /* the reload matters more than a clean sign-out */
  }
  reload();
  return true;
};
